
import { useState } from 'react';
import { Filter } from 'lucide-react';

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  category: string;
  location: string;
  minRating: number;
  minExperience: number;
  verified: boolean;
}

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'electricians', name: 'Electricians' },
  { id: 'plumbers', name: 'Plumbers' },
  { id: 'architects', name: 'Architects' },
  { id: 'construction', name: 'Construction' },
  { id: 'interior-designers', name: 'Interior Designers' },
  { id: 'landscapers', name: 'Landscapers' },
];

const locations = [
  { id: 'all', name: 'All Locations' },
  { id: 'new-york', name: 'New York' },
  { id: 'los-angeles', name: 'Los Angeles' },
  { id: 'chicago', name: 'Chicago' },
  { id: 'houston', name: 'Houston' },
  { id: 'miami', name: 'Miami' },
];

const Filters = ({ onFilterChange }: FiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    location: 'all',
    minRating: 0,
    minExperience: 0,
    verified: false,
  });

  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);

  const handleFilterChange = (
    field: keyof FilterState,
    value: string | number | boolean
  ) => {
    const updatedFilters = {
      ...filters,
      [field]: value,
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const toggleMobileFilters = () => {
    setMobileFiltersVisible(!mobileFiltersVisible);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filter Results</h2>
        <button
          className="md:hidden flex items-center text-primary"
          onClick={toggleMobileFilters}
        >
          <Filter size={18} className="mr-1" />
          Filters
        </button>
      </div>

      <div
        className={`${
          mobileFiltersVisible ? 'block' : 'hidden'
        } md:block space-y-6`}
      >
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block mb-2 font-medium">
            Service Category
          </label>
          <select
            id="category"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label htmlFor="location" className="block mb-2 font-medium">
            Location
          </label>
          <select
            id="location"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label htmlFor="rating" className="block mb-2 font-medium">
            Minimum Rating
          </label>
          <div className="flex items-center">
            <input
              type="range"
              id="rating"
              min="0"
              max="5"
              step="1"
              value={filters.minRating}
              onChange={(e) =>
                handleFilterChange('minRating', parseInt(e.target.value))
              }
              className="w-full"
            />
            <span className="ml-2">{filters.minRating}+ stars</span>
          </div>
        </div>

        {/* Experience Filter */}
        <div>
          <label htmlFor="experience" className="block mb-2 font-medium">
            Minimum Experience
          </label>
          <div className="flex items-center">
            <input
              type="range"
              id="experience"
              min="0"
              max="20"
              step="1"
              value={filters.minExperience}
              onChange={(e) =>
                handleFilterChange('minExperience', parseInt(e.target.value))
              }
              className="w-full"
            />
            <span className="ml-2">{filters.minExperience}+ years</span>
          </div>
        </div>

        {/* Verified Filter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="verified"
            checked={filters.verified}
            onChange={(e) => handleFilterChange('verified', e.target.checked)}
            className="mr-2 h-4 w-4 text-primary focus:ring-primary"
          />
          <label htmlFor="verified">Verified Contractors Only</label>
        </div>

        {/* Reset Filters Button (Mobile Only) */}
        <div className="md:hidden">
          <button
            onClick={() => {
              const resetFilters = {
                category: 'all',
                location: 'all',
                minRating: 0,
                minExperience: 0,
                verified: false,
              };
              setFilters(resetFilters);
              onFilterChange(resetFilters);
            }}
            className="w-full py-2 text-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
