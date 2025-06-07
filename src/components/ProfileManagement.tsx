
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
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

export const ProfileManagement = () => {
  const { userProfile, refreshUserProfile, markProfileComplete, setupRecaptcha, sendPhoneOTP, verifyPhoneOTP } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPhoneVerificationDialog, setShowPhoneVerificationDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
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

  useEffect(() => {
    if (userProfile) {
      const { code, number } = extractPhoneComponents(userProfile.mobile || '');
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
      setCountryCode(code);
      setPhoneNumber(number);
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

  const handlePhoneVerificationStart = () => {
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
      
      const recaptchaVerifier = setupRecaptcha('phone-verification-management');
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
      
      // Update the mobile number in the form data
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      setFormData(prev => ({ ...prev, mobile: fullPhoneNumber }));
      
      setShowPhoneVerificationDialog(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    // Validate required fields before saving
    if (!formData.fullName || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields (Name and City).",
        variant: "destructive",
      });
      return;
    }

    // Ensure phone number is verified before allowing save
    if (!userProfile.isPhoneVerified && formData.mobile) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before saving.",
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
        mobile: formData.mobile || '', // Only save if verified
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

  const { code: currentCountryCode, number: currentPhoneNumber } = extractPhoneComponents(userProfile?.mobile || '');

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
                  type="button"
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
        <div id="phone-verification-management" className="hidden"></div>
      </CardContent>
    </Card>
  );
};
