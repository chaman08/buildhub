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
  const { currentUser, userProfile } = useAuth();
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
    projectType: 'residential' as 'residential' | 'commercial' | 'industrial' | 'government',
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
        postedByType: userProfile?.userType || 'customer',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'projects'), projectData);
      
      toast({
        title: "Project Posted Successfully!",
        description: userProfile?.userType === 'contractor' 
          ? "Your project has been posted as a contractor. Other contractors can now bid on it."
          : "Your project has been posted and contractors can now bid on it."
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
                    <SelectItem value="government">Government</SelectItem>
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
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Budget and Timeline
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

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Project'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostProjectForm;
