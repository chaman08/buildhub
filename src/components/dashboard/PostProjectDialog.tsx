
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PostProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectPosted?: () => void;
}

const PostProjectDialog: React.FC<PostProjectDialogProps> = ({
  open,
  onOpenChange,
  onProjectPosted
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    budgetMax: '',
    startDate: '',
    expectedDuration: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    'Civil Work', 'Electrical', 'Plumbing', 'Interior Design', 
    'Architecture', 'Landscaping', 'Painting', 'Roofing'
  ];

  // Check if user is logged in before allowing project posting
  React.useEffect(() => {
    if (open && !currentUser) {
      onOpenChange(false);
      navigate('/auth');
      toast({
        title: "Authentication Required",
        description: "Please sign in to post a project.",
        variant: "destructive"
      });
    }
  }, [open, currentUser, onOpenChange, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post a project.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Categories Required",
        description: "Please select at least one category for your project.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        category: selectedCategories,
        budget: parseInt(formData.budget),
        budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : undefined,
        location: formData.location,
        startDate: formData.startDate,
        expectedDuration: formData.expectedDuration || undefined,
        postedBy: currentUser.uid,
        status: 'open',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'projects'), projectData);

      toast({
        title: "Project Posted Successfully",
        description: "Your project has been posted and contractors can now bid on it."
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        budget: '',
        budgetMax: '',
        startDate: '',
        expectedDuration: ''
      });
      setSelectedCategories([]);
      
      onOpenChange(false);
      if (onProjectPosted) {
        onProjectPosted();
      }
    } catch (error) {
      console.error('Error posting project:', error);
      toast({
        title: "Error Posting Project",
        description: "There was an error posting your project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Modern 3BHK House Construction"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project requirements, specifications, and any special requirements..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categories *</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  {selectedCategories.includes(category) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Minimum Budget (₹) *</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="e.g., 1500000"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budgetMax">Maximum Budget (₹)</Label>
              <Input
                id="budgetMax"
                type="number"
                value={formData.budgetMax}
                onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                placeholder="e.g., 2000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Pune, Maharashtra"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Preferred Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedDuration">Expected Duration</Label>
              <Input
                id="expectedDuration"
                value={formData.expectedDuration}
                onChange={(e) => handleInputChange('expectedDuration', e.target.value)}
                placeholder="e.g., 12 months"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Posting...' : 'Post Project'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostProjectDialog;
