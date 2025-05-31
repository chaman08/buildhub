import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface PostProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectPosted?: () => void;
}

const PostProjectDialog: React.FC<PostProjectDialogProps> = ({ open, onOpenChange, onProjectPosted }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    location: '',
    budget: '',
    budgetMax: '',
    startDate: undefined as Date | undefined,
    completionTime: '',
    services: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectTypes = [
    'Residential',
    'Commercial',
    'Government',
    'Renovation',
    'Interior Design',
    'Landscaping'
  ];

  const serviceCategories = [
    'Architecture',
    'Civil Work',
    'Electrical',
    'Plumbing',
    'Interior Design',
    'Landscaping',
    'Painting',
    'Flooring'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a project.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const budgetAmount = parseInt(formData.budget);
      const budgetMaxAmount = formData.budgetMax ? parseInt(formData.budgetMax) : budgetAmount;

      // Ensure postedBy is stored as a string
      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.services,
        budget: budgetAmount,
        budgetMax: budgetMaxAmount,
        location: formData.location,
        startDate: formData.startDate ? formData.startDate.toISOString() : '',
        expectedDuration: formData.completionTime,
        postedBy: currentUser.uid.toString(), // Ensure it's a string
        status: 'open',
        createdAt: serverTimestamp()
      };

      console.log('Posting project with data:', projectData);
      await addDoc(collection(db, 'projects'), projectData);
      
      toast({
        title: "Project Posted Successfully",
        description: "Your project has been posted and contractors can now bid on it."
      });
      
      // Reset form
      setFormData({
        title: '',
        type: '',
        description: '',
        location: '',
        budget: '',
        budgetMax: '',
        startDate: undefined,
        completionTime: '',
        services: []
      });

      // Close dialog and refresh projects list
      onOpenChange(false);
      if (onProjectPosted) {
        onProjectPosted();
      }
    } catch (error: any) {
      console.error('Error posting project:', error);
      toast({
        title: "Error Posting Project",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post New Construction Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Residential House Construction"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Project Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="City, State"
                required
              />
            </div>

            <div>
              <Label htmlFor="budget">Minimum Budget *</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="500000"
                required
              />
            </div>

            <div>
              <Label htmlFor="budgetMax">Maximum Budget (Optional)</Label>
              <Input
                id="budgetMax"
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData({...formData, budgetMax: e.target.value})}
                placeholder="800000"
              />
            </div>

            <div>
              <Label>Preferred Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({...formData, startDate: date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="completionTime">Expected Completion Time</Label>
              <Input
                id="completionTime"
                value={formData.completionTime}
                onChange={(e) => setFormData({...formData, completionTime: e.target.value})}
                placeholder="e.g., 6 months"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your project in detail..."
                rows={4}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label>Required Services</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {serviceCategories.map((service) => (
                  <label key={service} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, services: [...formData.services, service]});
                        } else {
                          setFormData({...formData, services: formData.services.filter(s => s !== service)});
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Project Documents (Optional)</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Upload project drawings, layouts, or documents</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Choose Files
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting Project...' : 'Post Project'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostProjectDialog;
