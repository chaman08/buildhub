
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, MapPin, Calendar, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PostProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PostProjectForm: React.FC<PostProjectFormProps> = ({ onSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    budgetMax: '',
    startDate: '',
    expectedDuration: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    projectType: 'residential' as 'residential' | 'commercial' | 'industrial',
    requiresPermits: false,
    materials: '',
    specialRequirements: ''
  });

  const serviceCategories = [
    'Civil Construction', 'Electrical', 'Plumbing', 'Painting', 'Carpentry',
    'Interior Design', 'Architecture', 'Landscaping', 'Roofing', 'Flooring',
    'HVAC', 'Masonry', 'Demolition', 'Renovation', 'New Construction'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a project",
        variant: "destructive"
      });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Category Required",
        description: "Please select at least one service category",
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
        location: formData.location,
        budget: Number(formData.budget),
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
        startDate: formData.startDate,
        expectedDuration: formData.expectedDuration,
        urgency: formData.urgency,
        projectType: formData.projectType,
        requiresPermits: formData.requiresPermits,
        materials: formData.materials,
        specialRequirements: formData.specialRequirements,
        postedBy: currentUser.uid,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'projects'), projectData);
      
      toast({
        title: "Project Posted Successfully!",
        description: "Your project has been posted and contractors can now bid on it."
      });
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Error posting project:', error);
      toast({
        title: "Error Posting Project",
        description: "Failed to post your project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Post a New Project</CardTitle>
        <p className="text-center text-muted-foreground">
          Describe your construction project and get competitive bids from qualified contractors
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                  required
                />
              </div>
              <div>
                <Label htmlFor="projectType">Project Type *</Label>
                <Select value={formData.projectType} onValueChange={(value) => handleSelectChange('projectType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Service Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Categories *</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {serviceCategories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryToggle(category)}
                  className="justify-start h-auto py-2"
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
              />
              <Button type="button" onClick={addCustomCategory} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeCategory(category)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Budget and Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Budget & Timeline
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Minimum Budget (₹) *</Label>
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
                <Label htmlFor="budgetMax">Maximum Budget (₹)</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Preferred Start Date *</Label>
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
                <Label htmlFor="expectedDuration">Expected Duration</Label>
                <Input
                  id="expectedDuration"
                  name="expectedDuration"
                  value={formData.expectedDuration}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 weeks, 3 months"
                />
              </div>
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleSelectChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Flexible timeline</SelectItem>
                    <SelectItem value="medium">Medium - Standard timeline</SelectItem>
                    <SelectItem value="high">High - Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              Additional Details
            </h3>
            
            <div>
              <Label htmlFor="materials">Materials & Equipment</Label>
              <Textarea
                id="materials"
                name="materials"
                value={formData.materials}
                onChange={handleInputChange}
                placeholder="Specify if you'll provide materials or if contractor should include them in bid..."
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
                placeholder="Any special requirements, certifications needed, working hours restrictions, etc..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresPermits"
                checked={formData.requiresPermits}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, requiresPermits: checked === true }))
                }
              />
              <Label htmlFor="requiresPermits" className="text-sm">
                This project requires permits or special approvals
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="sm:w-auto"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || selectedCategories.length === 0}
              className="sm:flex-1"
            >
              {loading ? 'Posting Project...' : 'Post Project'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostProjectForm;
