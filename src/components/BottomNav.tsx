import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Users, Briefcase, LogIn, FileText, MessageSquare, User, PlusCircle } from 'lucide-react';

const BottomNav = () => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getActiveClass = (path: string) => {
    return isActive(path) ? 'text-blue-600' : 'text-gray-600';
  };

  // Not logged in user navigation
  if (!currentUser) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex justify-around items-center h-16">
          <Link to="/" className={`flex flex-col items-center ${getActiveClass('/')}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/contractors" className={`flex flex-col items-center ${getActiveClass('/contractors')}`}>
            <Users className="h-6 w-6" />
            <span className="text-xs mt-1">Contractors</span>
          </Link>
          <Link to="/projects" className={`flex flex-col items-center ${getActiveClass('/projects')}`}>
            <Briefcase className="h-6 w-6" />
            <span className="text-xs mt-1">Projects</span>
          </Link>
          <Link to="/auth" className={`flex flex-col items-center ${getActiveClass('/auth')}`}>
            <LogIn className="h-6 w-6" />
            <span className="text-xs mt-1">Login</span>
          </Link>
        </div>
      </div>
    );
  }

  // Contractor navigation
  if (userProfile?.userType === 'contractor') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex justify-around items-center h-16">
          <Link to="/contractor-dashboard" className={`flex flex-col items-center ${getActiveClass('/contractor-dashboard')}`}>
            <FileText className="h-6 w-6" />
            <span className="text-xs mt-1">Tenders</span>
          </Link>
          <Link to="/projects" className={`flex flex-col items-center ${getActiveClass('/projects')}`}>
            <Briefcase className="h-6 w-6" />
            <span className="text-xs mt-1">Projects</span>
          </Link>
          <Link to="/messages" className={`flex flex-col items-center ${getActiveClass('/messages')}`}>
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Messages</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center ${getActiveClass('/profile')}`}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    );
  }

  // Customer navigation
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link to="/dashboard" className={`flex flex-col items-center ${getActiveClass('/dashboard')}`}>
          <FileText className="h-6 w-6" />
          <span className="text-xs mt-1">Bids</span>
        </Link>
        <Link to="/contractors" className={`flex flex-col items-center ${getActiveClass('/contractors')}`}>
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Contractors</span>
        </Link>
        <Link to="/dashboard" className={`flex flex-col items-center ${getActiveClass('/dashboard')}`}>
          <PlusCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Post Project</span>
        </Link>
        <Link to="/messages" className={`flex flex-col items-center ${getActiveClass('/messages')}`}>
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center ${getActiveClass('/profile')}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav; 