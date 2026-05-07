import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, startAfter, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Star, Shield, Phone, Mail } from 'lucide-react';
import { buildTrustBadges } from '@/utils/trust';

interface Contractor {
  uid: string;
  fullName: string;
  companyName?: string;
  profilePicture?: string;
  city: string;
  serviceCategory: string;
  experience: number;
  verified: boolean;
  kycStatus?: 'not_started' | 'pending' | 'under_review' | 'needs_info' | 'verified' | 'rejected';
  profileComplete?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  verificationBadge?: boolean;
  rating?: number;
  reviewsCount?: number;
  mobile: string;
  email: string;
  bio?: string;
}

const Contractors = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const PAGE_SIZE = 9;

  const categories = ['Civil Work', 'Electrical', 'Plumbing', 'Interior Design', 'Architecture', 'Landscaping'];

  useEffect(() => {
    fetchContractors();
  }, []);

  useEffect(() => {
    filterContractors();
  }, [contractors, searchTerm, selectedCategory, selectedCity]);

  const fetchContractors = async () => {
    try {
      
      const orderedQuery = query(
        collection(db, 'users'),
        where('userType', '==', 'contractor'),
        orderBy('fullName')
      );

      await loadContractorPages(orderedQuery);
    } catch (error: any) {
      console.error('Error fetching contractors (ordered):', error);
      const needsIndex = error?.code === 'failed-precondition' || `${error}`.includes('index');

      if (needsIndex) {
        console.warn('Missing index for ordered contractor query, falling back without orderBy.');
        try {
          const fallbackQuery = query(
            collection(db, 'users'),
            where('userType', '==', 'contractor')
          );
          await loadContractorPages(fallbackQuery);
        } catch (fallbackError) {
          console.error('Fallback contractor fetch failed:', fallbackError);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  };

  const loadContractorPages = async (baseQuery: any) => {
    const firstPageSnapshot = await getDocs(query(baseQuery, limit(PAGE_SIZE)));
    
    const firstBatch = firstPageSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as Contractor[];
    
    setContractors(firstBatch);
    setLoading(false);

    if (firstPageSnapshot.size === PAGE_SIZE) {
      backgroundFetchMore(baseQuery, firstPageSnapshot.docs[firstPageSnapshot.docs.length - 1]);
    }
  };

  const backgroundFetchMore = async (baseQuery: any, lastDoc: any) => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);

    try {
      let cursor = lastDoc;
      let hasMore = true;

      while (hasMore) {
        const nextSnapshot = await getDocs(query(baseQuery, startAfter(cursor), limit(PAGE_SIZE)));
        if (nextSnapshot.empty) {
          hasMore = false;
          break;
        }

        const nextBatch = nextSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as Contractor[];

        setContractors(prev => {
          const existingIds = new Set(prev.map(c => c.uid));
          const newOnes = nextBatch.filter(c => !existingIds.has(c.uid));
          return [...prev, ...newOnes];
        });

        if (nextSnapshot.size < PAGE_SIZE) {
          hasMore = false;
        } else {
          cursor = nextSnapshot.docs[nextSnapshot.docs.length - 1];
        }
      }
    } catch (error) {
      console.error('Error fetching more contractors:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const filterContractors = () => {
    let filtered = contractors;

    if (searchTerm) {
      filtered = filtered.filter(contractor =>
        contractor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(contractor =>
        contractor.serviceCategory === selectedCategory
      );
    }

    if (selectedCity && selectedCity !== 'all') {
      filtered = filtered.filter(contractor =>
        contractor.city === selectedCity
      );
    }

    setFilteredContractors(filtered);
  };

  const uniqueCities = [...new Set(contractors.map(c => c.city))].filter(Boolean);

  const handleViewProfile = (contractorId: string) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate(`/contractor/${contractorId}`);
  };

  const handleCall = (phone: string) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    window.location.href = `mailto:${email}`;
  };

  const renderSkeletons = () => {
    const skeletonItems = Array.from({ length: 6 });

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="pt-20 px-4 max-w-7xl mx-auto">
          <div className="mb-8 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>

          <Card className="mb-6 animate-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skeletonItems.map((_, index) => (
              <Card
                key={`contractor-skeleton-${index}`}
                className="border animate-card"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return renderSkeletons();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Contractors</h1>
          <p className="text-gray-600">Connect with verified construction professionals ({contractors.length} contractors available)</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contractors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {uniqueCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedCity('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {contractors.length === 0 && !loading && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <p className="text-orange-800">
                <strong>Debug:</strong> No contractors found in database. Please check:
                <br />• Firestore collection "users" exists
                <br />• Documents have userType: "contractor"
                <br />• Console logs for any errors
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contractors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContractors.map((contractor, index) => {
            const trustBadges = buildTrustBadges(contractor).slice(0, 3);
            return (
              <Card 
                key={contractor.uid} 
                className="hover:shadow-lg transition-shadow animate-card"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={contractor.profilePicture} />
                      <AvatarFallback className="text-lg">
                        {contractor.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{contractor.fullName}</h3>
                        {contractor.verified && (
                          <Shield className="h-4 w-4 text-green-600" />
                        )}
                        {contractor.kycStatus === 'verified' && (
                          <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                            <Shield className="h-3 w-3 mr-1" /> KYC
                          </Badge>
                        )}
                      </div>
                      {contractor.companyName && (
                        <p className="text-sm text-gray-600">{contractor.companyName}</p>
                      )}
                      {trustBadges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {trustBadges.map((badge) => (
                            <Badge
                              key={`${contractor.uid}-${badge.label}`}
                              variant="outline"
                              className={`${badge.className} border`}
                            >
                              {badge.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Badge variant="outline" className="w-fit">
                    {contractor.serviceCategory}
                  </Badge>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {contractor.city}
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">{contractor.experience}+ years</span> experience
                  </div>

                  {contractor.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{contractor.rating}</span>
                      {contractor.reviewsCount && (
                        <span className="text-gray-500 text-sm">({contractor.reviewsCount} reviews)</span>
                      )}
                    </div>
                  )}

                  {contractor.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">{contractor.bio}</p>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewProfile(contractor.uid)}
                    >
                      View Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCall(contractor.mobile)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEmail(contractor.email)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredContractors.length === 0 && contractors.length > 0 && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-900">No contractors found</h3>
                <p className="text-gray-500">Try adjusting your search filters</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Contractors;
