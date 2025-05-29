
import { useState } from "react";
import { Menu, User, LogIn, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Find Contractors", href: "#contractors" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAuthNavigation = () => {
    navigate('/auth');
  };

  const handleDashboardNavigation = () => {
    navigate('/dashboard');
  };

  const getVerificationStatus = () => {
    if (!userProfile) return null;
    
    const needsVerification = !userProfile.isEmailVerified && !userProfile.isPhoneVerified;
    if (needsVerification) {
      return (
        <a href="/verify" className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
          Verify Account
        </a>
      );
    }
    
    if (userProfile.userType === 'contractor' && userProfile.verificationBadge) {
      return <span className="text-xs text-green-600">✅ Verified</span>;
    }
    
    return null;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                BuildConnect
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Professional Network
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-blue-50"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.profilePicture} />
                  <AvatarFallback className="text-sm">
                    {userProfile?.fullName ? getInitials(userProfile.fullName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {userProfile?.fullName || 'Welcome'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 capitalize">
                      {userProfile?.userType}
                    </span>
                    {getVerificationStatus()}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDashboardNavigation}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  onClick={handleAuthNavigation}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200"
                  onClick={handleAuthNavigation}
                >
                  <User className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {currentUser ? (
                    <div className="space-y-3">
                      <div className="px-3 py-2 flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={userProfile?.profilePicture} />
                          <AvatarFallback>
                            {userProfile?.fullName ? getInitials(userProfile.fullName) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {userProfile?.fullName || 'Welcome'}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {userProfile?.userType}
                          </div>
                          {getVerificationStatus()}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={handleDashboardNavigation}
                      >
                        Dashboard
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        onClick={handleAuthNavigation}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        onClick={handleAuthNavigation}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
