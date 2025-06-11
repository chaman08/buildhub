
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
  
  const { signup, signInWithGoogle } = useAuth();
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

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome to BuildHub!",
        description: "Account created successfully with Google. Please complete your profile."
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Google Sign-up Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure userType is valid before proceeding
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
        userType, // Now TypeScript knows this is 'customer' | 'contractor'
        mobile: fullMobile,
        city: formData.city,
        ...(userType === 'contractor' && {
          companyName: formData.companyName,
          serviceCategory: formData.serviceCategory,
          experience: parseInt(formData.experience) || 0
        })
      };

      await signup(formData.email, formData.password, userData);
      
      toast({
        title: "Account Created!",
        description: "Please verify your email or phone number to continue"
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
          <CardTitle className="text-center text-2xl font-bold">Join BuildHub</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Create your account to get started
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign-up - Prominent */}
          <Button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            variant="outline"
            size="lg"
            className="w-full h-12 text-base font-medium border-2 hover:bg-blue-50 hover:border-blue-200"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Creating Account...' : 'Continue with Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or choose account type
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-center font-semibold text-gray-900 mb-4">Choose Your Account Type</h3>
            
            {/* Customer Card */}
            <div 
              onClick={() => { setUserType('customer'); setStep(2); }}
              className="group relative p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">Customer</h4>
                  <p className="text-sm text-gray-600 mb-3">Post construction projects and find contractors</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Post unlimited projects
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Get bids from verified contractors
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Project management tools
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-blue-400 transition-colors"></div>
                </div>
              </div>
            </div>
            
            {/* Contractor Card */}
            <div 
              onClick={() => { setUserType('contractor'); setStep(2); }}
              className="group relative p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-700">Contractor</h4>
                  <p className="text-sm text-gray-600 mb-3">Bid on construction projects and grow your business</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="h-3 w-3 mr-1 text-green-500" />
                      Bid on quality projects
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Briefcase className="h-3 w-3 mr-1 text-green-500" />
                      Showcase your portfolio
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Build client relationships
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-green-400 transition-colors"></div>
                </div>
              </div>
            </div>
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
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              Phone
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Input
                  id="email"
                  name="email"
                  type="email"
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
            </form>
          </TabsContent>
          
          <TabsContent value="phone">
            <PhoneAuthForm 
              onSuccess={onSuccess} 
              isLogin={false} 
              preSelectedUserType={userType as 'customer' | 'contractor'}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
