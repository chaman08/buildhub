import React, { useEffect, useState } from 'react';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Activity, CheckCircle2, Clock } from 'lucide-react';

type ProgressStatus = 'not_started' | 'in_progress' | 'awaiting_customer' | 'blocked' | 'at_risk' | 'completed';

interface ProjectProgressUpdate {
  id: string;
  projectId: string;
  projectTitle?: string;
  note: string;
  status: ProgressStatus;
  percentComplete: number;
  createdBy: string;
  createdByName?: string;
  createdByType?: 'customer' | 'contractor';
  createdAt?: any;
  photos?: string[];
}

interface ProjectProgressDialogProps {
  projectId: string;
  projectTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<ProgressStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  awaiting_customer: 'Waiting on customer',
  blocked: 'Blocked',
  at_risk: 'At risk',
  completed: 'Completed'
};

const statusTone: Record<ProgressStatus, string> = {
  not_started: 'bg-gray-100 text-gray-800 border-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  awaiting_customer: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  blocked: 'bg-red-100 text-red-800 border-red-200',
  at_risk: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-100 text-green-800 border-green-200'
};

const formatTimestamp = (value: any) => {
  if (!value) return '';
  try {
    const date = value.toDate ? value.toDate() : new Date(value);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};

const ProjectProgressDialog: React.FC<ProjectProgressDialogProps> = ({
  projectId,
  projectTitle,
  open,
  onOpenChange
}) => {
  const { currentUser, userProfile } = useAuth();
  const [updates, setUpdates] = useState<ProjectProgressUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<ProgressStatus>('in_progress');
  const [percentComplete, setPercentComplete] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (open && projectId) {
      fetchUpdates();
    }
  }, [open, projectId]);

  useEffect(() => {
    if (updates.length > 0) {
      setStatus(updates[0].status);
      setPercentComplete(updates[0].percentComplete);
    }
  }, [updates]);

  const fetchUpdates = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const progressQuery = query(
        collection(db, 'projectProgress'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(progressQuery);
      const progressData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectProgressUpdate[];

      setUpdates(progressData);
      if (progressData.length === 0) {
        setPercentComplete(0);
        setStatus('in_progress');
      }
    } catch (error) {
      console.error('Error loading progress updates:', error);
      toast({
        title: 'Could not load progress',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) {
      toast({
        title: 'Sign in to post updates',
        description: 'You need to be logged in to add project progress.',
        variant: 'destructive'
      });
      return;
    }

    const percentValue = Number(percentComplete);
    if (Number.isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
      toast({
        title: 'Invalid percentage',
        description: 'Progress percentage must be between 0 and 100.',
        variant: 'destructive'
      });
      return;
    }

    if (!note.trim()) {
      toast({
        title: 'Add a short note',
        description: 'Share a quick update so everyone stays aligned.',
        variant: 'destructive'
      });
      return;
    }

    if (files.length > 5) {
      toast({
        title: 'Too many photos',
        description: 'Please attach up to 5 images per update.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      let photoUrls: string[] = [];

      if (files.length) {
        const uploads = files.map(async (file) => {
          if (file.size > 10 * 1024 * 1024) {
            throw new Error('File too large (max 10MB).');
          }
          const safeName = file.name.replace(/\s+/g, '-');
          const storageRef = ref(storage, `projectProgress/${projectId}/${Date.now()}-${currentUser.uid}-${safeName}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        });
        photoUrls = await Promise.all(uploads);
      }

      const payload = {
        projectId,
        projectTitle,
        note: note.trim(),
        status,
        percentComplete: percentValue,
        createdBy: currentUser.uid,
        createdByName: userProfile.fullName,
        createdByType: userProfile.userType,
        createdAt: serverTimestamp(),
        photos: photoUrls
      };

      const docRef = await addDoc(collection(db, 'projectProgress'), payload);
      setUpdates(prev => [
        { ...payload, id: docRef.id, createdAt: new Date() },
        ...prev
      ]);
      setNote('');
      setFiles([]);
      toast({
        title: 'Progress shared',
        description: 'Update sent to the customer and contractor.',
      });
    } catch (error) {
      console.error('Error saving progress update:', error);
      toast({
        title: 'Could not save update',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const latestPercent = updates[0]?.percentComplete ?? percentComplete;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Project progress
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Project</p>
                <p className="font-semibold text-gray-900">{projectTitle}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Overall progress</p>
                <p className="text-2xl font-bold text-blue-700">
                  {Math.round(latestPercent)}%
                </p>
              </div>
            </div>
            <Progress value={latestPercent} className="mt-3 h-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <form onSubmit={handleCreateUpdate} className="space-y-3 border rounded-lg p-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: ProgressStatus) => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="percentComplete">Percent complete</Label>
                <Input
                  id="percentComplete"
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={percentComplete}
                  onChange={(e) => setPercentComplete(Number(e.target.value))}
                  placeholder="e.g., 40"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note">What changed?</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Share a quick update, blockers, or next steps."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="photos">Add photos (optional)</Label>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
                {files.length > 0 && (
                  <div className="text-xs text-gray-600">
                    {files.length} file{files.length > 1 ? 's' : ''} selected
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setNote('');
                    setStatus('in_progress');
                    setPercentComplete(latestPercent);
                    setFiles([]);
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Share update'}
                </Button>
              </div>
            </form>

            <div className="border rounded-lg p-4 space-y-3 max-h-[420px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Latest updates</span>
                </div>
                <Badge variant="outline">{updates.length} entries</Badge>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-6 text-gray-500">
                  Loading progress...
                </div>
              ) : updates.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No updates yet. Share the first milestone to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {updates.map((update) => (
                    <div key={update.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={statusTone[update.status]} variant="outline">
                          {statusLabels[update.status]}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatTimestamp(update.createdAt)}</span>
                      </div>
                      <div className="text-sm text-gray-800 whitespace-pre-line">
                        {update.note}
                      </div>
                      {update.photos && update.photos.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {update.photos.map((photo, idx) => (
                            <a
                              key={`${update.id}-photo-${idx}`}
                              href={photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={photo}
                                alt="Progress update"
                                className="w-full h-28 object-cover rounded-md border"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>
                          {update.createdByName || 'Someone'} ({update.createdByType || 'member'})
                        </span>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span>{Math.round(update.percentComplete)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectProgressDialog;
