
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { User, LogOut, Settings, Menu } from 'lucide-react';

const Header = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getDashboardRoute = () => {
    if (!userProfile) return '/dashboard';
    return userProfile.userType === 'contractor' ? '/contractor-dashboard' : '/dashboard';
  };

  const handleSignupClick = () => {
    navigate('/auth?mode=signup');
  };

  const navigationLinks = [
    { to: '/contractors', label: 'Find Contractors' },
    { to: '/projects', label: 'Browse Projects' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const MobileNav = () => (
    <div className="flex flex-col space-y-4 pt-4">
      {navigationLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
          onClick={() => setMobileMenuOpen(false)}
        >
          {link.label}
        </Link>
      ))}
      
      {currentUser ? (
        <div className="flex flex-col space-y-2 pt-4 border-t">
          <Link
            to={getDashboardRoute()}
            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/profile"
            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Profile
          </Link>
          <Button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            variant="outline"
            className="mx-3 justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-2 pt-4 border-t">
          <Button
            asChild
            variant="outline"
            className="mx-3 justify-start"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Link to="/auth">Login</Link>
          </Button>
          <Button
            onClick={() => {
              handleSignupClick();
              setMobileMenuOpen(false);
            }}
            className="mx-3 justify-start"
          >
            Sign Up
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
              BuildHub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-2 lg:space-x-3">
                <Link to={getDashboardRoute()}>
                  <Button variant="outline" size="sm" className="text-xs lg:text-sm">
                    Dashboard
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.profilePicture} />
                        <AvatarFallback className="text-xs">
                          {userProfile?.fullName?.charAt(0) || currentUser.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {userProfile?.fullName && (
                          <p className="font-medium text-sm">{userProfile.fullName}</p>
                        )}
                        <p className="w-[200px] truncate text-xs text-muted-foreground">
                          {currentUser.email}
                        </p>
                        {userProfile?.userType && (
                          <p className="text-xs text-blue-600 capitalize">
                            {userProfile.userType}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardRoute()} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" size="sm" className="text-xs lg:text-sm">
                  <Link to="/auth">Login</Link>
                </Button>
                <Button onClick={handleSignupClick} size="sm" className="text-xs lg:text-sm">
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4">
                    <Link to="/" className="text-xl font-bold text-blue-600">
                      BuildHub
                    </Link>
                  </div>
                  <MobileNav />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
