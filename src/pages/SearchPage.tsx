
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Filters, { FilterState } from '../components/search/Filters';
import ContractorCard from '../components/search/ContractorCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for contractors
const mockContractors = [
  {
    id: 1,
    name: 'John Smith',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    category: 'Electrician',
    location: 'New York',
    rating: 4.8,
    reviewCount: 124,
    description: 'Licensed electrician with over 15 years of experience in residential and commercial electrical installations and repairs.',
    yearsExperience: 15,
    verified: true,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    category: 'Architect',
    location: 'Los Angeles',
    rating: 5,
    reviewCount: 89,
    description: 'Award-winning architect specializing in sustainable and modern residential designs. Experienced in both new construction and renovations.',
    yearsExperience: 12,
    verified: true,
  },
  {
    id: 3,
    name: 'Mike Williams',
    profileImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    category: 'Plumber',
    location: 'Chicago',
    rating: 4.5,
    reviewCount: 67,
    description: 'Reliable plumber offering prompt service for all plumbing needs including repairs, installations, and emergency services.',
    yearsExperience: 8,
    verified: true,
  },
  {
    id: 4,
    name: 'Emily Davis',
    profileImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    category: 'Interior Designer',
    location: 'Miami',
    rating: 4.9,
    reviewCount: 103,
    description: 'Creative interior designer with a passion for transforming spaces. Specializing in modern and contemporary designs for homes and offices.',
    yearsExperience: 10,
    verified: false,
  },
  {
    id: 5,
    name: 'Robert Chen',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    category: 'Construction',
    location: 'Houston',
    rating: 4.7,
    reviewCount: 156,
    description: 'Full-service construction contractor with expertise in residential and commercial projects. Quality craftsmanship guaranteed.',
    yearsExperience: 20,
    verified: true,
  },
  {
    id: 6,
    name: 'Lisa Thompson',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
    category: 'Landscaper',
    location: 'Los Angeles',
    rating: 4.6,
    reviewCount: 72,
    description: 'Professional landscaper specializing in garden design, irrigation systems, and outdoor living spaces that enhance your property.',
    yearsExperience: 14,
    verified: false,
  },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contractors, setContractors] = useState(mockContractors);
  const [filteredContractors, setFilteredContractors] = useState(mockContractors);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const contractorsPerPage = 3;

  // Initialize filters from URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      handleFilterChange({
        category: categoryFromUrl,
        location: 'all',
        minRating: 0,
        minExperience: 0,
        verified: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...contractors];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(
        (c) => c.category.toLowerCase().includes(filters.category)
      );
    }

    // Filter by location
    if (filters.location !== 'all') {
      filtered = filtered.filter((c) => c.location === locations[filters.location]);
    }

    // Filter by minimum rating
    if (filters.minRating > 0) {
      filtered = filtered.filter((c) => c.rating >= filters.minRating);
    }

    // Filter by minimum experience
    if (filters.minExperience > 0) {
      filtered = filtered.filter((c) => c.yearsExperience >= filters.minExperience);
    }

    // Filter by verification status
    if (filters.verified) {
      filtered = filtered.filter((c) => c.verified);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContractors(filtered);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Re-filter contractors with current filters + search term
    handleFilterChange({
      category: 'all',
      location: 'all',
      minRating: 0,
      minExperience: 0,
      verified: false,
    });
  };

  // Calculate pagination
  const indexOfLastContractor = currentPage * contractorsPerPage;
  const indexOfFirstContractor = indexOfLastContractor - contractorsPerPage;
  const currentContractors = filteredContractors.slice(
    indexOfFirstContractor,
    indexOfLastContractor
  );
  const totalPages = Math.ceil(filteredContractors.length / contractorsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Map location IDs to names for display
  const locations: { [key: string]: string } = {
    'all': 'All Locations',
    'new-york': 'New York',
    'los-angeles': 'Los Angeles',
    'chicago': 'Chicago',
    'houston': 'Houston',
    'miami': 'Miami',
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Contractors</h1>
          <p className="text-lg text-gray-600">
            Browse through our network of verified professionals
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              placeholder="Search by name, category, or keywords..."
              className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-r-md hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Filters */}
          <div className="md:w-1/4">
            <Filters onFilterChange={handleFilterChange} />
          </div>

          {/* Main Content - Contractor Listings */}
          <div className="md:w-3/4">
            {/* Results count */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {filteredContractors.length} contractors
              </p>
            </div>

            {/* Contractor Cards */}
            <div className="space-y-6">
              {currentContractors.length > 0 ? (
                currentContractors.map((contractor) => (
                  <ContractorCard key={contractor.id} {...contractor} />
                ))
              ) : (
                <div className="text-center py-8 bg-white rounded-lg shadow">
                  <p className="text-gray-600">
                    No contractors found matching your criteria. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredContractors.length > contractorsPerPage && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === index + 1
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
