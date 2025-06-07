
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Briefcase, FileText, MessageCircle, User, Plus, Home, Hammer, CheckCircle, FolderOpen } from 'lucide-react';
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

  // For non-logged in users
  if (!currentUser) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
        <div className="flex justify-around items-center max-w-sm mx-auto">
          <Link to="/contractors" className="flex flex-col items-center">
            <Button
              variant={isActive('/contractors') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-2 px-3"
            >
              <Search className="h-5 w-5 mb-1" />
              <span className="text-xs">Find Contractor</span>
            </Button>
          </Link>
          
          <Link to="/projects" className="flex flex-col items-center">
            <Button
              variant={isActive('/projects') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-2 px-3"
            >
              <Briefcase className="h-5 w-5 mb-1" />
              <span className="text-xs">Browse Projects</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // For customer users
  if (userProfile?.userType === 'customer') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2 md:hidden">
        <div className="flex justify-around items-center">
          <Link to="/projects" className="flex flex-col items-center">
            <Button
              variant={isActive('/projects') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2"
            >
              <Briefcase className="h-4 w-4 mb-1" />
              <span className="text-xs">Projects</span>
            </Button>
          </Link>
          
          <Link to="/dashboard" className="flex flex-col items-center">
            <Button
              variant={isActive('/dashboard') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2"
            >
              <FileText className="h-4 w-4 mb-1" />
              <span className="text-xs">Bids</span>
            </Button>
          </Link>
          
          {/* Center - New Project Button (Eye-catching) */}
          <Link to="/dashboard" className="flex flex-col items-center">
            <Button
              size="lg"
              className="flex flex-col h-auto py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
            >
              <Plus className="h-6 w-6 mb-1" />
              <span className="text-xs font-semibold">New Project</span>
            </Button>
          </Link>
          
          <Link to="/messages" className="flex flex-col items-center">
            <Button
              variant={isActive('/messages') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2"
            >
              <MessageCircle className="h-4 w-4 mb-1" />
              <span className="text-xs">Messages</span>
            </Button>
          </Link>
          
          <Link to="/profile" className="flex flex-col items-center">
            <Button
              variant={isActive('/profile') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2"
            >
              <User className="h-4 w-4 mb-1" />
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-2 md:hidden">
        <div className="flex justify-around items-center">
          <Link to="/contractor-dashboard" className="flex flex-col items-center">
            <Button
              variant={isActive('/contractor-dashboard') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2"
            >
              <Home className="h-4 w-4 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>
          
          <Link to="/contractor-dashboard" className="flex flex-col items-center">
            <Button
              variant={isActive('/contractor-dashboard') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2"
            >
              <FileText className="h-4 w-4 mb-1" />
              <span className="text-xs">My Bids</span>
            </Button>
          </Link>
          
          {/* Center - Tenders Button (Eye-catching) */}
          <Link to="/contractor-dashboard" className="flex flex-col items-center">
            <Button
              size="lg"
              className="flex flex-col h-auto py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg"
            >
              <Hammer className="h-6 w-6 mb-1" />
              <span className="text-xs font-semibold">Tenders</span>
            </Button>
          </Link>
          
          <Link to="/contractor-dashboard" className="flex flex-col items-center">
            <Button
              variant={isActive('/contractor-dashboard') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2"
            >
              <CheckCircle className="h-4 w-4 mb-1" />
              <span className="text-xs">Projects</span>
            </Button>
          </Link>
          
          <Link to="/profile" className="flex flex-col items-center">
            <Button
              variant={isActive('/profile') ? 'default' : 'ghost'}
              size="sm"
              className="flex flex-col h-auto py-1 px-2"
            >
              <User className="h-4 w-4 mb-1" />
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
