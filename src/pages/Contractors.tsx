
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Shield, Phone, Mail } from 'lucide-react';

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
}

const Contractors = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const categories = ['Civil Work', 'Electrical', 'Plumbing', 'Interior Design', 'Architecture', 'Landscaping'];

  useEffect(() => {
    fetchContractors();
  }, []);

  useEffect(() => {
    filterContractors();
  }, [contractors, searchTerm, selectedCategory, selectedCity]);

  const fetchContractors = async () => {
    try {
      const contractorQuery = query(
        collection(db, 'users'),
        where('userType', '==', 'contractor')
      );
      const snapshot = await getDocs(contractorQuery);
      const contractorData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as Contractor[];
      
      setContractors(contractorData);
    } catch (error) {
      console.error('Error fetching contractors:', error);
    } finally {
      setLoading(false);
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

    if (selectedCategory) {
      filtered = filtered.filter(contractor =>
        contractor.serviceCategory === selectedCategory
      );
    }

    if (selectedCity) {
      filtered = filtered.filter(contractor =>
        contractor.city === selectedCity
      );
    }

    setFilteredContractors(filtered);
  };

  const uniqueCities = [...new Set(contractors.map(c => c.city))].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div>Loading contractors...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Contractors</h1>
          <p className="text-gray-600">Connect with verified construction professionals</p>
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
                  <SelectItem value="">All Categories</SelectItem>
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
                  <SelectItem value="">All Cities</SelectItem>
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

        {/* Contractors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContractors.map((contractor) => (
            <Card key={contractor.uid} className="hover:shadow-lg transition-shadow">
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
                    </div>
                    {contractor.companyName && (
                      <p className="text-sm text-gray-600">{contractor.companyName}</p>
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

                <div className="flex gap-2 pt-4 border-t">
                  <Button asChild size="sm" className="flex-1">
                    <Link to={`/contractor/${contractor.uid}`}>
                      View Profile
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContractors.length === 0 && (
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
