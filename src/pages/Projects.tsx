import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where, startAfter, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useBookmarks } from '@/contexts/BookmarkContext';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin } from 'lucide-react';

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
}

const Projects = () => {
  const { currentUser } = useAuth();
  const { isProjectBookmarked, toggleProjectBookmark } = useBookmarks();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const PAGE_SIZE = 9;

  const categories = ['Civil Work', 'Electrical', 'Plumbing', 'Interior Design', 'Architecture', 'Landscaping'];
  const budgetRanges = [
    { label: 'Under ₹1 Lakh', value: '0-100000' },
    { label: '₹1-5 Lakhs', value: '100000-500000' },
    { label: '₹5-10 Lakhs', value: '500000-1000000' },
    { label: '₹10-20 Lakhs', value: '1000000-2000000' },
    { label: 'Above ₹20 Lakhs', value: '2000000-999999999' }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedCategory, selectedBudget, selectedLocation]);

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects from Firestore...');
      const baseQuery = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc')
      );

      const firstPageSnapshot = await getDocs(query(baseQuery, limit(PAGE_SIZE)));
      console.log('First page projects fetched:', firstPageSnapshot.size);

      const firstBatch = firstPageSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

      const openFirstBatch = firstBatch.filter(project => project.status === 'open');
      setProjects(openFirstBatch);
      setAvailableLocations(
        [...new Set(openFirstBatch.map(project => project.location).filter(Boolean))].sort()
      );
      setLoading(false);

      // Background fetch more pages without blocking initial render
      if (firstPageSnapshot.size === PAGE_SIZE) {
        backgroundFetchMore(baseQuery, firstPageSnapshot.docs[firstPageSnapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
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
          id: doc.id,
          ...doc.data()
        })) as Project[];

        const openBatch = nextBatch.filter(project => project.status === 'open');

        setProjects(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newOnes = openBatch.filter(project => !existingIds.has(project.id));
          const combined = [...prev, ...newOnes];
          setAvailableLocations(
            [...new Set(combined.map(project => project.location).filter(Boolean))].sort()
          );
          return combined;
        });

        if (nextSnapshot.size < PAGE_SIZE) {
          hasMore = false;
        } else {
          cursor = nextSnapshot.docs[nextSnapshot.docs.length - 1];
        }
      }
    } catch (error) {
      console.error('Error fetching more projects:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(project =>
        project.category && project.category.includes(selectedCategory)
      );
    }

    if (selectedBudget && selectedBudget !== 'all') {
      const [min, max] = selectedBudget.split('-').map(Number);
      filtered = filtered.filter(project =>
        project.budget >= min && project.budget <= max
      );
    }

    if (selectedLocation && selectedLocation !== 'all') {
      filtered = filtered.filter(project =>
        project.location && project.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Skeleton className="h-10 w-full" />
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
                key={`project-skeleton-${index}`}
                className="border animate-card"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CardHeader className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-12" />
                  </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Projects</h1>
          <p className="text-gray-600">Browse and bid on construction projects ({projects.length} projects available)</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
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
                  setSelectedBudget('');
                  setSelectedLocation('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {projects.length === 0 && !loading && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <p className="text-orange-800">
                <strong>Debug:</strong> No projects found in database. Please check:
                <br />• Firestore collection "projects" exists
                <br />• Documents have the correct structure
                <br />• Console logs for any errors
              </p>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="animate-card"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <ProjectCard
                project={project}
                onSaveProject={toggleProjectBookmark}
                isSaved={isProjectBookmarked(project.id)}
              />
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No projects found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
