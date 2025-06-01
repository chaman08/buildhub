
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, DollarSign, Eye } from 'lucide-react';
import ContractorBidModal from './ContractorBidModal';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string[];
  budget: number;
  budgetMax?: number;
  location: string;
  startDate: string;
  postedBy: string;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  createdAt: any;
  expectedDuration?: string;
  projectType?: 'residential' | 'commercial' | 'government';
}

const AvailableTenders: React.FC = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);

  const projectTypes = ['residential', 'commercial', 'government'];
  const budgetRanges = [
    { label: 'Under ₹1 Lakh', value: '0-100000' },
    { label: '₹1-5 Lakhs', value: '100000-500000' },
    { label: '₹5-10 Lakhs', value: '500000-1000000' },
    { label: '₹10-20 Lakhs', value: '1000000-2000000' },
    { label: 'Above ₹20 Lakhs', value: '2000000-999999999' }
  ];

  useEffect(() => {
    fetchAvailableProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedLocation, selectedType, selectedBudget]);

  const fetchAvailableProjects = async () => {
    try {
      console.log('Fetching available tenders...');
      
      const projectsQuery = query(
        collection(db, 'projects'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(projectsQuery);
      const projectData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      // Filter out projects posted by current contractor
      const availableProjects = projectData.filter(project => project.postedBy !== currentUser?.uid);
      
      console.log('Available tenders:', availableProjects.length);
      setProjects(availableProjects);
    } catch (error) {
      console.error('Error fetching available tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation && selectedLocation !== 'all') {
      filtered = filtered.filter(project =>
        project.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(project =>
        project.projectType === selectedType
      );
    }

    if (selectedBudget && selectedBudget !== 'all') {
      const [min, max] = selectedBudget.split('-').map(Number);
      filtered = filtered.filter(project =>
        project.budget >= min && project.budget <= max
      );
    }

    setFilteredProjects(filtered);
  };

  const formatBudget = (amount: number, maxAmount?: number) => {
    const formatAmount = (amt: number) => {
      if (!amt || isNaN(amt)) return '₹0';
      const numAmt = typeof amt === 'string' ? parseFloat(amt) : amt;
      if (isNaN(numAmt)) return '₹0';
      
      if (numAmt >= 10000000) return `₹${(numAmt / 10000000).toFixed(1)} Cr`;
      if (numAmt >= 100000) return `₹${(numAmt / 100000).toFixed(1)} L`;
      return `₹${numAmt.toLocaleString('en-IN')}`;
    };

    if (maxAmount && maxAmount !== amount) {
      return `${formatAmount(amount)} - ${formatAmount(maxAmount)}`;
    }
    return formatAmount(amount);
  };

  const handleApplyForBid = (project: Project) => {
    setSelectedProject(project);
    setShowBidModal(true);
  };

  const uniqueLocations = [...new Set(projects.map(p => p.location))].filter(Boolean);

  if (loading) {
    return <div>Loading available tenders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Available Tenders</h2>
        <Badge variant="outline" className="text-sm">
          {filteredProjects.length} tenders available
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {projectTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBudget} onValueChange={setSelectedBudget}>
              <SelectTrigger>
                <SelectValue placeholder="Budget Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                {budgetRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('');
                setSelectedType('');
                setSelectedBudget('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tenders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Open
                </Badge>
              </div>
              {project.projectType && (
                <Badge variant="secondary" className="w-fit">
                  {project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1)}
                </Badge>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600 line-clamp-3">{project.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {project.category.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {formatBudget(project.budget, project.budgetMax)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{project.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Start: {new Date(project.startDate).toLocaleDateString('en-IN')}</span>
                </div>
                
                {project.expectedDuration && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Duration: {project.expectedDuration}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(`/project/${project.id}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                
                <Button 
                  onClick={() => handleApplyForBid(project)}
                  className="flex-1"
                >
                  Apply for Bid
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && projects.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium text-gray-900">No tenders found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          </CardContent>
        </Card>
      )}

      <ContractorBidModal
        open={showBidModal}
        onOpenChange={setShowBidModal}
        project={selectedProject}
        onBidSubmitted={fetchAvailableProjects}
      />
    </div>
  );
};

export default AvailableTenders;
