
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, ShieldCheck, MapPin, Star, Phone, Mail } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Contractor {
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
}

const AdminContractorManagement: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      const q = query(collection(db, 'users'), where('userType', '==', 'contractor'));
      const querySnapshot = await getDocs(q);
      
      const contractorData: Contractor[] = [];
      querySnapshot.forEach((doc) => {
        contractorData.push({
          uid: doc.id,
          ...doc.data()
        } as Contractor);
      });
      
      setContractors(contractorData);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      toast({
        title: "Error",
        description: "Failed to load contractors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyContractor = async (contractorId: string, currentStatus: boolean) => {
    setVerifyingId(contractorId);
    try {
      const contractorRef = doc(db, 'users', contractorId);
      await updateDoc(contractorRef, {
        verified: !currentStatus,
        updatedAt: new Date(),
      });
      
      // Update local state
      setContractors(prev => 
        prev.map(contractor => 
          contractor.uid === contractorId 
            ? { ...contractor, verified: !currentStatus }
            : contractor
        )
      );
      
      toast({
        title: "Success",
        description: `Contractor ${!currentStatus ? 'verified' : 'unverified'} successfully`,
      });
    } catch (error) {
      console.error('Error updating contractor verification:', error);
      toast({
        title: "Error",
        description: "Failed to update contractor verification",
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contractor Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div>Loading contractors...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contractor Management</CardTitle>
        <p className="text-sm text-gray-600">
          Manage contractor verifications and view contractor profiles
        </p>
      </CardHeader>
      <CardContent>
        {contractors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No contractors found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contractors.map((contractor) => (
              <div key={contractor.uid} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={contractor.profilePicture} />
                    <AvatarFallback className="text-lg">
                      {contractor.fullName?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{contractor.fullName}</h3>
                          {contractor.verified && (
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        {contractor.companyName && (
                          <p className="text-sm text-gray-600">{contractor.companyName}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={contractor.verified ? "default" : "secondary"}>
                          {contractor.verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Button
                          variant={contractor.verified ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleVerifyContractor(contractor.uid, contractor.verified)}
                          disabled={verifyingId === contractor.uid}
                        >
                          {verifyingId === contractor.uid ? (
                            "Processing..."
                          ) : contractor.verified ? (
                            <>
                              <Shield className="h-4 w-4 mr-1" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {contractor.serviceCategory && (
                      <Badge variant="secondary" className="mb-2">
                        {contractor.serviceCategory}
                      </Badge>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {contractor.city}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {contractor.mobile}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {contractor.email}
                      </div>
                      
                      {contractor.experience && (
                        <div>
                          Experience: {contractor.experience} years
                        </div>
                      )}
                      
                      {contractor.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{contractor.rating}</span>
                          {contractor.reviewsCount && (
                            <span>({contractor.reviewsCount} reviews)</span>
                          )}
                        </div>
                      )}
                      
                      {contractor.certifications && contractor.certifications.length > 0 && (
                        <div>
                          Certificates: {contractor.certifications.length}
                        </div>
                      )}
                    </div>

                    {contractor.bio && (
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {contractor.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminContractorManagement;
