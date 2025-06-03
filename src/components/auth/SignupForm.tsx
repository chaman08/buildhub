
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Building2, Mail, Phone } from 'lucide-react';
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
  
  const { signup } = useAuth();
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
          <CardTitle className="text-center">Choose Account Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => { setUserType('customer'); setStep(2); }}
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
            onClick={() => { setUserType('contractor'); setStep(2); }}
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
                    placeholder="97545 27943"
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
                    href="https://drive.google.com/file/d/1aLchyWhfgNnotIGnvsTT4dksVBr3CZdq/view" 
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
            <PhoneAuthForm onSuccess={onSuccess} isLogin={false} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
