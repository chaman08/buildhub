
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, Shield, Phone, Mail, MessageCircle, ArrowLeft } from 'lucide-react';

interface ContractorProfile {
  uid: string;
  fullName: string;
  companyName?: string;
  profilePicture?: string;
  city: string;
  serviceCategory: string;
  experience: number;
  verified: boolean;
  rating?: number;
  reviewsCount?: number;
  mobile: string;
  email: string;
  bio?: string;
  certifications?: string[];
  portfolio?: string[];
}

const ContractorProfile = () => {
  const { uid } = useParams<{ uid: string }>();
  const [contractor, setContractor] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uid) {
      fetchContractorProfile();
    }
  }, [uid]);

  const fetchContractorProfile = async () => {
    if (!uid) return;

    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userType === 'contractor') {
          setContractor({ uid, ...data } as ContractorProfile);
        } else {
          setError('This user is not a contractor');
        }
      } else {
        setError('Contractor not found');
      }
    } catch (error) {
      console.error('Error fetching contractor:', error);
      setError('Failed to load contractor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div>Loading contractor profile...</div>
        </div>
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 px-4 max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error || 'Contractor not found'}
              </h3>
              <Button asChild>
                <Link to="/contractors">Back to Contractors</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/contractors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contractors
            </Link>
          </Button>
        </div>

        {/* Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32 mx-auto md:mx-0">
                <AvatarImage src={contractor.profilePicture} />
                <AvatarFallback className="text-3xl">
                  {contractor.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{contractor.fullName}</h1>
                  {contractor.verified && (
                    <Shield className="h-6 w-6 text-green-600" />
                  )}
                </div>
                
                {contractor.companyName && (
                  <p className="text-lg text-gray-600 mb-2">{contractor.companyName}</p>
                )}
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{contractor.city}</span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="font-medium">{contractor.experience}+ years</span> experience
                  </div>
                  
                  {contractor.rating && (
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{contractor.rating}</span>
                      {contractor.reviewsCount && (
                        <span className="text-gray-500">({contractor.reviewsCount} reviews)</span>
                      )}
                    </div>
                  )}
                </div>
                
                <Badge variant="outline" className="mb-4">
                  {contractor.serviceCategory}
                </Badge>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-start">
                  <Button>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              {contractor.bio || `Professional ${contractor.serviceCategory.toLowerCase()} contractor with ${contractor.experience}+ years of experience serving clients in ${contractor.city}.`}
            </p>
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{contractor.serviceCategory}</Badge>
              {/* Additional services can be added here from contractor data */}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <span>{contractor.mobile}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <span>{contractor.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span>{contractor.city}</span>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Section (Placeholder) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              Portfolio images will be displayed here when uploaded by the contractor.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractorProfile;
