
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { Search, MapPin, Calendar, DollarSign, Filter } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// Mock data for tenders
const mockTenders = [
  {
    id: 1,
    title: "Commercial Office Renovation",
    description: "Complete renovation of a 5000 sq ft office space including electrical, plumbing, and interior work",
    budget: { min: 75000, max: 100000 },
    location: "New York, NY",
    timeline: "2-3 months",
    postedDate: "2023-05-01",
    tags: ["Commercial", "Renovation", "Interior"]
  },
  {
    id: 2,
    title: "Residential Solar Panel Installation",
    description: "Installation of solar panels on 15 residential properties in a suburban neighborhood",
    budget: { min: 50000, max: 65000 },
    location: "Los Angeles, CA",
    timeline: "1 month",
    postedDate: "2023-05-05",
    tags: ["Residential", "Solar", "Green Energy"]
  },
  {
    id: 3,
    title: "Public Park Landscaping",
    description: "Landscaping and installation of playground equipment for a new community park",
    budget: { min: 120000, max: 150000 },
    location: "Chicago, IL",
    timeline: "3-4 months",
    postedDate: "2023-05-08",
    tags: ["Government", "Landscaping", "Public Space"]
  },
  {
    id: 4,
    title: "Hospital Wing Construction",
    description: "Construction of a new emergency department wing for an existing hospital",
    budget: { min: 2000000, max: 2500000 },
    location: "Houston, TX",
    timeline: "12-18 months",
    postedDate: "2023-05-10",
    tags: ["Healthcare", "Construction", "Commercial"]
  },
  {
    id: 5,
    title: "School Auditorium Acoustics Upgrade",
    description: "Upgrade of acoustic systems and seating in a high school auditorium",
    budget: { min: 85000, max: 110000 },
    location: "Miami, FL",
    timeline: "2 months",
    postedDate: "2023-05-12",
    tags: ["Education", "Acoustics", "Renovation"]
  },
  {
    id: 6,
    title: "Retail Space Fit-Out",
    description: "Complete fit-out of a 3000 sq ft retail space in a shopping mall",
    budget: { min: 60000, max: 80000 },
    location: "Seattle, WA",
    timeline: "6-8 weeks",
    postedDate: "2023-05-15",
    tags: ["Retail", "Interior", "Commercial"]
  },
  {
    id: 7,
    title: "Highway Bridge Repair",
    description: "Structural repair and resurfacing of a 200ft highway bridge",
    budget: { min: 500000, max: 750000 },
    location: "Denver, CO",
    timeline: "4-6 months",
    postedDate: "2023-05-18",
    tags: ["Infrastructure", "Government", "Repair"]
  },
  {
    id: 8,
    title: "Restaurant Kitchen Renovation",
    description: "Complete renovation and equipment update for a restaurant kitchen",
    budget: { min: 95000, max: 120000 },
    location: "Austin, TX",
    timeline: "1-2 months",
    postedDate: "2023-05-20",
    tags: ["Food Service", "Commercial", "Renovation"]
  },
];

// Filter options
const categoryFilters = [
  "All Categories",
  "Residential",
  "Commercial",
  "Government",
  "Healthcare",
  "Education",
  "Retail",
  "Infrastructure"
];

const locationFilters = [
  "All Locations",
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Miami, FL",
  "Seattle, WA",
  "Denver, CO",
  "Austin, TX"
];

const timelineFilters = [
  "Any Timeline",
  "Under 1 month",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "Over 12 months"
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Responsive Card Component for Tenders
const TenderCard = ({ tender, view }: { tender: any, view: 'card' | 'list' }) => {
  return (
    <Card className={`h-full transition-all hover:shadow-md ${view === 'list' ? 'flex flex-col md:flex-row' : ''}`}>
      <div className={view === 'list' ? 'md:w-2/3' : ''}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{tender.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Posted: {formatDate(tender.postedDate)}
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin size={16} className="mr-1" />
            {tender.location}
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <CardDescription className={view === 'card' ? 'line-clamp-2' : ''}>
            {tender.description}
          </CardDescription>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <DollarSign size={16} className="mr-1 text-muted-foreground" />
              <span className="text-sm">
                {formatCurrency(tender.budget.min)} - {formatCurrency(tender.budget.max)}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1 text-muted-foreground" />
              <span className="text-sm">{tender.timeline}</span>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {tender.tags.map((tag: string, i: number) => (
              <span 
                key={i}
                className="px-2 py-1 bg-primary-50 text-primary-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </div>
      
      <CardFooter className={`pt-4 ${view === 'list' ? 'md:w-1/3 md:flex md:items-center md:justify-end' : ''}`}>
        <Button className="w-full">View Project</Button>
      </CardFooter>
    </Card>
  );
};

const TendersPage = () => {
  const [view, setView] = useState<'card' | 'list'>('card');
  const [tenders, setTenders] = useState(mockTenders);
  const [filteredTenders, setFilteredTenders] = useState(mockTenders);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [timelineFilter, setTimelineFilter] = useState('Any Timeline');
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 2500000]);
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  
  const itemsPerPage = 6;
  
  // Apply filters and sorting
  useEffect(() => {
    let results = [...tenders];
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(tender => 
        tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'All Categories') {
      results = results.filter(tender => 
        tender.tags.some((tag: string) => tag === categoryFilter)
      );
    }
    
    // Apply location filter
    if (locationFilter !== 'All Locations') {
      results = results.filter(tender => tender.location === locationFilter);
    }
    
    // Apply timeline filter
    if (timelineFilter !== 'Any Timeline') {
      // Logic would depend on how timeline is stored and filtered
      // This is just a placeholder
      results = results.filter(tender => tender.timeline.includes(timelineFilter.replace('Under ', '').replace('Over ', '')));
    }
    
    // Apply budget range filter
    results = results.filter(tender => 
      tender.budget.max >= budgetRange[0] && tender.budget.min <= budgetRange[1]
    );
    
    // Apply sorting
    if (sortOption === 'newest') {
      results.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    } else if (sortOption === 'budget-high') {
      results.sort((a, b) => b.budget.max - a.budget.max);
    } else if (sortOption === 'budget-low') {
      results.sort((a, b) => a.budget.min - b.budget.min);
    }
    
    setFilteredTenders(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, categoryFilter, locationFilter, timelineFilter, budgetRange, sortOption, tenders]);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredTenders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTenders = filteredTenders.slice(startIndex, startIndex + itemsPerPage);
  
  const toggleMobileFilters = () => {
    setMobileFiltersVisible(!mobileFiltersVisible);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container-custom pt-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Available Tenders & Projects</h1>
          <p className="text-gray-600 mt-2">
            Browse through available projects and submit your proposals
          </p>
        </div>
        
        {/* Main content layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar - Desktop */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {categoryFilters.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {locationFilters.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              {/* Timeline Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <select
                  value={timelineFilter}
                  onChange={(e) => setTimelineFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {timelineFilters.map((timeline) => (
                    <option key={timeline} value={timeline}>{timeline}</option>
                  ))}
                </select>
              </div>
              
              {/* Budget Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Range: {formatCurrency(budgetRange[0])} - {formatCurrency(budgetRange[1])}
                </label>
                <Slider
                  value={budgetRange}
                  min={0}
                  max={2500000}
                  step={50000}
                  onValueChange={(value: number[]) => setBudgetRange(value as [number, number])}
                  className="mt-2"
                />
              </div>
              
              {/* Reset Filters Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('All Categories');
                  setLocationFilter('All Locations');
                  setTimelineFilter('Any Timeline');
                  setBudgetRange([0, 2500000]);
                  setSortOption('newest');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          {/* Mobile filters button */}
          <div className="lg:hidden mb-4">
            <Button 
              variant="outline"
              className="flex items-center w-full justify-between"
              onClick={toggleMobileFilters}
            >
              <span>Filters</span>
              <Filter size={18} />
            </Button>
          </div>
          
          {/* Mobile filters panel */}
          {mobileFiltersVisible && (
            <div className="lg:hidden bg-white rounded-lg shadow p-4 mb-4">
              {/* Mobile Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mobile Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {categoryFilters.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Mobile Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {locationFilters.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                {/* Mobile Timeline Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                  <select
                    value={timelineFilter}
                    onChange={(e) => setTimelineFilter(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {timelineFilters.map((timeline) => (
                      <option key={timeline} value={timeline}>{timeline}</option>
                    ))}
                  </select>
                </div>
                
                {/* Mobile Budget Range Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range: {formatCurrency(budgetRange[0])} - {formatCurrency(budgetRange[1])}
                  </label>
                  <Slider
                    value={budgetRange}
                    min={0}
                    max={2500000}
                    step={50000}
                    onValueChange={(value: number[]) => setBudgetRange(value as [number, number])}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('All Categories');
                    setLocationFilter('All Locations');
                    setTimelineFilter('Any Timeline');
                    setBudgetRange([0, 2500000]);
                  }}
                >
                  Reset
                </Button>
                <Button 
                  className="w-1/2"
                  onClick={() => setMobileFiltersVisible(false)}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
          
          {/* Main content area */}
          <div className="flex-1">
            {/* View & Sort Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* View Toggle */}
                <Tabs 
                  defaultValue="card" 
                  value={view}
                  onValueChange={(v) => setView(v as 'card' | 'list')}
                  className="w-full sm:w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="card">Card View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {/* Sort Dropdown */}
                <div className="w-full sm:w-auto flex items-center">
                  <span className="text-sm text-gray-700 mr-2">Sort:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="newest">Newest First</option>
                    <option value="budget-high">Highest Budget</option>
                    <option value="budget-low">Lowest Budget</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {paginatedTenders.length} of {filteredTenders.length} tenders
              </p>
            </div>
            
            {/* Tender Cards */}
            {paginatedTenders.length > 0 ? (
              <div className={view === 'card' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
              }>
                {paginatedTenders.map((tender) => (
                  <div key={tender.id} className={view === 'list' ? "w-full" : "h-full"}>
                    <TenderCard tender={tender} view={view} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No tenders found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('All Categories');
                    setLocationFilter('All Locations');
                    setTimelineFilter('Any Timeline');
                    setBudgetRange([0, 2500000]);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
            
            {/* Pagination */}
            {filteredTenders.length > itemsPerPage && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        if (totalPages <= 7) return true;
                        return page === 1 || page === totalPages || 
                               Math.abs(page - currentPage) < 2;
                      })
                      .map((page, index, array) => {
                        if (index > 0 && array[index] - array[index - 1] > 1) {
                          return (
                            <PaginationItem key={`ellipsis-${page}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TendersPage;
