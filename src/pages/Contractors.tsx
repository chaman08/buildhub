import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import ContractorPreview from '@/components/ContractorPreview';
import MobileFilterButton from '@/components/MobileFilterButton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star } from 'lucide-react';

interface Contractor {
  id: string;
  fullName: string;
  companyName: string;
  serviceCategory: string;
  experience: number;
  city: string;
  profilePicture?: string;
  rating?: number;
  completedProjects?: number;
  description?: string;
  skills?: string[];
}

const Contractors = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  const serviceCategories = [
    'Civil Construction', 'Electrical', 'Plumbing', 'Painting', 'Carpentry',
    'Interior Design', 'Architecture', 'Landscaping', 'Roofing', 'Flooring'
  ];

  const experienceRanges = [
    { label: '0-2 years', value: '0-2' },
    { label: '3-5 years', value: '3-5' },
    { label: '6-10 years', value: '6-10' },
    { label: '10+ years', value: '10-100' }
  ];

  useEffect(() => {
    fetchContractors();
  }, []);

  useEffect(() => {
    filterContractors();
  }, [contractors, searchTerm, selectedCategory, selectedExperience, selectedLocation]);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const contractorsCollection = collection(db, 'users');
      const snapshot = await getDocs(contractorsCollection);
      
      const contractorData = snapshot.docs
        .map(doc => {
          const data = doc.data();
          if (data.userType === 'contractor') {
            return { id: doc.id, ...data } as Contractor;
          }
          return null;
        })
        .filter(Boolean) as Contractor[];
      
      // Extract unique locations for the filter
      const locations = [...new Set(contractorData.map(contractor => contractor.city).filter(Boolean))].sort();
      setAvailableLocations(locations);

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
        contractor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(contractor =>
        contractor.serviceCategory === selectedCategory
      );
    }

    if (selectedExperience && selectedExperience !== 'all') {
      const [min, max] = selectedExperience.split('-').map(Number);
      filtered = filtered.filter(contractor =>
        contractor.experience >= min && contractor.experience <= max
      );
    }

    if (selectedLocation && selectedLocation !== 'all') {
      filtered = filtered.filter(contractor =>
        contractor.city === selectedLocation
      );
    }

    setFilteredContractors(filtered);
  };

  const FilterContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          {serviceCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedExperience} onValueChange={setSelectedExperience}>
        <SelectTrigger>
          <SelectValue placeholder="Experience" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Experience</SelectItem>
          {experienceRanges.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
        <SelectTrigger>
          <SelectValue placeholder="All Locations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {availableLocations.map((location) => (
            <SelectItem key={location} value={location}>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {location}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => {
          setSearchTerm('');
          setSelectedCategory('');
          setSelectedExperience('');
          setSelectedLocation('');
        }}
        className="md:block hidden"
      >
        Clear Filters
      </Button>
    </div>
  );

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
          <p className="text-gray-600">Browse verified contractors for your construction projects ({contractors.length} contractors available)</p>
        </div>

        {/* Mobile Filter Button */}
        <MobileFilterButton title="Contractor Filters">
          <FilterContent />
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedExperience('');
              setSelectedLocation('');
            }}
            className="w-full mt-4"
          >
            Clear Filters
          </Button>
        </MobileFilterButton>

        {/* Desktop Search and Filters */}
        <Card className="mb-6 hidden md:block">
          <CardContent className="p-6">
            <FilterContent />
          </CardContent>
        </Card>

        {/* Contractors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContractors.map((contractor) => (
            <ContractorPreview key={contractor.id} contractor={contractor} />
          ))}
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
