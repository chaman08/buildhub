
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Edit3, Save, X, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import PhoneVerificationModal from '@/components/auth/PhoneVerificationModal';
import KycStatusCard from '@/components/kyc/KycStatusCard';

const ProfileSection: React.FC = () => {
  const { userProfile, currentUser, refreshUserProfile, sendEmailVerification } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || '',
    city: userProfile?.city || '',
    mobile: userProfile?.mobile || '',
    occupation: userProfile?.occupation || '',
    userType: userProfile?.userType || 'customer',
    companyName: userProfile?.companyName || '',
    serviceCategory: userProfile?.serviceCategory || '',
    experience: userProfile?.experience ? String(userProfile.experience) : ''
  });

  useEffect(() => {
    setFormData({
      fullName: userProfile?.fullName || '',
      city: userProfile?.city || '',
      mobile: userProfile?.mobile || '',
      occupation: userProfile?.occupation || '',
      userType: userProfile?.userType || 'customer',
      companyName: userProfile?.companyName || '',
      serviceCategory: userProfile?.serviceCategory || '',
      experience: userProfile?.experience ? String(userProfile.experience) : ''
    });
  }, [userProfile]);

  const handleSave = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    const userTypeChanged = formData.userType !== userProfile?.userType;

    if (!formData.fullName || !formData.mobile || !formData.city) {
      toast({
        title: "Missing information",
        description: "Full name, mobile, and city are required.",
        variant: "destructive"
      });
      return;
    }

    if (formData.userType === 'contractor' && (!formData.companyName || !formData.serviceCategory)) {
      toast({
        title: "Contractor details required",
        description: "Please add Company Name and Service Category to switch to contractor.",
        variant: "destructive"
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...formData,
        experience: formData.experience ? parseInt(formData.experience, 10) || 0 : 0,
        companyName: formData.userType === 'contractor' ? formData.companyName : '',
        serviceCategory: formData.userType === 'contractor' ? formData.serviceCategory : '',
        updatedAt: new Date()
      };

      await updateDoc(userRef, updateData);
      await refreshUserProfile();
      
      toast({
        title: "Profile Updated",
        description: userTypeChanged
          ? `Role switched to ${formData.userType}. Contractor fields ${
              formData.userType === 'contractor' ? 'saved' : 'hidden for customers'
            }.`
          : "Your profile has been updated successfully."
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEmailVerification = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    try {
      await sendEmailVerification();
      toast({
        title: "Verification Email Sent",
        description: "Please check your email and click the verification link."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive"
      });
    }
  };

  const handlePhoneVerificationSuccess = () => {
    toast({
      title: "Success",
      description: "Phone number verified successfully!"
    });
    refreshUserProfile();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        <Button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfilePictureUpload />
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    value={userProfile?.email || currentUser?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <Badge variant={userProfile?.isEmailVerified ? "default" : "secondary"}>
                    {userProfile?.isEmailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    disabled={!isEditing}
                  />
                  <Badge variant={userProfile?.isPhoneVerified ? "default" : "secondary"}>
                    {userProfile?.isPhoneVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="occupation">Occupation (Optional)</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  disabled={!isEditing}
                  placeholder="e.g., Business Owner, Engineer, etc."
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Account Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={formData.userType === 'customer' ? 'default' : 'outline'}
                    className="w-full h-auto justify-start gap-3"
                    disabled={!isEditing}
                    onClick={() => setFormData({...formData, userType: 'customer'})}
                  >
                    <User className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Customer</p>
                      <p className="text-xs text-muted-foreground">I want to hire contractors</p>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant={formData.userType === 'contractor' ? 'default' : 'outline'}
                    className="w-full h-auto justify-start gap-3"
                    disabled={!isEditing}
                    onClick={() => setFormData({...formData, userType: 'contractor'})}
                  >
                    <Building2 className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Contractor</p>
                      <p className="text-xs text-muted-foreground">I want to offer services</p>
                    </div>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Switching to contractor requires company name and service category.
                </p>
              </div>

              {formData.userType === 'contractor' && (
                <>
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      disabled={!isEditing}
                      required={isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceCategory">Service Category *</Label>
                    <Input
                      id="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={(e) => setFormData({...formData, serviceCategory: e.target.value})}
                      disabled={!isEditing}
                      required={isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </>
              )}
            </div>
            
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span>Email Verification</span>
              <Badge variant={userProfile?.isEmailVerified ? "default" : "secondary"}>
                {userProfile?.isEmailVerified ? "✓ Verified" : "Pending"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-600" />
              <span>Phone Verification</span>
              <Badge variant={userProfile?.isPhoneVerified ? "default" : "secondary"}>
                {userProfile?.isPhoneVerified ? "✓ Verified" : "Pending"}
              </Badge>
            </div>
          </div>
          
          {(!userProfile?.isEmailVerified || !userProfile?.isPhoneVerified) && (
            <div className="mt-4 space-x-2">
              {!userProfile?.isEmailVerified && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEmailVerification}
                >
                  Verify Email
                </Button>
              )}
              {!userProfile?.isPhoneVerified && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPhoneVerificationModal(true)}
                >
                  Verify Phone
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneVerificationModal}
        onClose={() => setShowPhoneVerificationModal(false)}
        onSuccess={handlePhoneVerificationSuccess}
      />

      {/* KYC status below profile info */}
      <div className="pt-2">
        <KycStatusCard />
      </div>
    </div>
  );
};

export default ProfileSection;
