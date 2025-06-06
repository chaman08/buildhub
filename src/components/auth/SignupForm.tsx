
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { User, Building2, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationResult } from 'firebase/auth';

interface SignupFormProps {
  onSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'customer' | 'contractor' | ''>('');
  const [countryCode, setCountryCode] = useState('+91');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [phoneOTP, setPhoneOTP] = useState('');
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    city: '',
    companyName: '',
    serviceCategory: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { signup, signInWithGoogle, sendEmailVerification, sendPhoneOTP, verifyPhoneOTP, setupRecaptcha } = useAuth();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserTypeSelection = (selectedType: 'customer' | 'contractor') => {
    setUserType(selectedType);
    setStep(2);
  };

  const handleEmailVerification = async () => {
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await sendEmailVerification();
      setEmailVerified(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    if (!formData.mobile) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `${countryCode}${formData.mobile}`;
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const confirmationResult = await sendPhoneOTP(fullPhone, recaptchaVerifier);
      setPhoneConfirmationResult(confirmationResult);
      setShowPhoneOTP(true);
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

  const handlePhoneOTPVerification = async () => {
    if (!phoneConfirmationResult || phoneOTP.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await verifyPhoneOTP(phoneConfirmationResult, phoneOTP);
      setPhoneVerified(true);
      setShowPhoneOTP(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast({
        title: "Account Created!",
        description: "Successfully signed up with Google"
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Google Signup Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType || (userType !== 'customer' && userType !== 'contractor')) {
      toast({
        title: "Invalid User Type",
        description: "Please select a valid account type",
        variant: "destructive"
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: "Terms and Conditions",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const fullMobile = `${countryCode}${formData.mobile}`;
      const userData = {
        fullName: formData.fullName,
        userType,
        mobile: fullMobile,
        city: formData.city,
        isPhoneVerified: phoneVerified,
        ...(userType === 'contractor' && {
          companyName: formData.companyName,
          serviceCategory: formData.serviceCategory,
          experience: parseInt(formData.experience) || 0
        })
      };

      await signup(formData.email, formData.password, userData);
      
      toast({
        title: "Account Created!",
        description: emailVerified ? "Welcome to BuildHub!" : "Please verify your email to continue"
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Choose Account Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleUserTypeSelection('customer')}
            variant="outline"
            className="w-full h-20 text-left"
          >
            <User className="h-6 w-6 mr-3" />
            <div>
              <div className="font-semibold">Customer</div>
              <div className="text-sm text-gray-500">Post construction projects</div>
            </div>
          </Button>
          
          <Button
            onClick={() => handleUserTypeSelection('contractor')}
            variant="outline"
            className="w-full h-20 text-left"
          >
            <Building2 className="h-6 w-6 mr-3" />
            <div>
              <div className="font-semibold">Contractor</div>
              <div className="text-sm text-gray-500">Bid on construction projects</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showPhoneOTP) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Verify Phone Number</CardTitle>
          <p className="text-center text-sm text-gray-600">
            Enter the 6-digit code sent to {countryCode}{formData.mobile}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={phoneOTP}
              onChange={setPhoneOTP}
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPhoneOTP(false)}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={handlePhoneOTPVerification} 
              disabled={loading || phoneOTP.length !== 6}
              className="flex-1"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={handlePhoneVerification}
              disabled={loading}
              className="text-sm"
            >
              Resend OTP
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Sign Up as {userType === 'customer' ? 'Customer' : 'Contractor'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Button
            type="button"
            onClick={handleGoogleSignup}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? 'Signing up...' : 'Sign up with Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="fullName">
              {userType === 'contractor' ? 'Full Name / Company Name' : 'Full Name'}
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="flex-1"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleEmailVerification}
                disabled={!formData.email || emailVerified || loading}
              >
                <Mail className="h-4 w-4 mr-1" />
                {emailVerified ? 'Verified' : 'Verify'}
              </Button>
            </div>
          </div>
          
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
                name="mobile"
                type="tel"
                placeholder="Phone Number"
                value={formData.mobile}
                onChange={handleInputChange}
                className="flex-1"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handlePhoneVerification}
                disabled={!formData.mobile || phoneVerified || loading}
              >
                <Phone className="h-4 w-4 mr-1" />
                {phoneVerified ? 'Verified' : 'Verify'}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
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
              required
            />
          </div>
          
          {userType === 'contractor' && (
            <>
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
                  required
                />
              </div>
            </>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{' '}
              <a 
                href="https://drive.google.com/file/d/1VzaXqpnWkhiDGE0HVEpxpEGR003lK7VA/uc?export=download" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Terms and Conditions
              </a>
            </Label>
          </div>
          
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={loading || !acceptedTerms} className="flex-1">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>

          <div id="recaptcha-container"></div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
