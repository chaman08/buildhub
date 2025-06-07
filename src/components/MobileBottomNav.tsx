
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Briefcase, 
  User, 
  MessageCircle, 
  FileText,
  CheckCircle,
  Upload
} from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();

  // Don't show on auth pages
  if (location.pathname === '/auth' || location.pathname === '/verify') {
    return null;
  }

  const getNavItems = () => {
    if (!currentUser) {
      // Non-logged in users
      return [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/contractors', icon: Users, label: 'Contractors' },
        { to: '/projects', icon: Briefcase, label: 'Projects' },
        { to: '/auth', icon: User, label: 'Login' },
      ];
    }

    if (userProfile?.userType === 'contractor') {
      // Contractor dashboard items
      return [
        { to: '/contractor-dashboard', icon: Home, label: 'Home' },
        { to: '/contractor-dashboard?tab=tenders', icon: Briefcase, label: 'Tenders' },
        { to: '/contractor-dashboard?tab=bids', icon: FileText, label: 'Bids' },
        { to: '/contractor-dashboard?tab=messages', icon: MessageCircle, label: 'Messages' },
        { to: '/contractor-dashboard?tab=profile', icon: User, label: 'Profile' },
      ];
    } else {
      // Customer dashboard items
      return [
        { to: '/dashboard', icon: Home, label: 'Projects' },
        { to: '/dashboard?tab=bids', icon: FileText, label: 'Bids' },
        { to: '/dashboard?tab=ongoing', icon: CheckCircle, label: 'Ongoing' },
        { to: '/dashboard?tab=messages', icon: MessageCircle, label: 'Messages' },
        { to: '/dashboard?tab=profile', icon: User, label: 'Profile' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-4 lg:grid-cols-5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to.includes('?tab=') && location.search.includes(item.to.split('?tab=')[1]));
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center p-2 py-3 text-xs transition-colors",
                isActive 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-blue-600"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
