
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, MapPin, Phone, Mail, MessageCircle, Shield } from 'lucide-react';

const ContractorsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Mock data - will be replaced with real data from Firestore
  const contractors = [
    {
      id: '1',
      name: 'Raj Construction',
      category: 'Civil Work',
      rating: 4.5,
      reviewsCount: 25,
      city: 'Mumbai',
      experience: '10+ years',
      verified: true,
      profilePicture: '',
      specialties: ['Residential', 'Commercial'],
      completedProjects: 45
    },
    {
      id: '2',
      name: 'Modern Interiors',
      category: 'Interior Design',
      rating: 4.8,
      reviewsCount: 32,
      city: 'Pune',
      experience: '8+ years',
      verified: true,
      profilePicture: '',
      specialties: ['Office Design', 'Home Interiors'],
      completedProjects: 28
    },
    {
      id: '3',
      name: 'ElectroTech Solutions',
      category: 'Electrical',
      rating: 4.3,
      reviewsCount: 18,
      city: 'Mumbai',
      experience: '6+ years',
      verified: false,
      profilePicture: '',
      specialties: ['Wiring', 'Solar Installation'],
      completedProjects: 22
    }
  ];

  const categories = ['Civil Work', 'Interior Design', 'Electrical', 'Plumbing', 'Architecture', 'Landscaping'];
  const cities = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Chennai'];

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || contractor.category === selectedCategory;
    const matchesCity = !selectedCity || contractor.city === selectedCity;
    return matchesSearch && matchesCategory && matchesCity;
  });

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
                {cities.map((city) => (
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
          <Card key={contractor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contractor.profilePicture} />
                  <AvatarFallback>
                    {contractor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{contractor.name}</h3>
                    {contractor.verified && (
                      <Shield className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <Badge variant="outline">{contractor.category}</Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{contractor.rating}</span>
                  <span className="text-gray-500">({contractor.reviewsCount} reviews)</span>
                </div>
                <span className="text-gray-600">{contractor.experience}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {contractor.city}
              </div>

              <div className="text-sm">
                <span className="text-gray-600">Specialties: </span>
                <span>{contractor.specialties.join(', ')}</span>
              </div>

              <div className="text-sm text-gray-600">
                {contractor.completedProjects} projects completed
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" className="flex-1">
                  View Profile
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
