import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, MapPin, Phone, Mail, MessageCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

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
}

const ContractorsSection: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const categories = ['Civil Work', 'Interior Design', 'Electrical', 'Plumbing', 'Architecture', 'Landscaping'];

  useEffect(() => {
    fetchContractors();
  }, []);

  useEffect(() => {
    filterContractors();
  }, [contractors, searchTerm, selectedCategory, selectedCity]);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      setError('Failed to load contractors. Please try again later.');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Explore Contractors</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div>Loading contractors...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Explore Contractors</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-red-600">Error Loading Contractors</h3>
              <p className="text-gray-600">{error}</p>
              <Button onClick={fetchContractors}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Explore Contractors</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContractors.map((contractor) => (
          <Card key={contractor.uid} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contractor.profilePicture} />
                  <AvatarFallback>
                    {contractor.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{contractor.fullName}</h3>
                    {contractor.verified && (
                      <Shield className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <Badge variant="outline">{contractor.serviceCategory}</Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                {contractor.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{contractor.rating}</span>
                    {contractor.reviewsCount && (
                      <span className="text-gray-500">({contractor.reviewsCount} reviews)</span>
                    )}
                  </div>
                )}
                <span className="text-gray-600">{contractor.experience}+ years experience</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {contractor.city}
              </div>

              {contractor.bio && (
                <div className="text-sm text-gray-600 line-clamp-2">
                  {contractor.bio}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" className="flex-1" asChild>
                  <Link to={`/contractor/${contractor.uid}`}>View Profile</Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContractors.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-gray-900">No contractors found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractorsSection;
