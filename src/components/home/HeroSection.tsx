
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

const HeroSection = () => {
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Would handle search submission here
    console.log('Searching for contractors in:', location);
  };

  return (
    <section className="relative bg-gradient-to-r from-primary-900 to-primary-700 text-white py-20">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Find Trusted Contractors For Your Project
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Connect with verified professionals for your construction and home improvement needs
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter your location"
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-gray-800"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-secondary hover:bg-secondary-600 py-3 px-6 rounded-lg flex items-center justify-center transition-colors">
                <Search size={20} className="mr-2" />
                <span>Find Contractors</span>
              </button>
            </form>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/search" className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-lg font-medium transition-colors">
              Browse All Contractors
            </Link>
            <Link to="/post-project" className="bg-secondary hover:bg-secondary-600 text-white py-3 px-8 rounded-lg font-medium transition-colors">
              Post a Project
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
