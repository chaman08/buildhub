
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PersonalizedGreeting: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const getGreetingName = () => {
    if (userProfile?.fullName) {
      return userProfile.fullName.split(' ')[0]; // Get first name
    }
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0];
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0]; // Get email username
    }
    if (userProfile?.mobile) {
      return `User ${userProfile.mobile.slice(-4)}`; // Last 4 digits of phone
    }
    return 'Welcome';
  };

  const isProfileIncomplete = () => {
    if (!userProfile) return true;
    // Check for essential fields only
    return !userProfile.fullName || !userProfile.mobile || !userProfile.userType;
  };

  const isVerificationIncomplete = () => {
    if (!userProfile) return true;
    return !userProfile.isEmailVerified && !userProfile.isPhoneVerified;
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!currentUser) return null;

  // If profile is complete and verified, just show a simple greeting
  const showCompletionPrompts = isProfileIncomplete() || isVerificationIncomplete();

  return (
    <div className="pt-20 pb-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">
                    {getTimeBasedGreeting()}, {getGreetingName()}! 👋
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Welcome to your construction project management platform
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex flex-wrap gap-2">
                  {isProfileIncomplete() && (
                    <div className="flex items-center space-x-2 text-orange-600 bg-orange-100 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">Profile Incomplete</span>
                    </div>
                  )}
                  
                  {!isProfileIncomplete() && isVerificationIncomplete() && (
                    <div className="flex items-center space-x-2 text-amber-600 bg-amber-100 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">Verification Pending</span>
                    </div>
                  )}
                  
                  {!isProfileIncomplete() && !isVerificationIncomplete() && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-100 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">All Set!</span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto text-sm sm:text-base"
                  size="sm"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>

            {showCompletionPrompts && (
              <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Complete your setup to get started:</h3>
                <div className="grid grid-cols-1 gap-3 text-xs sm:text-sm">
                  {isProfileIncomplete() && (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                        <span>Add personal details</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        className="text-xs sm:text-sm"
                      >
                        Complete Profile
                      </Button>
                    </div>
                  )}
                  
                  {!isProfileIncomplete() && isVerificationIncomplete() && (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                        <span>Verify your email or phone number</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/verify')}
                        className="text-xs sm:text-sm"
                      >
                        Verify Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalizedGreeting;
