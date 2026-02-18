import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Plus,
  MapPin,
  DollarSign,
  Clock,
  UploadCloud,
  FileText,
  ShieldCheck,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, serverTimestamp, setDoc, query, where, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { INDIA_STATES, STATE_CITIES } from '@/lib/india-locations';
import ServiceCategorySelector from '../ServiceCategorySelector';
import { createNewProjectNotification } from '@/utils/notifications';

interface PostProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface UploadedAttachment {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

const PostProjectForm: React.FC<PostProjectFormProps> = ({ onSuccess, onCancel }) => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [posting, setPosting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    state: '',
    budget: '',
    budgetMax: '',
    startDate: '',
    expectedDuration: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    projectType: 'residential' as 'residential' | 'commercial' | 'industrial' | 'government',
    requiresPermits: false,
    materials: '',
    specialRequirements: ''
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(files.slice(0, 5));
  };

  const removeAttachment = (fileName: string) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName));
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addCustomCategory = () => {
    if (customCategory.trim() && !selectedCategories.includes(customCategory.trim())) {
      setSelectedCategories(prev => [...prev, customCategory.trim()]);
      setCustomCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== category));
  };

  const formatCurrency = (value?: string) => {
    if (!value) return 'Not set';
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return 'Not set';
    return `NGN ${numeric.toLocaleString()}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return 'Not set';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Not set';
    return parsed.toLocaleDateString();
  };

  const uploadProjectAttachments = async (projectId: string): Promise<UploadedAttachment[]> => {
    if (!attachments.length) return [];

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'application/pdf'
    ];
    const maxSize = 10 * 1024 * 1024;

    const uploads = attachments.map(async (file) => {
      if (file.size > maxSize) {
        throw new Error(`File "${file.name}" is larger than 10MB.`);
      }
      if (!file.type) {
        throw new Error(`Unsupported file type for "${file.name}". Please upload images or PDFs.`);
      }
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type for "${file.name}". Please upload images or PDFs.`);
      }

      const safeName = file.name.replace(/\s+/g, '-');
      const storageRef = ref(storage, `projectAttachments/${projectId}/${Date.now()}-${safeName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      return {
        url,
        name: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size
      };
    });

    return Promise.all(uploads);
  };

  const submitProject = async (isDraft: boolean, e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a project",
        variant: "destructive"
      });
      return;
    }

    if (!isDraft && selectedCategories.length === 0) {
      toast({
        title: "Category Required",
        description: "Please select at least one service category",
        variant: "destructive"
      });
      return;
    }

    const minBudget = Number(formData.budget);
    const maxBudget = formData.budgetMax ? Number(formData.budgetMax) : undefined;
    if (!isDraft && (Number.isNaN(minBudget) || minBudget <= 0)) {
      toast({
        title: "Budget Required",
        description: "Please enter a valid minimum budget above 0",
        variant: "destructive"
      });
      return;
    }

    if (!isDraft && maxBudget && maxBudget < minBudget) {
      toast({
        title: "Budget Range",
        description: "Maximum budget should be greater than or equal to minimum budget",
        variant: "destructive"
      });
      return;
    }

    if (!isDraft && formData.startDate && new Date(formData.startDate) < new Date(new Date().toDateString())) {
      toast({
        title: "Start Date",
        description: "Start date cannot be in the past",
        variant: "destructive"
      });
      return;
    }

    const setBusyState = isDraft ? setSavingDraft : setPosting;
    setBusyState(true);

    try {
      const projectRef = doc(collection(db, 'projects'));
      const baseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: selectedCategories,
        city: formData.city,
        state: formData.state,
        location: `${formData.city}, ${formData.state}`,
        budget: formData.budget ? Number(formData.budget) : null,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : null,
        startDate: formData.startDate || null,
        expectedDuration: formData.expectedDuration.trim(),
        urgency: formData.urgency,
        projectType: formData.projectType,
        requiresPermits: formData.requiresPermits,
        materials: formData.materials.trim(),
        specialRequirements: formData.specialRequirements.trim(),
        postedBy: currentUser.uid,
        postedByType: userProfile?.userType || 'customer',
        status: isDraft ? 'draft' : 'open',
        attachments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Create the project first so storage rules allow attachment uploads
      await setDoc(projectRef, baseData);

      const attachmentUploads = await uploadProjectAttachments(projectRef.id);
      if (attachmentUploads.length) {
        await setDoc(projectRef, { attachments: attachmentUploads, updatedAt: serverTimestamp() }, { merge: true });
      }

      // Notify relevant contractors
      if (!isDraft) {
        try {
          // Query contractors in the same state
          const contractorsQuery = query(
            collection(db, 'users'),
            where('userType', '==', 'contractor'),
            where('state', '==', formData.state)
          );

          const contractorsSnapshot = await getDocs(contractorsQuery);

          const notificationPromises = contractorsSnapshot.docs.map(doc => {
            const contractorData = doc.data();
            const contractorCategories = Array.isArray(contractorData.serviceCategory)
              ? contractorData.serviceCategory
              : [contractorData.serviceCategory];

            // Check if any of the contractor's categories match the project's categories
            const hasMatch = selectedCategories.some(cat => contractorCategories.includes(cat));

            if (hasMatch && doc.id !== currentUser.uid) {
              return createNewProjectNotification(
                doc.id,
                projectRef.id,
                formData.title.trim(),
                currentUser.uid,
                userProfile?.fullName || 'A customer'
              );
            }
            return null;
          }).filter(p => p !== null);

          await Promise.all(notificationPromises);
        } catch (error) {
          console.error('Error sending notifications to contractors:', error);
        }
      }

      toast({
        title: isDraft ? "Draft saved" : "Project Posted Successfully!",
        description: isDraft
          ? "You can come back to complete and publish this project."
          : userProfile?.userType === 'contractor'
            ? "Your project has been posted as a contractor. Other contractors can now bid on it."
            : "Your project has been posted and contractors can now bid on it."
      });

      setFormData({
        title: '',
        description: '',
        city: '',
        state: '',
        budget: '',
        budgetMax: '',
        startDate: '',
        expectedDuration: '',
        urgency: 'medium',
        projectType: 'residential',
        requiresPermits: false,
        materials: '',
        specialRequirements: ''
      });
      setSelectedCategories([]);
      setAttachments([]);
      if (!isDraft) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error posting project:', error);
      toast({
        title: isDraft ? "Error Saving Draft" : "Error Posting Project",
        description: "Failed to save your project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBusyState(false);
    }
  };

  const projectSummary = useMemo(() => ({
    title: formData.title || 'Untitled project',
    location: formData.city && formData.state ? `${formData.city}, ${formData.state}` : 'Location not set',
    budget: formData.budget || '',
    budgetMax: formData.budgetMax || '',
    startDate: formData.startDate || '',
    categories: selectedCategories,
    urgency: formData.urgency,
    projectType: formData.projectType
  }), [formData, selectedCategories]);

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {userProfile?.userType === 'contractor' ? 'Post a Project as Contractor' : 'Post a New Project'}
        </CardTitle>
        <p className="text-center text-muted-foreground">
          {userProfile?.userType === 'contractor'
            ? 'Post your construction project as a contractor and get competitive bids from other contractors'
            : 'Describe your construction project and get competitive bids from qualified contractors'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Secure | Verified contractors only | Avg. response in 24h
            </div>
            <Button variant="link" type="button" onClick={() => setHelpOpen(true)} className="px-0 text-blue-700">
              <Lightbulb className="h-4 w-4 mr-1" />
              Need help scoping?
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
            <form onSubmit={(e) => submitProject(false, e)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Project Details
                </h3>

                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Kitchen Renovation, House Construction, Office Interior"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide detailed description of your project, including scope, requirements, and any specific preferences..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, state: value, city: '' }))}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIA_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                      disabled={!formData.state}
                    >
                      <SelectTrigger id="city">
                        <SelectValue placeholder={formData.state ? "Select City" : "Select State first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.state && STATE_CITIES[formData.state]?.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select value={formData.projectType} onValueChange={(value: any) => handleSelectChange('projectType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Service Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Categories *</h3>
                <ServiceCategorySelector
                  selectedCategories={selectedCategories}
                  onChange={setSelectedCategories}
                  multiSelect={true}
                />
              </div>

              {/* Budget and Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                  Budget and Timeline
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Minimum Budget (NGN) *</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="50000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetMax">Maximum Budget (NGN)</Label>
                    <Input
                      id="budgetMax"
                      name="budgetMax"
                      type="number"
                      value={formData.budgetMax}
                      onChange={handleInputChange}
                      placeholder="100000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Expected Start Date *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedDuration">Expected Duration *</Label>
                    <Input
                      id="expectedDuration"
                      name="expectedDuration"
                      value={formData.expectedDuration}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 months, 6 weeks"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="urgency">Project Urgency *</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleSelectChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Flexible Timeline</SelectItem>
                      <SelectItem value="medium">Medium - Standard Timeline</SelectItem>
                      <SelectItem value="high">High - Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Additional Information
                </h3>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresPermits"
                    checked={formData.requiresPermits}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, requiresPermits: checked as boolean }))
                    }
                  />
                  <Label htmlFor="requiresPermits">This project requires permits</Label>
                </div>

                <div>
                  <Label htmlFor="materials">Materials to be Provided</Label>
                  <Textarea
                    id="materials"
                    name="materials"
                    value={formData.materials}
                    onChange={handleInputChange}
                    placeholder="List any materials that will be provided for the project..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="Any special requirements or considerations for the project..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <UploadCloud className="h-5 w-5 mr-2 text-blue-600" />
                  Reference files (images or PDFs)
                </h3>
                <div className="space-y-2 rounded-lg border p-3">
                  <Label htmlFor="attachments" className="text-sm font-medium">Upload up to 5 files (10MB each)</Label>
                  <Input
                    id="attachments"
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleAttachmentChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Good to add drawings, inspiration photos, or existing site photos.
                  </p>
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {attachments.map((file) => (
                        <Badge key={file.name} variant="secondary" className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span className="truncate max-w-[140px]">{file.name}</span>
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeAttachment(file.name)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => submitProject(true)}
                  disabled={posting || savingDraft}
                >
                  {savingDraft ? 'Saving draft...' : 'Save as draft'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={posting || savingDraft}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={posting || savingDraft}>
                  {posting ? 'Posting...' : 'Post Project'}
                </Button>
              </div>
            </form>

            {/* Live summary */}
            <div className="space-y-4">
              <Card className="border-blue-100 shadow-sm h-fit">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Project summary
                  </CardTitle>
                  <p className="text-sm text-blue-100">Live preview updates as you type.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Title</p>
                      <p className="font-semibold text-gray-900">{projectSummary.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        {projectSummary.location}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {projectSummary.projectType}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Budget range</p>
                      <p className="font-semibold">
                        {projectSummary.budget ? formatCurrency(projectSummary.budget) : 'Not set'}
                        {projectSummary.budgetMax && (
                          <span className="text-sm text-muted-foreground"> - {formatCurrency(projectSummary.budgetMax)}</span>
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Start date</p>
                      <p className="font-semibold">{formatDate(projectSummary.startDate)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Categories</p>
                    {projectSummary.categories.length ? (
                      <div className="flex flex-wrap gap-2">
                        {projectSummary.categories.map((category) => (
                          <Badge key={category} variant="secondary">{category}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No categories selected yet.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="capitalize">{projectSummary.urgency} urgency</span>
                    </div>
                    <Badge variant="outline">{attachments.length} attachment{attachments.length === 1 ? '' : 's'}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Need help scoping?
            </DialogTitle>
            <DialogDescription>
              A quick checklist to make your brief clearer for contractors.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border p-3 space-y-1">
              <p className="font-semibold">Scope & deliverables</p>
              <p className="text-muted-foreground">Key rooms/areas, finishes, and any exclusions.</p>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <p className="font-semibold">Site access & timing</p>
              <p className="text-muted-foreground">Working hours, access rules, and target start date.</p>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <p className="font-semibold">Permits & utilities</p>
              <p className="text-muted-foreground">Who handles permits, available power/water, and storage space.</p>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <p className="font-semibold">Reference files</p>
              <p className="text-muted-foreground">Upload drawings, photos, or PDFs to avoid misalignment.</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="default" onClick={() => setHelpOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PostProjectForm;
