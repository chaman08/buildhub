
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationResult } from 'firebase/auth';

interface PhoneAuthFormProps {
  onSuccess: () => void;
  isLogin?: boolean;
}

const PhoneAuthForm: React.FC<PhoneAuthFormProps> = ({ onSuccess, isLogin = false }) => {
  const [step, setStep] = useState(1);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [userType, setUserType] = useState<'customer' | 'contractor' | ''>('');
  const [formData, setFormData] = useState({
    fullName: '',
    city: '',
    companyName: '',
    serviceCategory: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const { loginWithPhone, signupWithPhone, verifyPhoneOTP } = useAuth();
  const { toast } = useToast();

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

  const serviceCategories = [
    'Civil Construction', 'Electrical', 'Plumbing', 'Painting', 'Carpentry',
    'Interior Design', 'Architecture', 'Landscaping', 'Roofing', 'Flooring'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    const fullPhone = `${countryCode}${phoneNumber}`;
    
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
      let result: ConfirmationResult;
      
      if (isLogin) {
        result = await loginWithPhone(fullPhone);
      } else {
        if (!userType || !formData.fullName) {
          toast({
            title: "Information Required",
            description: "Please complete all required fields",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        result = await signupWithPhone(fullPhone, {
          fullName: formData.fullName,
          userType: userType as 'customer' | 'contractor',
          mobile: fullPhone,
          city: formData.city,
          ...(userType === 'contractor' && {
            companyName: formData.companyName,
            serviceCategory: formData.serviceCategory,
            experience: parseInt(formData.experience) || 0
          })
        });
      }
      
      setConfirmationResult(result);
      setStep(isLogin ? 2 : 3); // Skip signup form for login
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${fullPhone}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
      const userData = !isLogin ? {
        fullName: formData.fullName,
        userType: userType as 'customer' | 'contractor',
        mobile: `${countryCode}${phoneNumber}`,
        city: formData.city,
        ...(userType === 'contractor' && {
          companyName: formData.companyName,
          serviceCategory: formData.serviceCategory,
          experience: parseInt(formData.experience) || 0
        })
      } : undefined;

      await verifyPhoneOTP(confirmationResult, otp, userData);
      
      toast({
        title: isLogin ? "Login Successful" : "Account Created",
        description: isLogin ? "Welcome back!" : "Your account has been created successfully"
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Phone number input
  if (step === 1) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center">
            <Phone className="h-5 w-5 mr-2" />
            {isLogin ? 'Sign In with Phone' : 'Sign Up with Phone'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mobile">Mobile Number</Label>
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
                id="mobile"
                type="tel"
                placeholder="97545 27943"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
                required
              />
            </div>
          </div>
          
          <Button 
            onClick={() => isLogin ? handleSendOTP() : setStep(2)} 
            disabled={loading || !phoneNumber}
            className="w-full"
          >
            {isLogin ? (loading ? 'Sending OTP...' : 'Send OTP') : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Signup form (only for signup)
  if (step === 2 && !isLogin) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Account Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                type="button"
                variant={userType === 'customer' ? 'default' : 'outline'}
                onClick={() => setUserType('customer')}
                className="h-auto p-3 flex flex-col"
              >
                <User className="h-5 w-5 mb-1" />
                <span className="text-xs">Customer</span>
              </Button>
              <Button
                type="button"
                variant={userType === 'contractor' ? 'default' : 'outline'}
                onClick={() => setUserType('contractor')}
                className="h-auto p-3 flex flex-col"
              >
                <Building2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Contractor</span>
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>

          {userType === 'contractor' && (
            <>
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="serviceCategory">Service Category</Label>
                <Select value={formData.serviceCategory} onValueChange={(value) => setFormData({ ...formData, serviceCategory: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                />
              </div>
            </>
          )}

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={handleSendOTP} disabled={loading} className="flex-1">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 3: OTP verification
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Verify Phone Number</CardTitle>
        <p className="text-center text-sm text-gray-600">
          Enter the 6-digit code sent to {countryCode}{phoneNumber}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <Button 
          onClick={handleVerifyOTP} 
          disabled={loading || otp.length !== 6}
          className="w-full"
        >
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </Button>

        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleSendOTP}
            disabled={loading}
            className="text-sm"
          >
            Resend OTP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhoneAuthForm;
