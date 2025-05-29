
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ProfileCompletion: React.FC = () => {
  const [userType, setUserType] = useState<'customer' | 'contractor' | ''>('');
  const [countryCode, setCountryCode] = useState('+91');
  const [formData, setFormData] = useState({
    mobile: '',
    city: '',
    companyName: '',
    serviceCategory: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType || !formData.mobile || !formData.city) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const fullMobile = `${countryCode}${formData.mobile}`;
      const updatedProfile = {
        ...userProfile,
        userType,
        mobile: fullMobile,
        city: formData.city,
        ...(userType === 'contractor' && {
          companyName: formData.companyName,
          serviceCategory: formData.serviceCategory,
          experience: parseInt(formData.experience) || 0
        })
      };

      await setDoc(doc(db, 'users', currentUser!.uid), updatedProfile, { merge: true });
      await refreshUserProfile();
      
      toast({
        title: "Profile Updated!",
        description: "Please complete phone verification to continue"
      });
      
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile || userProfile.mobile) {
    return null; // Profile is complete or doesn't exist
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Complete Your Profile</CardTitle>
            <p className="text-center text-sm text-gray-600">
              Please provide additional information to complete your account setup
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="mobile">Mobile Number *</Label>
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
                <Label htmlFor="city">City *</Label>
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
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating Profile...' : 'Complete Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileCompletion;
