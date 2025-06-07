import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, Save, X, Shield, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [showPhoneVerificationDialog, setShowPhoneVerificationDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || '',
    email: userProfile?.email || currentUser?.email || '',
    city: userProfile?.city || '',
    mobile: userProfile?.mobile || '',
    occupation: userProfile?.occupation || ''
  });

  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+33', country: 'France' },
    { code: '+49', country: 'Germany' },
    { code: '+61', country: 'Australia' },
    { code: '+971', country: 'UAE' },
    { code: '+65', country: 'Singapore' }
  ];

  // Extract country code and phone number from mobile
  const extractPhoneComponents = (mobile: string) => {
    if (!mobile) return { code: '+91', number: '' };
    
    const matchedCountry = countryCodes.find(c => mobile.startsWith(c.code));
    if (matchedCountry) {
      return {
        code: matchedCountry.code,
        number: mobile.substring(matchedCountry.code.length)
      };
    }
    return { code: '+91', number: mobile };
  };

  const handleSave = async () => {
    try {
      // Don't allow saving phone number changes without verification
      if (formData.mobile !== userProfile?.mobile && formData.mobile) {
        toast({
          title: "Phone Verification Required",
          description: "Please verify your phone number before saving.",
          variant: "destructive"
        });
        return;
      }

      const userRef = doc(db, 'users', currentUser!.uid);
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        city: formData.city,
        occupation: formData.occupation,
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
    try {
      // First update the email in Firestore
      if (formData.email !== userProfile?.email) {
        const userRef = doc(db, 'users', currentUser!.uid);
        await updateDoc(userRef, {
          email: formData.email,
          isEmailVerified: false,
          updatedAt: new Date()
        });
        await refreshUserProfile();
      }

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
    const { code, number } = extractPhoneComponents(userProfile?.mobile || '');
    setCountryCode(code);
    setPhoneNumber(number);
    setShowPhoneVerificationDialog(true);
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
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      
      const recaptchaVerifier = setupRecaptcha('phone-verification-profile');
      const result = await sendPhoneOTP(fullPhoneNumber, recaptchaVerifier);
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
      
      // Update the mobile number in Firestore
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      const userRef = doc(db, 'users', currentUser!.uid);
      await updateDoc(userRef, {
        mobile: fullPhoneNumber,
        isPhoneVerified: true,
        updatedAt: new Date()
      });
      
      // Update local form data
      setFormData(prev => ({ ...prev, mobile: fullPhoneNumber }));
      
      await refreshUserProfile();
      setShowPhoneVerificationDialog(false);
      setOtp('');
      setConfirmationResult(null);
      toast({
        title: "Success",
        description: "Phone number verified and updated successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP.",
        variant: "destructive"
      });
    }
  };

  const { code: currentCountryCode, number: currentPhoneNumber } = extractPhoneComponents(userProfile?.mobile || '');

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
          <CardContent className="text-center">
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
                      type="email"
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
                  {isEditing && !userProfile?.isEmailVerified && (
                    <Button size="sm" variant="outline" onClick={handleEmailVerification}>
                      Verify Email
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1 flex-1">
                      <Input
                        value={currentCountryCode}
                        disabled
                        className="w-20"
                      />
                      <Input
                        value={currentPhoneNumber}
                        disabled
                        className="flex-1"
                        placeholder="Not added yet"
                      />
                    </div>
                    {userProfile?.isPhoneVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handlePhoneVerificationStart}
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {userProfile?.mobile ? 'Update & Verify Phone' : 'Add & Verify Phone'}
                  </Button>
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
      <Dialog open={showPhoneVerificationDialog} onOpenChange={setShowPhoneVerificationDialog}>
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
                  <div className="flex space-x-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.code} {country.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number"
                      className="flex-1"
                    />
                  </div>
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
      <div id="phone-verification-profile" className="hidden"></div>
    </div>
  );
};

export default ProfileSection;
