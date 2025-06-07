
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Shield, Edit } from 'lucide-react';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import PhoneVerificationModal from '@/components/PhoneVerificationModal';

export const ProfileManagement = () => {
  const { userProfile, refreshUserProfile, markProfileComplete, updateUserEmail, sendEmailVerification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showEmailUpdate, setShowEmailUpdate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    countryCode: '+91',
    city: '',
    occupation: '',
    userType: 'customer',
    companyName: '',
    serviceCategory: '',
    experience: '',
  });

  useEffect(() => {
    if (userProfile) {
      // Parse existing mobile number to extract country code
      let countryCode = '+91';
      let mobile = userProfile.mobile || '';
      
      if (mobile && userProfile.countryCode) {
        countryCode = userProfile.countryCode;
        mobile = mobile.replace(countryCode, '');
      }

      setFormData({
        fullName: userProfile.fullName || '',
        mobile: mobile,
        countryCode: countryCode,
        city: userProfile.city || '',
        occupation: userProfile.occupation || '',
        userType: userProfile.userType || 'customer',
        companyName: userProfile.companyName || '',
        serviceCategory: userProfile.serviceCategory || '',
        experience: userProfile.experience?.toString() || '',
      });
      setNewEmail(userProfile.email || '');
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

    // Check if phone number changed
    const fullMobile = `${formData.countryCode}${formData.mobile}`;
    const phoneChanged = fullMobile !== userProfile.mobile;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', userProfile.uid);
      const updateData = {
        fullName: formData.fullName,
        city: formData.city,
        occupation: formData.occupation,
        userType: formData.userType,
        companyName: formData.companyName,
        serviceCategory: formData.serviceCategory,
        experience: formData.experience ? parseInt(formData.experience) : undefined,
        updatedAt: new Date(),
        ...(phoneChanged && {
          mobile: fullMobile,
          countryCode: formData.countryCode,
          isPhoneVerified: false // Mark as unverified if phone changed
        })
      };

      await updateDoc(userRef, updateData);
      
      if (phoneChanged) {
        toast({
          title: "Phone Number Updated",
          description: "Please verify your new phone number to complete the update.",
          variant: "default",
        });
        setShowPhoneVerification(true);
      } else {
        // Only mark complete if phone is already verified
        if (userProfile.isPhoneVerified) {
          await markProfileComplete();
        }
        
        toast({
          title: "Profile Updated",
          description: userProfile.isPhoneVerified 
            ? "Your profile has been successfully updated and marked as complete."
            : "Profile updated. Please verify your phone number to complete your profile.",
        });
      }
      
      await refreshUserProfile();
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

  const handleEmailUpdate = async () => {
    if (!newEmail || newEmail === userProfile?.email) {
      setShowEmailUpdate(false);
      return;
    }

    setLoading(true);
    try {
      await updateUserEmail(newEmail);
      toast({
        title: "Email Updated",
        description: "Please check your new email address for verification link.",
      });
      setShowEmailUpdate(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailVerification = async () => {
    try {
      await sendEmailVerification();
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      });
    }
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <>
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
              <div className="flex items-center justify-center gap-2 mt-2">
                <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                <Badge variant={userProfile.isEmailVerified ? "default" : "secondary"}>
                  {userProfile.isEmailVerified ? "Verified" : "Unverified"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmailUpdate(!showEmailUpdate)}
                  className="p-1 h-auto"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
              {!userProfile.isEmailVerified && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleResendEmailVerification}
                  className="text-xs"
                >
                  Resend verification email
                </Button>
              )}
            </div>
          </div>

          {/* Email Update Section */}
          {showEmailUpdate && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Label htmlFor="newEmail">New Email Address</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleEmailUpdate} disabled={loading}>
                      {loading ? 'Updating...' : 'Update Email'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowEmailUpdate(false)}>
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700">
                    A verification email will be sent to your new email address.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phone Verification Status */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Phone Verification</span>
                  <Badge variant={userProfile.isPhoneVerified ? "default" : "secondary"}>
                    {userProfile.isPhoneVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPhoneVerification(true)}
                  className="flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  {userProfile.isPhoneVerified ? 'Update' : 'Verify'} Phone
                </Button>
              </div>
              {userProfile.mobile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current: {userProfile.mobile}
                </p>
              )}
            </CardContent>
          </Card>

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
                <div className="flex space-x-2">
                  <Select
                    value={formData.countryCode}
                    onValueChange={(value) => handleSelectChange('countryCode', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+91">+91 India</SelectItem>
                      <SelectItem value="+1">+1 USA</SelectItem>
                      <SelectItem value="+44">+44 UK</SelectItem>
                      <SelectItem value="+86">+86 China</SelectItem>
                      <SelectItem value="+81">+81 Japan</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                    className="flex-1"
                    required
                  />
                </div>
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
                {loading ? 'Saving...' : (userProfile.profileComplete ? 'Update Profile' : 'Save Profile')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <PhoneVerificationModal
        open={showPhoneVerification}
        onOpenChange={setShowPhoneVerification}
        onVerificationComplete={() => {
          setShowPhoneVerification(false);
          refreshUserProfile();
        }}
      />
    </>
  );
};
