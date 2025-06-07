
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

export const ProfileManagement = () => {
  const { userProfile, refreshUserProfile, markProfileComplete } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    city: '',
    occupation: '',
    userType: 'customer',
    companyName: '',
    serviceCategory: '',
    experience: '',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        mobile: userProfile.mobile || '',
        city: userProfile.city || '',
        occupation: userProfile.occupation || '',
        userType: userProfile.userType || 'customer',
        companyName: userProfile.companyName || '',
        serviceCategory: userProfile.serviceCategory || '',
        experience: userProfile.experience?.toString() || '',
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    // Validate required fields before saving
    if (!formData.fullName || !formData.mobile || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields (Name, Mobile, and City).",
        variant: "destructive",
      });
      return;
    }

    if (formData.userType === 'contractor' && (!formData.companyName || !formData.serviceCategory)) {
      toast({
        title: "Missing Information",
        description: "Contractors must provide Company Name and Service Category.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', userProfile.uid);
      const updateData = {
        ...formData,
        updatedAt: new Date(),
      };

      await updateDoc(userRef, updateData);
      
      // Mark profile as complete if all required fields are filled
      await markProfileComplete();
      
      await refreshUserProfile();
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated and marked as complete.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Management</CardTitle>
        <CardDescription>
          {userProfile.profileComplete ? 
            "Update your profile information" : 
            "Complete your profile to unlock all features"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          <ProfilePictureUpload />
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium">{userProfile.fullName}</h3>
            <p className="text-sm text-muted-foreground">{userProfile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">User Type *</Label>
              <Select
                value={formData.userType}
                onValueChange={(value) => handleSelectChange('userType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.userType === 'contractor' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceCategory">Service Category *</Label>
                  <Input
                    id="serviceCategory"
                    name="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : (userProfile.profileComplete ? 'Update Profile' : 'Complete Profile')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
