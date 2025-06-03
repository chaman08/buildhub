
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

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

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Build Your Dream
          <span className="text-blue-600"> Construction</span> Project
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect with verified contractors, get competitive bids, and bring your construction vision to life with confidence and transparency.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={handlePostProject}
          >
            {currentUser && userProfile?.userType === 'contractor' ? 'View Dashboard' : 'Post Your Project'}
          </Button>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-blue-600 text-white border-blue-600"
            asChild
          >
            <Link to="/projects">Browse Projects</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
