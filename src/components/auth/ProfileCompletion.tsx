import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PhoneVerificationModal from './PhoneVerificationModal';

const ProfileCompletion: React.FC = () => {
  const { userProfile, currentUser, refreshUserProfile, markProfileComplete } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [formData, setFormData] = useState({
    mobile: '',
    city: '',
    userType: 'customer' as 'customer' | 'contractor',
    companyName: '',
    serviceCategory: '',
    experience: ''
  });

  const serviceCategories = [
    'Civil Construction', 'Electrical', 'Plumbing', 'Painting', 'Carpentry',
    'Interior Design', 'Architecture', 'Landscaping', 'Roofing', 'Flooring'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !userProfile) return;

    // Validate required fields
    if (!formData.city || !formData.userType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.userType === 'contractor' && (!formData.companyName || !formData.serviceCategory)) {
      toast({
        title: "Missing Information", 
        description: "Contractors must provide company name and service category",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        updatedAt: new Date()
      };

      await updateDoc(userRef, updateData);
      await refreshUserProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!currentUser || !userProfile) return;

    // For Google users, we don't require phone verification
    const isGoogleUser = userProfile.isEmailVerified && !userProfile.mobile;
    
    // Only check phone verification for non-Google users
    if (!isGoogleUser && !userProfile.isPhoneVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number to complete your profile",
        variant: "destructive"
      });
      setShowPhoneVerification(true);
      return;
    }

    // Validate required fields
    if (!formData.city || !formData.userType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.userType === 'contractor' && (!formData.companyName || !formData.serviceCategory)) {
      toast({
        title: "Missing Information", 
        description: "Contractors must provide company name and service category",
        variant: "destructive"
      });
      return;
    }

    try {
      // First save the profile data
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        updatedAt: new Date()
      };

      await updateDoc(userRef, updateData);
      
      // Then mark the profile as complete
      await markProfileComplete();
      
      toast({
        title: "Profile Complete!",
        description: "Your profile is now complete. Redirecting to dashboard..."
      });
      
      // Redirect will be handled by the Auth page useEffect
    } catch (error: any) {
      console.error('Error completing profile:', error);
      toast({
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePhoneVerificationSuccess = async () => {
    await refreshUserProfile();
    toast({
      title: "Phone Verified!",
      description: "You can now complete your profile"
    });
  };

  if (!userProfile) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Complete Your Profile</CardTitle>
          <p className="text-center text-muted-foreground">
            Please complete your profile to access all features
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Verification Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Phone Verification</h3>
                  <p className="text-sm text-blue-700">
                    {userProfile.isPhoneVerified 
                      ? "Your phone number is verified" 
                      : "Phone verification is required"
                    }
                  </p>
                </div>
              </div>
              {userProfile.isPhoneVerified ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Button 
                  onClick={() => setShowPhoneVerification(true)}
                  variant="outline"
                  size="sm"
                >
                  Verify Phone
                </Button>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                  required
                />
              </div>

              <div>
                <Label htmlFor="userType">Account Type *</Label>
                <Select 
                  value={formData.userType} 
                  onValueChange={(value) => handleSelectChange('userType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contractor specific fields */}
            {formData.userType === 'contractor' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceCategory">Service Category *</Label>
                    <Select 
                      value={formData.serviceCategory}
                      onValueChange={(value) => handleSelectChange('serviceCategory', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Years of experience"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleSaveProfile}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>

            <Button 
              onClick={handleCompleteProfile}
              disabled={(!userProfile.isPhoneVerified && !userProfile.isEmailVerified) || !formData.city || !formData.userType || 
                (formData.userType === 'contractor' && (!formData.companyName || !formData.serviceCategory))}
              className="w-full"
            >
              Complete Profile & Continue
            </Button>
          </div>

          {!userProfile.isPhoneVerified && !userProfile.isEmailVerified && (
            <p className="text-sm text-muted-foreground text-center">
              Phone verification is required to complete your profile
            </p>
          )}
        </CardContent>
      </Card>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onSuccess={handlePhoneVerificationSuccess}
      />
    </div>
  );
};

export default ProfileCompletion;
