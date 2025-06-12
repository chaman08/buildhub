
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

const serviceCategories = [
  'Construction & Building',
  'Electrical Work',
  'Plumbing',
  'HVAC',
  'Painting & Decoration',
  'Landscaping & Gardening',
  'Roofing',
  'Flooring',
  'Kitchen & Bathroom',
  'Solar Installation',
  'Security Systems',
  'Pool Services',
  'Concrete Work',
  'Carpentry',
  'Cleaning Services',
  'Moving Services',
  'Pest Control',
  'Other'
];

const PostContractorProject = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: '',
    location: '',
    budget: '',
    budgetMax: '',
    timeline: '',
    requirements: '',
    contactInfo: userProfile?.mobile || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else if (prev.length < 3) {
        return [...prev, category];
      }
      return prev;
    });
  };

  const removeCategory = (category: string) => {
    setSelectedCategories(prev => prev.filter(cat => cat !== category));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !userProfile) {
      toast({
        title: "Error",
        description: "You must be logged in to post a project.",
        variant: "destructive"
      });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service category.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        serviceType: formData.serviceType,
        categories: selectedCategories,
        location: formData.location,
        budget: Number(formData.budget),
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
        timeline: formData.timeline,
        requirements: formData.requirements,
        contactInfo: formData.contactInfo,
        
        // Contractor information
        postedBy: currentUser.uid,
        postedByType: 'contractor',
        contractorName: userProfile.fullName,
        companyName: userProfile.companyName,
        contractorEmail: userProfile.email,
        contractorMobile: userProfile.mobile,
        
        // Project status
        status: 'active',
        featured: false,
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Additional fields
        projectType: 'contractor_service',
        verified: userProfile.verificationBadge || false
      };

      await addDoc(collection(db, 'contractor_projects'), projectData);

      toast({
        title: "Project Posted Successfully!",
        description: "Your service offering has been published and is now visible to potential clients."
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        serviceType: '',
        location: '',
        budget: '',
        budgetMax: '',
        timeline: '',
        requirements: '',
        contactInfo: userProfile?.mobile || ''
      });
      setSelectedCategories([]);

    } catch (error) {
      console.error('Error posting contractor project:', error);
      toast({
        title: "Error",
        description: "Failed to post your project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Post Your Service</CardTitle>
          <p className="text-muted-foreground">
            Showcase your services and attract potential clients by posting your offerings.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Professional Kitchen Renovation Services"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Input
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  placeholder="e.g., Residential, Commercial, Emergency"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Service Categories * (Select up to 3)</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeCategory(category)}
                      />
                    </Badge>
                  ))}
                  {selectedCategories.length < 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="h-6 px-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Category
                    </Button>
                  )}
                </div>
                
                {showCategoryDropdown && (
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-1">
                      {serviceCategories
                        .filter(cat => !selectedCategories.includes(cat))
                        .map((category) => (
                        <Button
                          key={category}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="justify-start text-xs"
                          onClick={() => {
                            toggleCategory(category);
                            if (selectedCategories.length === 2) {
                              setShowCategoryDropdown(false);
                            }
                          }}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Service Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your services, experience, and what sets you apart..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Service Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai, Delhi NCR, or specific areas"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Typical Timeline</Label>
                <Input
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  placeholder="e.g., 2-4 weeks, Same day service"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budget">Starting Price (₹) *</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="Minimum service cost"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetMax">Maximum Price (₹)</Label>
                <Input
                  id="budgetMax"
                  name="budgetMax"
                  type="number"
                  value={formData.budgetMax}
                  onChange={handleInputChange}
                  placeholder="Maximum service cost (optional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements & Specializations</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Special certifications, equipment, or requirements for your services..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information *</Label>
              <Input
                id="contactInfo"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleInputChange}
                placeholder="Phone number or preferred contact method"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Posting...' : 'Post Service'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostContractorProject;
