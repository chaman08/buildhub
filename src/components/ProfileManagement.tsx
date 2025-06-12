
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText } from 'lucide-react';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

export const ProfileManagement = () => {
  const { userProfile, refreshUserProfile, markProfileComplete } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    city: '',
    occupation: '',
    userType: 'customer',
    companyName: '',
    serviceCategory: '',
    experience: '',
    bio: '',
  });
  const [certificates, setCertificates] = useState<string[]>([]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        mobile: userProfile.mobile || '',
        city: userProfile.city || '',
        occupation: userProfile.occupation || '',
        userType: userProfile.userType || 'customer',
        companyName: userProfile.companyName || '',
        serviceCategory: userProfile.serviceCategory || '',
        experience: userProfile.experience?.toString() || '',
        bio: userProfile.bio || '',
      });
      setCertificates(userProfile.certifications || []);
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, JPEG, or PNG files only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingCert(true);
    try {
      const timestamp = Date.now();
      const certRef = ref(storage, `certificates/${userProfile.uid}/${timestamp}_${file.name}`);
      await uploadBytes(certRef, file);
      const downloadURL = await getDownloadURL(certRef);
      
      const newCertificates = [...certificates, downloadURL];
      setCertificates(newCertificates);
      
      // Update user profile with new certificate
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        certifications: newCertificates,
        updatedAt: new Date(),
      });
      
      await refreshUserProfile();
      toast({
        title: "Certificate Uploaded",
        description: "Your certificate has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingCert(false);
      // Reset the input
      e.target.value = '';
    }
  };

  const handleRemoveCertificate = async (certUrl: string, index: number) => {
    if (!userProfile) return;

    try {
      // Remove from storage
      const certRef = ref(storage, certUrl);
      await deleteObject(certRef);
      
      // Remove from state and database
      const newCertificates = certificates.filter((_, i) => i !== index);
      setCertificates(newCertificates);
      
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        certifications: newCertificates,
        updatedAt: new Date(),
      });
      
      await refreshUserProfile();
      toast({
        title: "Certificate Removed",
        description: "Certificate has been removed successfully.",
      });
    } catch (error) {
      console.error('Error removing certificate:', error);
      toast({
        title: "Error",
        description: "Failed to remove certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    // Validate required fields before saving
    if (!formData.fullName || !formData.mobile || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields (Name, Mobile, and City).",
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
        experience: formData.experience ? parseInt(formData.experience) : 0,
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
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                name="mobile"
                value={formData.mobile}
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

          {formData.userType === 'contractor' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bio">About/Description</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Describe your services, experience, and what makes you unique..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Certificates</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="certificate-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload certificates (PDF, JPEG, PNG)
                        </span>
                        <span className="block text-xs text-gray-500">
                          Max 5MB per file
                        </span>
                      </label>
                      <input
                        id="certificate-upload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleCertificateUpload}
                        disabled={uploadingCert}
                        className="hidden"
                      />
                    </div>
                    {uploadingCert && (
                      <div className="mt-2">
                        <div className="text-sm text-blue-600">Uploading...</div>
                      </div>
                    )}
                  </div>
                </div>

                {certificates.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Uploaded Certificates</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {certificates.map((certUrl, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              Certificate {index + 1}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(certUrl, '_blank')}
                            >
                              View
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCertificate(certUrl, index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : (userProfile.profileComplete ? 'Update Profile' : 'Complete Profile')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
