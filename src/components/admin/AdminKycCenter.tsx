import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  AlertTriangle,
  Clock3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  User,
} from 'lucide-react';

type KycStatus = 'not_started' | 'pending' | 'under_review' | 'needs_info' | 'verified' | 'rejected';

interface AdminKycRequest {
  id: string;
  uid: string;
  status: KycStatus;
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  pan?: string;
  gstin?: string;
  userName?: string;
  userEmail?: string;
  userMobile?: string;
  userType?: string;
  aadhaarLast4?: string;
  notes?: string;
  createdAt?: any;
  documents?: {
    aadhaarZipUrl?: string;
    panUrl?: string;
    gstUrl?: string;
    licenseUrl?: string;
  };
  licenses?: {
    type?: string;
    number?: string;
    state?: string;
    expiry?: string;
    documentUrl?: string;
  }[];
}

const statusTone: Record<KycStatus, { label: string; className: string }> = {
  not_started: { label: 'Not started', className: 'bg-gray-100 text-gray-700' },
  pending: { label: 'Submitted', className: 'bg-amber-100 text-amber-700' },
  under_review: { label: 'Under review', className: 'bg-blue-100 text-blue-700' },
  needs_info: { label: 'Need info', className: 'bg-orange-100 text-orange-700' },
  verified: { label: 'Verified', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

const formatDate = (value?: any) => {
  if (!value) return '—';
  if (value.toDate) return value.toDate().toLocaleString();
  return new Date(value).toLocaleString();
};

const AdminKycCenter: React.FC = () => {
  const [requests, setRequests] = useState<AdminKycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | KycStatus>('pending');

  const noteTemplates: Record<KycStatus, string> = {
    pending: '',
    under_review: 'Moving to review queue.',
    needs_info: 'Documents unclear. Please re-upload PAN/Aadhaar ZIP with share code and ensure license details are readable.',
    rejected: 'Details could not be verified (PAN/GST/license mismatch). Please correct and resubmit.',
    verified: 'Documents verified. PAN/GST/license match provided details.',
    not_started: '',
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'kycRequests'), orderBy('createdAt', 'desc'), limit(30));
      const snap = await getDocs(q);
      const items: AdminKycRequest[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Partial<AdminKycRequest>;
        items.push({
          id: docSnap.id,
          status: (data.status as KycStatus) || 'pending',
          ...data,
        } as AdminKycRequest);
      });
      setRequests(items);
    } catch (error) {
      console.error('Error loading KYC requests', error);
      toast({
        title: 'Failed to load KYC queue',
        description: 'Please retry.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateStatus = async (req: AdminKycRequest, status: KycStatus) => {
    let notes = req.notes || noteTemplates[status] || '';
    if (status === 'needs_info' || status === 'rejected') {
      const input = window.prompt('Add a note for the user', notes);
      if (input === null) return;
      notes = input || noteTemplates[status];
    }

    setSavingId(req.id);
    try {
      await updateDoc(doc(db, 'kycRequests', req.id), {
        status,
        notes,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', req.uid), {
        kycStatus: status,
        kycRequestId: req.id,
        kycNotes: notes,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'KYC status updated',
        description: `${req.userName || req.uid} marked as ${statusTone[status].label}`,
      });
      await loadRequests();
    } catch (error) {
      console.error('Failed to update KYC status', error);
      toast({
        title: 'Update failed',
        description: 'Could not update KYC status.',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const filtered = statusFilter === 'all'
    ? requests
    : requests.filter((req) => req.status === statusFilter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>KYC Queue</CardTitle>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under review</SelectItem>
              <SelectItem value="needs_info">Needs info</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-sm text-gray-600">Loading KYC submissions...</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-gray-600">No KYC submissions yet.</div>
        ) : (
          filtered.map((req) => (
            <div key={req.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {req.userName || 'Unknown user'} ({req.userType || '—'})
                    </p>
                    <p className="text-xs text-gray-500">Request ID: {req.id}</p>
                  </div>
                </div>
                <Badge className={statusTone[req.status].className}>{statusTone[req.status].label}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{req.userMobile || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{req.userEmail || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span>PAN {req.pan || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gray-500" />
                  <span>GST {req.gstin || '—'}</span>
                </div>
                {req.businessName && (
                  <div className="flex items-start gap-2 col-span-1 md:col-span-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{req.businessName}</p>
                      <p className="text-xs text-gray-600">{req.businessAddress || req.businessType}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                <span>Submitted: {formatDate(req.createdAt)}</span>
                {req.aadhaarLast4 && <span>• Aadhaar last 4: {req.aadhaarLast4}</span>}
              </div>

              {req.documents && (
                <div className="flex flex-wrap gap-2">
                  {req.documents.aadhaarZipUrl && (
                    <Button variant="outline" size="sm" onClick={() => window.open(req.documents?.aadhaarZipUrl, '_blank')}>
                      Aadhaar ZIP
                    </Button>
                  )}
                  {req.documents.panUrl && (
                    <Button variant="outline" size="sm" onClick={() => window.open(req.documents?.panUrl, '_blank')}>
                      PAN Proof
                    </Button>
                  )}
                  {req.documents.gstUrl && (
                    <Button variant="outline" size="sm" onClick={() => window.open(req.documents?.gstUrl, '_blank')}>
                      GST Proof
                    </Button>
                  )}
                  {req.documents.licenseUrl && (
                    <Button variant="outline" size="sm" onClick={() => window.open(req.documents?.licenseUrl, '_blank')}>
                      License Proof
                    </Button>
                  )}
                </div>
              )}

              {req.licenses && req.licenses.length > 0 && (
                <div className="text-sm text-gray-700">
                  <p className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Licenses
                  </p>
                  <ul className="list-disc list-inside text-gray-600">
                    {req.licenses.map((lic, idx) => (
                      <li key={`${req.id}-lic-${idx}`}>
                        {lic.type || 'License'} {lic.number ? `#${lic.number}` : ''}{' '}
                        {lic.state ? `(${lic.state})` : ''} {lic.expiry ? `valid till ${lic.expiry}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {req.notes && (
                <div className="text-sm text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{req.notes}</span>
                </div>
              )}

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(req, 'under_review')}
                  disabled={savingId === req.id}
                >
                  Move to Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(req, 'needs_info')}
                  disabled={savingId === req.id}
                >
                  Request Info
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => updateStatus(req, 'rejected')}
                  disabled={savingId === req.id}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateStatus(req, 'verified')}
                  disabled={savingId === req.id}
                >
                  Approve & Verify
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AdminKycCenter;
