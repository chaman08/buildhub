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

type UserType = 'customer' | 'contractor' | '';

interface PhoneAuthFormProps {
  onSuccess: () => void;
  isLogin?: boolean;
  preSelectedUserType?: UserType;
}

const PhoneAuthForm: React.FC<PhoneAuthFormProps> = ({ 
  onSuccess, 
  isLogin = false,
  preSelectedUserType = '' 
}) => {
  const [step, setStep] = useState(1);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [userType, setUserType] = useState<UserType>(preSelectedUserType);
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
        if (!userType && !preSelectedUserType) {
          toast({
            title: "Information Required",
            description: "Please select your account type",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        const selectedUserType = userType || preSelectedUserType;
        
        // For signup we'll collect minimal information and let users complete profiles later
        result = await signupWithPhone(fullPhone, {
          fullName: formData.fullName || 'User',
          userType: selectedUserType as 'customer' | 'contractor',
          mobile: fullPhone,
          profileComplete: false
        });
      }
      
      setConfirmationResult(result);
      setStep(2);
      
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
      const selectedUserType = userType || preSelectedUserType;
      const userData = !isLogin ? {
        fullName: formData.fullName || 'User',
        userType: selectedUserType as 'customer' | 'contractor',
        mobile: `${countryCode}${phoneNumber}`,
        profileComplete: false
      } : undefined;

      await verifyPhoneOTP(confirmationResult, otp, userData);
      
      toast({
        title: isLogin ? "Login Successful" : "Account Created",
        description: isLogin ? "Welcome back!" : "Please complete your profile in the dashboard"
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
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
                required
              />
            </div>
          </div>

          {!isLogin && !preSelectedUserType && (
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
          )}
          
          <Button 
            onClick={handleSendOTP} 
            disabled={loading || !phoneNumber}
            className="w-full"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 2: OTP verification
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
