import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Info,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from 'lucide-react';

type KycStatus = 'not_started' | 'pending' | 'under_review' | 'needs_info' | 'verified' | 'rejected';

interface KycRequest {
  id: string;
  uid: string;
  status: KycStatus;
  kycLevel?: 'basic' | 'business';
  pan?: string;
  gstin?: string;
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  userName?: string;
  userEmail?: string;
  userMobile?: string;
  userType?: string;
  aadhaarLast4?: string;
  aadhaarShareCode?: string;
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
  notes?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

const statusMeta: Record<
  KycStatus,
  { label: string; tone: string; bg: string; hint: string; progress: number }
> = {
  not_started: {
    label: 'Not started',
    tone: 'text-gray-700',
    bg: 'bg-gray-100',
    hint: 'Submit India KYC to unlock verified badge, higher bid limits, and escrow withdrawals.',
    progress: 5,
  },
  pending: {
    label: 'Submitted',
    tone: 'text-amber-700',
    bg: 'bg-amber-100',
    hint: 'Documents received. Review happens on Indian working days (IST).',
    progress: 45,
  },
  under_review: {
    label: 'Under review',
    tone: 'text-blue-700',
    bg: 'bg-blue-100',
    hint: 'An admin is validating PAN, Aadhaar (offline), GST, and licenses.',
    progress: 65,
  },
  needs_info: {
    label: 'Need more info',
    tone: 'text-orange-700',
    bg: 'bg-orange-100',
    hint: 'Re-submit with clearer scans or the requested corrections.',
    progress: 35,
  },
  rejected: {
    label: 'Rejected',
    tone: 'text-red-700',
    bg: 'bg-red-100',
    hint: 'Correct the details/scans and re-submit.',
    progress: 25,
  },
  verified: {
    label: 'Verified',
    tone: 'text-green-700',
    bg: 'bg-green-100',
    hint: 'Identity and business details verified.',
    progress: 100,
  },
};

const entityTypes = [
  { value: 'individual', label: 'Individual' },
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'LLP' },
  { value: 'pvt_ltd', label: 'Private Limited' },
  { value: 'public_ltd', label: 'Public Limited' },
  { value: 'society_trust', label: 'Society / Trust' },
];

const licenseTypes = [
  { value: 'cpwd', label: 'CPWD' },
  { value: 'state_pwd', label: 'State PWD' },
  { value: 'pmay', label: 'PMAY / PMAY-U' },
  { value: 'railways', label: 'Railways' },
  { value: 'mes', label: 'MES' },
  { value: 'psu', label: 'PSU / Govt Undertaking' },
  { value: 'private', label: 'Private / Other' },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

const humanizeDate = (value?: Timestamp | Date) => {
  if (!value) return '';
  const date = value instanceof Timestamp ? value.toDate() : value;
  return date.toLocaleString();
};

const KycStatusCard: React.FC = () => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [latestRequest, setLatestRequest] = useState<KycRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [formData, setFormData] = useState({
    pan: '',
    gstin: '',
    businessName: '',
    businessType: 'individual',
    businessAddress: '',
    aadhaarLast4: '',
    aadhaarShareCode: '',
    licenseType: '',
    licenseNumber: '',
    licenseState: '',
    licenseExpiry: '',
    experienceYears: '',
    categories: '',
    notes: '',
  });
  const [files, setFiles] = useState<{
    aadhaarZip: File | null;
    panProof: File | null;
    gstProof: File | null;
    licenseProof: File | null;
  }>({
    aadhaarZip: null,
    panProof: null,
    gstProof: null,
    licenseProof: null,
  });

  const status: KycStatus = useMemo(() => {
    const fromProfile = (userProfile?.kycStatus as KycStatus) || 'not_started';
    if (fromProfile === 'verified') return 'verified';
    return latestRequest?.status || fromProfile;
  }, [latestRequest?.status, userProfile?.kycStatus]);

  const statusInfo = statusMeta[status] || statusMeta.not_started;
  const canSubmit =
    status === 'not_started' || status === 'needs_info' || status === 'rejected';

  const loadLatestRequest = useCallback(async () => {
    if (!currentUser) return;
    setLoadingRequest(true);
    try {
      const q = query(
        collection(db, 'kycRequests'),
        where('uid', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data() as Partial<KycRequest>;
        setLatestRequest({
          id: docSnap.id,
          status: (data.status as KycStatus) || 'pending',
          ...data,
        } as KycRequest);
      } else {
        setLatestRequest(null);
      }
    } catch (error) {
      console.error('Error loading KYC request', error);
      toast({
        title: 'Could not load KYC status',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoadingRequest(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    loadLatestRequest();
  }, [loadLatestRequest]);

  useEffect(() => {
    if (!userProfile) return;
    setFormData((prev) => ({
      ...prev,
      businessName:
        prev.businessName ||
        userProfile.companyName ||
        userProfile.fullName ||
        '',
      experienceYears:
        prev.experienceYears ||
        (userProfile.experience ? String(userProfile.experience) : ''),
    }));
  }, [userProfile]);

  useEffect(() => {
    if (!latestRequest) return;
    setFormData((prev) => ({
      ...prev,
      pan: latestRequest.pan || prev.pan,
      gstin: latestRequest.gstin || prev.gstin,
      businessName: latestRequest.businessName || prev.businessName,
      businessType: latestRequest.businessType || prev.businessType,
      businessAddress: latestRequest.businessAddress || prev.businessAddress,
      aadhaarLast4: latestRequest.aadhaarLast4 || prev.aadhaarLast4,
      licenseType: latestRequest.licenses?.[0]?.type || prev.licenseType,
      licenseNumber: latestRequest.licenses?.[0]?.number || prev.licenseNumber,
      licenseState: latestRequest.licenses?.[0]?.state || prev.licenseState,
      licenseExpiry: latestRequest.licenses?.[0]?.expiry || prev.licenseExpiry,
      categories: prev.categories,
      notes: latestRequest.notes || prev.notes,
    }));
  }, [latestRequest]);

  if (!currentUser || !userProfile) {
    return null;
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof files
  ) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const uploadIfPresent = async (file: File | null, key: string) => {
    if (!file) return undefined;
    const path = `kyc/${currentUser.uid}/${Date.now()}_${key}_${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const validateInputs = () => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
    if (!formData.pan || !panRegex.test(formData.pan.trim())) {
      toast({
        title: 'PAN looks invalid',
        description: 'Enter a valid PAN in uppercase (e.g., ABCDE1234F).',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.gstin && !gstRegex.test(formData.gstin.trim())) {
      toast({
        title: 'GSTIN looks invalid',
        description: 'Enter a valid 15-character GSTIN or leave it blank.',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.aadhaarLast4 || formData.aadhaarLast4.trim().length !== 4) {
      toast({
        title: 'Add Aadhaar last 4 digits',
        description: 'Provide only the last 4 digits for privacy.',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.aadhaarShareCode || formData.aadhaarShareCode.length < 4) {
      toast({
        title: 'Share code required',
        description: 'Enter the 4-digit Aadhaar offline share code.',
        variant: 'destructive',
      });
      return false;
    }

    if (!files.aadhaarZip) {
      toast({
        title: 'Upload Aadhaar offline ZIP',
        description: 'Download from UIDAI and upload the ZIP file.',
        variant: 'destructive',
      });
      return false;
    }

    if (userProfile.userType === 'contractor' && !formData.businessName) {
      toast({
        title: 'Business name required',
        description: 'Add your company/firm name to continue.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const [aadhaarZipUrl, panUrl, gstUrl, licenseUrl] = await Promise.all([
        uploadIfPresent(files.aadhaarZip, 'aadhaar'),
        uploadIfPresent(files.panProof, 'pan'),
        uploadIfPresent(files.gstProof, 'gst'),
        uploadIfPresent(files.licenseProof, 'license'),
      ]);

      const licenseEntry =
        formData.licenseType || formData.licenseNumber || formData.licenseState
          ? [
              {
                type: formData.licenseType,
                number: formData.licenseNumber,
                state: formData.licenseState,
                expiry: formData.licenseExpiry,
                documentUrl: licenseUrl,
              },
            ]
          : [];

      const payload: Omit<KycRequest, 'id'> = {
        uid: currentUser.uid,
        status: 'pending',
        kycLevel: 'business',
        pan: formData.pan.trim().toUpperCase(),
        gstin: formData.gstin.trim().toUpperCase(),
        businessName: formData.businessName.trim(),
        businessType: formData.businessType,
        businessAddress: formData.businessAddress.trim(),
        userName: userProfile.fullName,
        userEmail: userProfile.email || currentUser.email || '',
        userMobile: userProfile.mobile,
        userType: userProfile.userType,
        aadhaarLast4: formData.aadhaarLast4.trim(),
        aadhaarShareCode: formData.aadhaarShareCode.trim(),
        licenses: licenseEntry,
        notes: formData.notes.trim(),
        documents: {
          aadhaarZipUrl,
          panUrl,
          gstUrl,
          licenseUrl,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'kycRequests'), payload);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        kycStatus: 'pending',
        kycLevel: 'business',
        kycRequestId: docRef.id,
        kycSubmittedAt: serverTimestamp(),
      });

      await refreshUserProfile();
      await loadLatestRequest();
      setFiles({
        aadhaarZip: null,
        panProof: null,
        gstProof: null,
        licenseProof: null,
      });
      toast({
        title: 'KYC submitted',
        description: 'We have received your documents. Review typically takes 1-2 business days.',
      });
    } catch (error) {
      console.error('KYC submission failed', error);
      toast({
        title: 'Could not submit KYC',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = () => {
    switch (status) {
      case 'verified':
        return <ShieldCheck className="h-5 w-5 text-green-600" />;
      case 'pending':
      case 'under_review':
        return <Clock3 className="h-5 w-5 text-blue-600" />;
      case 'needs_info':
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <ShieldAlert className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleRefresh = async () => {
    await refreshUserProfile();
    await loadLatestRequest();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {statusIcon()}
          <div>
            <CardTitle>KYC and Business Verification</CardTitle>
            <CardDescription>{statusInfo.hint}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${statusInfo.bg} ${statusInfo.tone}`}>
            {statusInfo.label}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loadingRequest}
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            {loadingRequest ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Progress toward verified badge
            </span>
            <span className="text-sm font-medium">{statusInfo.progress}%</span>
          </div>
          <Progress value={statusInfo.progress} />
        </div>

        <div className="rounded-md border border-blue-100 bg-blue-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-900">
            <Info className="h-4 w-4" />
            <span className="font-semibold">What to keep ready (India)</span>
          </div>
          <ul className="list-disc list-inside text-sm text-blue-900 space-y-1">
            <li>PAN (mandatory) — upload clear front scan; keep it uppercase (e.g., ABCDE1234F).</li>
            <li>Aadhaar Offline XML ZIP + 4-digit share code — download “Masked Aadhaar” from UIDAI.</li>
            <li>GSTIN (optional for individuals; required for registered businesses).</li>
            <li>Govt license (CPWD / State PWD / PMAY etc.) with registration number and state.</li>
            <li>File types: PDF/JPG/PNG; suggested size &lt; 8 MB per file.</li>
          </ul>
          <p className="text-xs text-blue-800">
            We store only the last 4 digits of Aadhaar. Reviews typically complete in 1–2 working days (IST).
          </p>
        </div>

        {latestRequest && (
          <div className="rounded-md border border-gray-100 p-3 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Latest request ID: {latestRequest.id}</span>
              </div>
              <div className="text-xs text-gray-500">
                Submitted {humanizeDate(latestRequest.createdAt)}
              </div>
            </div>
            {latestRequest.notes && (
              <div className="mt-2 text-sm text-orange-700 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5" />
                <span>{latestRequest.notes}</span>
              </div>
            )}
          </div>
        )}

        {status === 'verified' ? (
          <div className="flex items-center gap-3 rounded-md bg-green-50 border border-green-200 p-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Your KYC is verified. No further action is needed.
              </p>
              <p className="text-xs text-green-800">
                We will re-prompt you only if documents expire or you update business details.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pan">PAN *</Label>
                <Input
                  id="pan"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F (uppercase as per PAN)"
                  disabled={!canSubmit || loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN (optional)</Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="22ABCDE1234F1Z5"
                  disabled={!canSubmit || loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Business / Individual name {userProfile.userType === 'contractor' ? '*' : '(optional)'}
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Registered name as per PAN/GST"
                  disabled={!canSubmit || loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Entity type</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                  disabled={!canSubmit || loading}
                >
                  <SelectTrigger id="businessType">
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="businessAddress">Registered address</Label>
                <Textarea
                  id="businessAddress"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  placeholder="Building, street, city, state, PIN"
                  disabled={!canSubmit || loading}
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aadhaarLast4">Aadhaar last 4 digits *</Label>
                <Input
                  id="aadhaarLast4"
                  value={formData.aadhaarLast4}
                  onChange={(e) => setFormData({ ...formData, aadhaarLast4: e.target.value })}
                  placeholder="1234"
                  disabled={!canSubmit || loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaarShareCode">Aadhaar share code *</Label>
                <Input
                  id="aadhaarShareCode"
                  value={formData.aadhaarShareCode}
                  onChange={(e) => setFormData({ ...formData, aadhaarShareCode: e.target.value })}
                  placeholder="4-digit code from UIDAI"
                  disabled={!canSubmit || loading}
                />
                <p className="text-xs text-gray-500">
                  Download masked Aadhaar ZIP from UIDAI (MyAadhaar &gt; Download Aadhaar) and enter the 4-digit share code you set there.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaarZip">Aadhaar offline ZIP *</Label>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer hover:border-blue-300">
                      <span className="flex items-center gap-2 text-gray-700">
                        <Upload className="h-4 w-4" />
                        {files.aadhaarZip ? files.aadhaarZip.name : 'Upload ZIP'}
                      </span>
                      <span className="text-xs text-gray-500">ZIP</span>
                    </div>
                    <input
                      id="aadhaarZip"
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'aadhaarZip')}
                      disabled={!canSubmit || loading}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="panProof">PAN proof (image/PDF)</Label>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer hover:border-blue-300">
                      <span className="flex items-center gap-2 text-gray-700">
                        <Upload className="h-4 w-4" />
                        {files.panProof ? files.panProof.name : 'Upload PAN'}
                      </span>
                      <span className="text-xs text-gray-500">PDF/JPG</span>
                    </div>
                    <input
                      id="panProof"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'panProof')}
                      disabled={!canSubmit || loading}
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstProof">GST certificate (optional)</Label>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer hover:border-blue-300">
                      <span className="flex items-center gap-2 text-gray-700">
                        <Upload className="h-4 w-4" />
                        {files.gstProof ? files.gstProof.name : 'Upload GST cert'}
                      </span>
                      <span className="text-xs text-gray-500">PDF/JPG</span>
                    </div>
                    <input
                      id="gstProof"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'gstProof')}
                      disabled={!canSubmit || loading}
                    />
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-900">Government licenses (optional but recommended)</div>
              <p className="text-xs text-gray-600">
                Add CPWD / State PWD / PMAY or equivalent registrations to improve trust and eligibility for public-sector style work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseType">License category</Label>
                <Select
                  value={formData.licenseType}
                  onValueChange={(value) => setFormData({ ...formData, licenseType: value })}
                  disabled={!canSubmit || loading}
                >
                  <SelectTrigger id="licenseType">
                    <SelectValue placeholder="Select license category" />
                  </SelectTrigger>
                  <SelectContent>
                    {licenseTypes.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License number</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="Registration number"
                  disabled={!canSubmit || loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseState">Issuing state</Label>
                <Select
                  value={formData.licenseState}
                  onValueChange={(value) => setFormData({ ...formData, licenseState: value })}
                  disabled={!canSubmit || loading}
                >
                  <SelectTrigger id="licenseState">
                    <SelectValue placeholder="Select issuing state/UT" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseExpiry">Validity / expiry</Label>
                <Input
                  id="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  placeholder="DD/MM/YYYY or validity text"
                  disabled={!canSubmit || loading}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="licenseProof">License proof</Label>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer hover:border-blue-300">
                      <span className="flex items-center gap-2 text-gray-700">
                        <Upload className="h-4 w-4" />
                        {files.licenseProof ? files.licenseProof.name : 'Upload license proof'}
                      </span>
                      <span className="text-xs text-gray-500">PDF/JPG</span>
                    </div>
                    <input
                      id="licenseProof"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'licenseProof')}
                      disabled={!canSubmit || loading}
                    />
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="notes">Notes for reviewer</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add clarifications like MSME certificate, turnover band, or recent government projects."
                disabled={!canSubmit || loading}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span>
                  Files stay private to you and platform admins. Aadhaar number is stored only as last 4 digits.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={!canSubmit || loading}>
                {loading ? 'Submitting...' : status === 'needs_info' || status === 'rejected' ? 'Resubmit KYC' : 'Submit KYC'}
              </Button>
              {!canSubmit && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock3 className="h-4 w-4" />
                  <span>We will notify you when the review is done.</span>
                </div>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default KycStatusCard;
