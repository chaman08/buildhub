
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Edit3, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProfileSection: React.FC = () => {
  const { userProfile, currentUser, refreshUserProfile, sendEmailVerification, setupRecaptcha, sendPhoneOTP, verifyPhoneOTP } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'phone' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || '',
    email: userProfile?.email || currentUser?.email || '',
    city: userProfile?.city || '',
    mobile: userProfile?.mobile || '',
    occupation: userProfile?.occupation || ''
  });

  const handleSave = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...formData,
        updatedAt: new Date()
      };

      await updateDoc(userRef, updateData);
      await refreshUserProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
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

  const handlePhoneVerificationStart = () => {
    setVerificationType('phone');
    setPhoneNumber(formData.mobile);
    setShowVerificationDialog(true);
  };

  const handlePhoneVerification = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      const recaptchaVerifier = setupRecaptcha('phone-verification');
      const result = await sendPhoneOTP(phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      toast({
        title: "OTP Sent",
        description: "Please enter the OTP sent to your phone number."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP.",
        variant: "destructive"
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || !confirmationResult) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive"
      });
      return;
    }

    try {
      await verifyPhoneOTP(confirmationResult, otp);
      await refreshUserProfile();
      setShowVerificationDialog(false);
      setOtp('');
      setConfirmationResult(null);
      toast({
        title: "Success",
        description: "Phone number verified successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP.",
        variant: "destructive"
      });
    }
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                    {userProfile?.isEmailVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={userProfile?.isEmailVerified ? "default" : "secondary"}>
                      {userProfile?.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                    {!userProfile?.isEmailVerified && (
                      <Button size="sm" variant="outline" onClick={handleEmailVerification}>
                        Verify Email
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      disabled={!isEditing}
                    />
                    {userProfile?.isPhoneVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={userProfile?.isPhoneVerified ? "default" : "secondary"}>
                      {userProfile?.isPhoneVerified ? "Verified" : "Unverified"}
                    </Badge>
                    {!userProfile?.isPhoneVerified && (
                      <Button size="sm" variant="outline" onClick={handlePhoneVerificationStart}>
                        Verify Phone
                      </Button>
                    )}
                  </div>
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

      {/* Phone Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phone Verification</DialogTitle>
            <DialogDescription>
              Enter your phone number to receive an OTP for verification.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!confirmationResult ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <Button onClick={handlePhoneVerification} className="w-full">
                  Send OTP
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button onClick={handleVerifyOTP} className="w-full" disabled={otp.length !== 6}>
                  Verify OTP
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* reCAPTCHA container for phone verification */}
      <div id="phone-verification" className="hidden"></div>
    </div>
  );
};

export default ProfileSection;
