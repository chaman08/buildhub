
import { Button } from "@/components/ui/button";

const ContractorPreview = () => {
  const categories = [
    { name: "Civil Contractors", icon: "🏗️", count: "500+" },
    { name: "Electrical Contractors", icon: "⚡", count: "300+" },
    { name: "Interior Designers", icon: "🎨", count: "250+" },
    { name: "Architects", icon: "📐", count: "200+" },
    { name: "Plumbing Services", icon: "🔧", count: "180+" },
    { name: "Painters & Flooring", icon: "🎭", count: "150+" }
  ];

  const sampleContractors = [
    {
      name: "Rajesh Kumar",
      company: "Kumar Construction Co.",
      rating: 4.8,
      reviews: 45,
      specialty: "Civil Contractor",
      location: "Mumbai, Maharashtra",
      experience: "12 years",
      image: "👨‍🔧"
    },
    {
      name: "Priya Sharma", 
      company: "Modern Interiors",
      rating: 4.9,
      reviews: 38,
      specialty: "Interior Designer",
      location: "Delhi, NCR",
      experience: "8 years", 
      image: "👩‍🎨"
    },
    {
      name: "Vikram Singh",
      company: "Singh Electricals",
      rating: 4.7,
      reviews: 52,
      specialty: "Electrical Contractor", 
      location: "Pune, Maharashtra",
      experience: "15 years",
      image: "👨‍🔧"
    }
  ];

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
            <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-orange-600 font-medium">
                    {category.count} Available
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Contractors */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Featured Contractors
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleContractors.map((contractor, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-4xl">{contractor.image}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {contractor.name}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {contractor.company}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{contractor.rating}</span>
                      <span className="text-gray-500 text-sm">({contractor.reviews} reviews)</span>
                    </div>
                    
                    <p className="text-blue-600 font-medium text-sm">
                      {contractor.specialty}
                    </p>
                    
                    <p className="text-gray-600 text-sm">
                      📍 {contractor.location}
                    </p>
                    
                    <p className="text-gray-600 text-sm">
                      🕒 {contractor.experience} experience
                    </p>
                  </div>
                  
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-4"
          >
            Browse All Contractors →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContractorPreview;
