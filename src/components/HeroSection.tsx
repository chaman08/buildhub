import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, CheckCircle } from 'lucide-react';

const HeroSection = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const handlePostProject = () => {
    if (!currentUser) {
      navigate('/auth');
    } else {
      // Navigate based on user type
      if (userProfile?.userType === 'contractor') {
        navigate('/contractor-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const features = [
    'Verified Contractors',
    'Real-time Updates',
    'Quality Assurance',
    'Competitive Bidding',
    'Project Management'
  ];

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-24 md:pb-20">
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Build Your Dream
            <span className="text-blue-600 block sm:inline"> Construction</span> Project
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with verified contractors, get competitive bids, and bring your construction vision to life with confidence and transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={handlePostProject}
            >
              {currentUser && userProfile?.userType === 'contractor' ? 'View Dashboard' : 'Post Your Project'}
            </Button>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              asChild
            >
              <Link to="/projects" className="flex items-center gap-2">
                Browse Projects
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Join the Future of Construction</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 shadow-sm">
              <span className="text-gray-700 font-medium">100% Verified</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 shadow-sm">
              <span className="text-gray-700 font-medium">Secure Platform</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 shadow-sm">
              <span className="text-gray-700 font-medium">Easy to Use</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
