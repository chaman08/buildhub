
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
import { Upload, X, FileText, Image as ImageIcon, User, Building2 } from 'lucide-react';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import ServiceCategorySelector from './ServiceCategorySelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDIA_STATES, STATE_CITIES } from '@/lib/india-locations';

export const ProfileManagement = () => {
  const { currentUser, userProfile, refreshUserProfile, markProfileComplete } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [uploadingCatalogue, setUploadingCatalogue] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    city: '',
    state: '',
    occupation: '',
    userType: 'customer',
    companyName: '',
    serviceCategory: [] as string[],
    experience: '',
    bio: '',
  });
  const [certificates, setCertificates] = useState<string[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<{ url: string; caption?: string }[]>([]);
  const [catalogues, setCatalogues] = useState<{ url: string; name?: string; type?: string }[]>([]);
  const [pendingPortfolio, setPendingPortfolio] = useState<{ file: File; caption: string; preview: string }[]>([]);

  const getUserId = () => userProfile?.uid || currentUser?.uid;

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        mobile: userProfile.mobile || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        occupation: userProfile.occupation || '',
        userType: userProfile.userType || 'customer',
        companyName: userProfile.companyName || '',
        serviceCategory: userProfile.serviceCategory ? (Array.isArray(userProfile.serviceCategory) ? userProfile.serviceCategory : userProfile.serviceCategory.split(', ').filter(Boolean)) : [] as string[],
        experience: userProfile.experience?.toString() || '',
        bio: userProfile.bio || '',
      });
      setCertificates(userProfile.certifications || []);
      setPortfolioImages(
        userProfile.portfolioImages ||
        (userProfile.portfolio ? userProfile.portfolio.map((url: string) => ({ url, caption: '' })) : [])
      );
      setCatalogues(userProfile.catalogues || []);
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (value: 'customer' | 'contractor') => {
    setFormData(prev => ({
      ...prev,
      userType: value
    }));
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const userId = getUserId();
    if (!file || !userProfile || !userId) {
      if (!userId) {
        toast({
          title: "User not ready",
          description: "Please sign in again before uploading certificates.",
          variant: "destructive",
        });
      }
      return;
    }

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
      const certRef = ref(storage, `certificates/${userId}/${timestamp}_${file.name}`);
      await uploadBytes(certRef, file);
      const downloadURL = await getDownloadURL(certRef);

      const newCertificates = [...certificates, downloadURL];
      setCertificates(newCertificates);

      // Update user profile with new certificate
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        certifications: newCertificates,
        updatedAt: new Date(),
        uid: userId,
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

  const handlePortfolioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const selected = Array.from(files).map((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not JPEG/PNG/WEBP.`,
          variant: "destructive",
        });
        return null;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 8MB.`,
          variant: "destructive",
        });
        return null;
      }
      return {
        file,
        caption: '',
        preview: URL.createObjectURL(file),
      };
    }).filter(Boolean) as { file: File; caption: string; preview: string }[];

    if (selected.length) {
      setPendingPortfolio((prev) => [...prev, ...selected]);
    }
    e.target.value = '';
  };

  const handlePendingCaptionChange = (index: number, value: string) => {
    setPendingPortfolio((prev) =>
      prev.map((item, i) => (i === index ? { ...item, caption: value } : item))
    );
  };

  const handleUploadPendingPortfolio = async () => {
    const userId = getUserId();
    if (!userProfile || !userId || pendingPortfolio.length === 0) {
      if (!userId && pendingPortfolio.length > 0) {
        toast({
          title: "User not ready",
          description: "Please sign in again before uploading portfolio images.",
          variant: "destructive",
        });
      }
      return;
    }

    setUploadingPortfolio(true);
    try {
      const uploaded: { url: string; caption?: string }[] = [];

      for (const item of pendingPortfolio) {
        const timestamp = Date.now();
        const portfolioRef = ref(storage, `portfolio/${userId}/${timestamp}_${item.file.name}`);
        await uploadBytes(portfolioRef, item.file);
        const downloadURL = await getDownloadURL(portfolioRef);
        uploaded.push({
          url: downloadURL,
          caption: item.caption.trim() || item.file.name,
        });
      }

      const updated = [...portfolioImages, ...uploaded];
      setPortfolioImages(updated);
      setPendingPortfolio([]);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        portfolioImages: updated,
        updatedAt: new Date(),
        uid: userId,
      });

      await refreshUserProfile();
      toast({
        title: "Portfolio Updated",
        description: `${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded.`,
      });
    } catch (error) {
      console.error('Error uploading portfolio images:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload selected images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleRemovePendingPortfolio = (index: number) => {
    setPendingPortfolio((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemovePortfolioImage = async (imageUrl: string, index: number) => {
    const userId = getUserId();
    if (!userProfile || !userId) {
      toast({
        title: "User not ready",
        description: "Please sign in again before removing portfolio images.",
        variant: "destructive",
      });
      return;
    }

    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);

      const updated = portfolioImages.filter((_, i) => i !== index);
      setPortfolioImages(updated);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        portfolioImages: updated,
        updatedAt: new Date(),
      });

      await refreshUserProfile();
      toast({
        title: "Portfolio Image Removed",
        description: "The image has been removed from your profile.",
      });
    } catch (error) {
      console.error('Error removing portfolio image:', error);
      toast({
        title: "Error",
        description: "Failed to remove this image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCatalogueUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const userId = getUserId();
    if (!file || !userProfile || !userId) {
      if (!userId) {
        toast({
          title: "User not ready",
          description: "Please sign in again before uploading catalogues.",
          variant: "destructive",
        });
      }
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Upload a PDF or image (JPEG/PNG/WEBP).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload files under 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingCatalogue(true);
    try {
      const timestamp = Date.now();
      const catRef = ref(storage, `catalogues/${userId}/${timestamp}_${file.name}`);
      await uploadBytes(catRef, file);
      const downloadURL = await getDownloadURL(catRef);

      const type = file.type === 'application/pdf' ? 'pdf' : 'image';
      const entry = { url: downloadURL, name: file.name, type };
      const updated = [...catalogues, entry];
      setCatalogues(updated);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        catalogues: updated,
        updatedAt: new Date(),
        uid: userId,
      });

      await refreshUserProfile();
      toast({
        title: "Catalogue Added",
        description: "Your catalogue has been uploaded.",
      });
    } catch (error) {
      console.error('Error uploading catalogue:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload this file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingCatalogue(false);
      e.target.value = '';
    }
  };

  const handleRemoveCatalogue = async (catalogueUrl: string, index: number) => {
    const userId = getUserId();
    if (!userProfile || !userId) {
      toast({
        title: "User not ready",
        description: "Please sign in again before removing catalogues.",
        variant: "destructive",
      });
      return;
    }

    try {
      const catRef = ref(storage, catalogueUrl);
      await deleteObject(catRef);

      const updated = catalogues.filter((_, i) => i !== index);
      setCatalogues(updated);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        catalogues: updated,
        updatedAt: new Date(),
        uid: userId,
      });

      await refreshUserProfile();
      toast({
        title: "Catalogue Removed",
        description: "The catalogue has been removed.",
      });
    } catch (error) {
      console.error('Error removing catalogue:', error);
      toast({
        title: "Error",
        description: "Failed to remove this catalogue. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCertificate = async (certUrl: string, index: number) => {
    const userId = getUserId();
    if (!userProfile || !userId) {
      toast({
        title: "User not ready",
        description: "Please sign in again before removing certificates.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Remove from storage
      const certRef = ref(storage, certUrl);
      await deleteObject(certRef);

      // Remove from state and database
      const newCertificates = certificates.filter((_, i) => i !== index);
      setCertificates(newCertificates);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        certifications: newCertificates,
        updatedAt: new Date(),
        uid: userId,
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
    const userId = getUserId();
    if (!userProfile || !userId) {
      toast({
        title: "User not ready",
        description: "Please sign in again before saving your profile.",
        variant: "destructive",
      });
      return;
    }

    const userTypeChanged = formData.userType !== userProfile.userType;

    // Validate required fields
    if (!formData.fullName || !formData.mobile || !formData.city || !formData.state) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Mobile, State, and City)",
        variant: "destructive",
      });
      return;
    }

    // Add mobile validation for India (10 digits)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    if (formData.userType === 'contractor' && (!formData.companyName || formData.serviceCategory.length === 0)) {
      toast({
        title: "Missing Information",
        description: "Contractors must provide Company Name and at least one Service Category.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        ...formData,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        serviceCategory: formData.serviceCategory.join(', '),
        updatedAt: new Date(),
        uid: userId,
      };

      await updateDoc(userRef, updateData);

      // Mark profile as complete if all required fields are filled
      await markProfileComplete();

      await refreshUserProfile();
      toast({
        title: "Profile Updated",
        description: userTypeChanged
          ? `Account type updated to ${formData.userType}. ${formData.userType === 'contractor' ? 'Fill out your company details so customers can find you.' : 'Contractor-only fields are now hidden.'}`
          : "Your profile has been successfully updated and marked as complete.",
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
          <div className="space-y-2">
            <Label>Account Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                type="button"
                variant={formData.userType === 'customer' ? 'default' : 'outline'}
                className="w-full h-auto justify-start gap-3"
                onClick={() => handleUserTypeChange('customer')}
              >
                <User className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Customer</p>
                  <p className="text-xs text-muted-foreground">I want to hire contractors</p>
                </div>
              </Button>

              <Button
                type="button"
                variant={formData.userType === 'contractor' ? 'default' : 'outline'}
                className="w-full h-auto justify-start gap-3"
                onClick={() => handleUserTypeChange('contractor')}
              >
                <Building2 className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Contractor</p>
                  <p className="text-xs text-muted-foreground">I want to offer services</p>
                </div>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Switch roles anytime. Contractors need company name and service category.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="state">State *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData(prev => ({ ...prev, state: value, city: '' }))}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {INDIA_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                disabled={!formData.state}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder={formData.state ? "Select City" : "Select State first"} />
                </SelectTrigger>
                <SelectContent>
                  {formData.state && STATE_CITIES[formData.state]?.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

                <div className="md:col-span-2 space-y-2">
                  <Label>Service Category *</Label>
                  <ServiceCategorySelector
                    selectedCategories={formData.serviceCategory}
                    onChange={(categories) => setFormData(prev => ({ ...prev, serviceCategory: categories }))}
                    multiSelect={true}
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

              {/* Portfolio */}
              <div className="space-y-3">
                <Label>Portfolio Images</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Select multiple images at once, then set a caption for each before uploading. JPEG/PNG/WEBP, max 8MB each.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <label className="w-full">
                      <div className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg h-12 cursor-pointer hover:border-blue-200 transition">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Add Images</span>
                      </div>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        multiple
                        className="hidden"
                        onChange={handlePortfolioSelect}
                        disabled={uploadingPortfolio}
                      />
                    </label>
                  </div>
                </div>

                {pendingPortfolio.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Images ready to upload ({pendingPortfolio.length})</p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleUploadPendingPortfolio}
                        disabled={uploadingPortfolio}
                      >
                        {uploadingPortfolio ? 'Uploading...' : 'Upload All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {pendingPortfolio.map((item, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <div className="aspect-video bg-gray-100 relative">
                            <img
                              src={item.preview}
                              alt={`Pending ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow"
                              onClick={() => handleRemovePendingPortfolio(index)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="p-3 space-y-2">
                            <p className="text-xs text-gray-500 truncate">{item.file.name}</p>
                            <Input
                              placeholder="Caption for this image"
                              value={item.caption}
                              onChange={(e) => handlePendingCaptionChange(index, e.target.value)}
                              disabled={uploadingPortfolio}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {portfolioImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {portfolioImages.map((item, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-100 relative">
                          <img
                            src={item.url}
                            alt={item.caption || `Portfolio ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow"
                            onClick={() => handleRemovePortfolioImage(item.url, index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="p-3 flex items-start gap-2">
                          <ImageIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {item.caption || 'Portfolio image'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Catalogues */}
              <div className="space-y-3">
                <Label>Catalogues / Brochures</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                  <div className="text-center space-y-1">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">Upload PDF or Image</p>
                    <p className="text-xs text-gray-500">Max 10MB, PDF/JPEG/PNG/WEBP</p>
                    <label className="inline-flex justify-center mt-2">
                      <Button type="button" disabled={uploadingCatalogue}>
                        {uploadingCatalogue ? 'Uploading...' : 'Select File'}
                      </Button>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={handleCatalogueUpload}
                        disabled={uploadingCatalogue}
                      />
                    </label>
                  </div>
                </div>

                {catalogues.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Catalogues</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {catalogues.map((cat, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {cat.name || `Catalogue ${index + 1}`}
                              </p>
                              <p className="text-xs text-gray-500 uppercase">{cat.type || 'file'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(cat.url, '_blank')}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCatalogue(cat.url, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
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
