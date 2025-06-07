
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, AlertCircle } from 'lucide-react';
import { ConfirmationResult } from 'firebase/auth';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

export const ProfileManagement = () => {
  const { userProfile, refreshUserProfile, markProfileComplete, setupRecaptcha, sendPhoneOTP, updatePhoneNumber } = useAuth();
  const [loading, setLoading] = useState(false);
  const [phoneVerificationStep, setPhoneVerificationStep] = useState<'input' | 'verify' | 'verified'>('input');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
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

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        city: userProfile.city || '',
        occupation: userProfile.occupation || '',
        userType: userProfile.userType || 'customer',
        companyName: userProfile.companyName || '',
        serviceCategory: userProfile.serviceCategory || '',
        experience: userProfile.experience?.toString() || '',
      });

      // Set phone verification step based on current state
      if (userProfile.isPhoneVerified && userProfile.mobile) {
        setPhoneVerificationStep('verified');
        // Parse existing phone number
        const mobile = userProfile.mobile;
        const matchedCountry = countryCodes.find(c => mobile.startsWith(c.code));
        if (matchedCountry) {
          setCountryCode(matchedCountry.code);
          setPhoneNumber(mobile.substring(matchedCountry.code.length));
        } else {
          setPhoneNumber(mobile);
        }
      } else {
        setPhoneVerificationStep('input');
      }
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

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const result = await sendPhoneOTP(fullPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setPhoneVerificationStep('verify');
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${fullPhone}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!confirmationResult || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      await updatePhoneNumber(fullPhone, confirmationResult, otp);
      setPhoneVerificationStep('verified');
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully."
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive"
      });
      setOtp('');
    } finally {
      setLoading(false);
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

    if (formData.userType === 'contractor' && (!formData.companyName || !formData.serviceCategory)) {
      toast({
        title: "Missing Information",
        description: "Contractors must provide Company Name and Service Category.",
        variant: "destructive",
      });
      return;
    }

    if (!userProfile.isPhoneVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before completing your profile.",
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
      
      // Mark profile as complete since phone is verified
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

        {/* Phone Verification Section */}
        {!userProfile.isPhoneVerified && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                Phone Verification Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-700">
                You must verify your phone number to complete your profile and access all features.
              </p>

              {phoneVerificationStep === 'input' && (
                <div className="space-y-4">
                  <div>
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
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSendOTP} disabled={loading || !phoneNumber}>
                    <Phone className="h-4 w-4 mr-2" />
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </div>
              )}

              {phoneVerificationStep === 'verify' && (
                <div className="space-y-4">
                  <p className="text-sm text-amber-700">
                    Enter the 6-digit code sent to {countryCode}{phoneNumber}
                  </p>
                  <div className="flex justify-center">
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
                  <div className="flex space-x-2">
                    <Button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6} className="flex-1">
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                    <Button onClick={handleSendOTP} variant="outline" disabled={loading}>
                      Resend
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
              disabled={loading || !userProfile.isPhoneVerified}
            >
              {loading ? 'Saving...' : (userProfile.profileComplete ? 'Update Profile' : 'Complete Profile')}
            </Button>
          </div>
        </form>

        {/* reCAPTCHA container */}
        <div id="recaptcha-container" className="hidden"></div>
      </CardContent>
    </Card>
  );
};
