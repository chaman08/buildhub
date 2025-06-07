
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Briefcase, FileText, MessageCircle, User, Plus, Home, Hammer, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BottomTabBar: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Don't show on auth pages
  if (currentPath === '/auth' || currentPath === '/verify') {
    return null;
  }

  const isActive = (path: string) => currentPath === path;

  // Helper function to navigate to contractor dashboard with specific tab
  const navigateToContractorTab = (tab: string) => {
    const url = `/contractor-dashboard#${tab}`;
    window.location.href = url;
  };

  // For non-logged in users
  if (!currentUser) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex justify-center items-center h-16 px-4">
          <div className="flex justify-around items-center w-full max-w-md">
            <Link to="/contractors" className="flex flex-col items-center">
              <Button
                variant={isActive('/contractors') ? 'default' : 'ghost'}
                size="sm"
                className="flex flex-col h-auto py-2 px-4 gap-1"
              >
                <Search className="h-5 w-5" />
                <span className="text-xs font-medium">Find Contractor</span>
              </Button>
            </Link>
            
            <Link to="/projects" className="flex flex-col items-center">
              <Button
                variant={isActive('/projects') ? 'default' : 'ghost'}
                size="sm"
                className="flex flex-col h-auto py-2 px-4 gap-1"
              >
                <Briefcase className="h-5 w-5" />
                <span className="text-xs font-medium">Browse Projects</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // For customer users
  if (userProfile?.userType === 'customer') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          <Link to="/projects" className="flex flex-col items-center">
            <Button
              variant={isActive('/projects') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2 gap-1"
            >
              <Briefcase className="h-4 w-4" />
              <span className="text-xs">Projects</span>
            </Button>
          </Link>
          
          <Link to="/dashboard" className="flex flex-col items-center">
            <Button
              variant={isActive('/dashboard') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2 gap-1"
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs">Bids</span>
            </Button>
          </Link>
          
          {/* Center - New Project Button (Eye-catching) */}
          <Link to="/dashboard" className="flex flex-col items-center">
            <Button
              size="lg"
              className="flex flex-col h-auto py-3 px-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-6 w-6" />
              <span className="text-xs font-bold">New Project</span>
            </Button>
          </Link>
          
          <Link to="/messages" className="flex flex-col items-center">
            <Button
              variant={isActive('/messages') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2 gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Messages</span>
            </Button>
          </Link>
          
          <Link to="/profile" className="flex flex-col items-center">
            <Button
              variant={isActive('/profile') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2 gap-1"
            >
              <User className="h-4 w-4" />
              <span className="text-xs">Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // For contractor users
  if (userProfile?.userType === 'contractor') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex justify-around items-center h-16 px-1">
          <button 
            onClick={() => navigateToContractorTab('home')}
            className="flex flex-col items-center"
          >
            <Button
              variant={isActive('/contractor-dashboard') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2 gap-1"
            >
              <Home className="h-4 w-4" />
              <span className="text-xs">Home</span>
            </Button>
          </button>
          
          <button 
            onClick={() => navigateToContractorTab('bids')}
            className="flex flex-col items-center"
          >
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col h-auto py-1 px-2 gap-1"
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs">My Bids</span>
            </Button>
          </button>
          
          {/* Center - Tenders Button (Eye-catching) */}
          <button 
            onClick={() => navigateToContractorTab('tenders')}
            className="flex flex-col items-center"
          >
            <Button
              size="lg"
              className="flex flex-col h-auto py-3 px-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Hammer className="h-6 w-6" />
              <span className="text-xs font-bold">Tenders</span>
            </Button>
          </button>
          
          <button 
            onClick={() => navigateToContractorTab('projects')}
            className="flex flex-col items-center"
          >
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col h-auto py-1 px-2 gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Projects</span>
            </Button>
          </button>
          
          <Link to="/profile" className="flex flex-col items-center">
            <Button
              variant={isActive('/profile') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2 gap-1"
            >
              <User className="h-4 w-4" />
              <span className="text-xs">Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default BottomTabBar;
