import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Building2, Mail, Phone, CheckCircle, Star, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PhoneAuthForm from './PhoneAuthForm';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SignupFormProps {
  onSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'customer' | 'contractor' | ''>('');
  const [countryCode, setCountryCode] = useState('+91');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
  
  const { signup, signInWithGoogle, currentUser } = useAuth();
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

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Google Authentication Successful",
        description: "Please complete your profile to continue"
      });
    } catch (error: any) {
      console.error('Google signup error:', error);
      toast({
        title: "Google Sign-up Failed",
        description: error.message || "Failed to sign up with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      toast({
        title: "Account Type Required",
        description: "Please select an account type",
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

    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please try signing in again",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        userType,
        mobile: `${countryCode}${formData.mobile}`,
        city: formData.city,
        ...(userType === 'contractor' && {
          companyName: formData.companyName,
          serviceCategory: formData.serviceCategory,
          experience: parseInt(formData.experience) || 0
        }),
        profileComplete: true,
        updatedAt: new Date()
      };

      // Update the user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, userData, { merge: true });
      
      toast({
        title: "Profile Updated!",
        description: "Your profile has been updated successfully"
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Profile Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      toast({
        title: "Account Type Required",
        description: "Please select an account type",
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

    if (formData.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        fullName: formData.fullName,
        userType,
        mobile: `${countryCode}${formData.mobile}`,
        city: formData.city,
        ...(userType === 'contractor' && {
          companyName: formData.companyName,
          serviceCategory: formData.serviceCategory,
          experience: parseInt(formData.experience) || 0
        }),
        profileComplete: true
      };

      await signup(formData.email, formData.password, userData);
      
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account"
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Sign-up Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Profile Completion (for Google Sign-up)
  if (currentUser && step === 2) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGoogleProfileUpdate} className="space-y-4">
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
              </div>
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>

            {userType === 'contractor' && (
              <>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Enter your company name"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="serviceCategory">Service Category</Label>
                  <Select
                    value={formData.serviceCategory}
                    onValueChange={(value) => setFormData({ ...formData, serviceCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
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
                    placeholder="Enter years of experience"
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
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                required
              />
              <Label htmlFor="terms" className="text-sm">
                I accept the terms and conditions
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating Profile...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Regular Sign-up Form
  return (
    <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Create an Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                Signing up...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </div>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with email
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
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
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
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
              placeholder="Confirm your password"
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
              placeholder="Enter your city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label>Account Type</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Button
                type="button"
                variant={userType === 'customer' ? 'default' : 'outline'}
                onClick={() => setUserType('customer')}
                className="h-auto p-4 flex flex-col items-center"
              >
                <User className="h-6 w-6 mb-2" />
                <span>Customer</span>
                <span className="text-xs text-muted-foreground mt-1">I want to hire contractors</span>
              </Button>
              <Button
                type="button"
                variant={userType === 'contractor' ? 'default' : 'outline'}
                onClick={() => setUserType('contractor')}
                className="h-auto p-4 flex flex-col items-center"
              >
                <Building2 className="h-6 w-6 mb-2" />
                <span>Contractor</span>
                <span className="text-xs text-muted-foreground mt-1">I want to offer services</span>
              </Button>
            </div>
          </div>

          {userType === 'contractor' && (
            <>
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="serviceCategory">Service Category</Label>
                <Select
                  value={formData.serviceCategory}
                  onValueChange={(value) => setFormData({ ...formData, serviceCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
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
                  placeholder="Enter years of experience"
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
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              required
            />
            <Label htmlFor="terms" className="text-sm">
              I accept the terms and conditions
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
