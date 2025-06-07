import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Shield } from 'lucide-react';

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
  bio?: string;
}

const ContractorPreview = () => {
  const [featuredContractors, setFeaturedContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  const categories = [
    { name: "Civil Contractors", icon: "🏗️", category: "civil" },
    { name: "Electrical Contractors", icon: "⚡", category: "electrical" },
    { name: "Interior Designers", icon: "🎨", category: "interior" },
    { name: "Architects", icon: "📐", category: "architect" },
    { name: "Plumbing Services", icon: "🔧", category: "plumbing" },
    { name: "Painters & Flooring", icon: "🎭", category: "painting" }
  ];

  useEffect(() => {
    fetchFeaturedContractors();
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      const counts: Record<string, number> = {};
      
      // Fetch counts for each category
      for (const category of categories) {
        const categoryQuery = query(
          collection(db, 'users'),
          where('userType', '==', 'contractor'),
          where('serviceCategory', '==', category.category)
        );
        
        const snapshot = await getDocs(categoryQuery);
        counts[category.category] = snapshot.size;
      }
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  const fetchFeaturedContractors = async () => {
    try {
      setLoading(true);
      
      // Simple query to get all contractors
      const contractorQuery = query(
        collection(db, 'users'),
        where('userType', '==', 'contractor'),
        limit(10) // Get more to ensure we have enough after filtering
      );
      
      const snapshot = await getDocs(contractorQuery);
      const contractorData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as Contractor[];

      // Sort contractors by rating (if available) and take top 3
      const sortedContractors = contractorData
        .sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        })
        .slice(0, 3);
      
      setFeaturedContractors(sortedContractors);
    } catch (error) {
      console.error('Error fetching featured contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/contractors?category=${category}`);
  };

  return (
    <section id="contractors" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Professional Contractors
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse through our network of verified professionals across various construction categories.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
              onClick={() => handleCategoryClick(category.category)}
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  {categoryCounts[category.category] > 0 && (
                    <p className="text-orange-600 font-medium">
                      {categoryCounts[category.category]} Available
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Contractors */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Featured Contractors
          </h3>
          
          {loading ? (
            <div className="text-center py-8">Loading featured contractors...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredContractors.map((contractor) => (
                <div key={contractor.uid} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        {contractor.profilePicture ? (
                          <img 
                            src={contractor.profilePicture} 
                            alt={contractor.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          contractor.fullName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {contractor.fullName}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {contractor.companyName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {contractor.rating && (
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{contractor.rating.toFixed(1)}</span>
                          {contractor.reviewsCount && (
                            <span className="text-gray-500 text-sm">({contractor.reviewsCount} reviews)</span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-blue-600 font-medium text-sm">
                        {contractor.serviceCategory}
                      </p>
                      
                      <p className="text-gray-600 text-sm flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {contractor.city}
                      </p>
                      
                      <p className="text-gray-600 text-sm">
                        {contractor.experience}+ years experience
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700" 
                      onClick={() => navigate(`/contractor/${contractor.uid}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-4"
            onClick={() => navigate('/contractors')}
          >
            Browse All Contractors →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContractorPreview;
