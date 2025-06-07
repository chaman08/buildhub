
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
      return userProfile.fullName.split(' ')[0];
    }
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0];
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    if (userProfile?.mobile) {
      return `User ${userProfile.mobile.slice(-4)}`;
    }
    return 'Welcome';
  };

  const getIncompleteFields = () => {
    if (!userProfile) return ['Profile setup'];
    
    const missingFields = [];
    
    // Check basic required fields
    if (!userProfile.fullName) missingFields.push('Full Name');
    if (!userProfile.mobile) missingFields.push('Mobile Number');
    if (!userProfile.city) missingFields.push('City');
    
    // Check contractor-specific fields
    if (userProfile.userType === 'contractor') {
      if (!userProfile.companyName) missingFields.push('Company Name');
      if (!userProfile.serviceCategory) missingFields.push('Service Category');
      if (!userProfile.experience) missingFields.push('Experience');
    }
    
    return missingFields;
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

  const incompleteFields = getIncompleteFields();
  const isProfileIncomplete = incompleteFields.length > 0;
  const showCompletionPrompts = isProfileIncomplete || isVerificationIncomplete();

  return (
    <div className="pt-16 sm:pt-20 pb-4 sm:pb-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 break-words">
                    {getTimeBasedGreeting()}, {getGreetingName()}! 👋
                  </h2>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                    Welcome to your construction project platform
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {isProfileIncomplete && (
                    <div className="flex items-center space-x-1 sm:space-x-2 text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs font-medium">Profile Incomplete</span>
                    </div>
                  )}
                  
                  {!isProfileIncomplete && isVerificationIncomplete() && (
                    <div className="flex items-center space-x-1 sm:space-x-2 text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs font-medium">Verify Account</span>
                    </div>
                  )}
                  
                  {!isProfileIncomplete && !isVerificationIncomplete() && (
                    <div className="flex items-center space-x-1 sm:space-x-2 text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs font-medium">All Set!</span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto text-xs sm:text-sm"
                  size="sm"
                >
                  Dashboard
                </Button>
              </div>
            </div>

            {showCompletionPrompts && (
              <div className="mt-3 sm:mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2 text-xs sm:text-sm lg:text-base">Complete your setup:</h3>
                <div className="grid grid-cols-1 gap-2 sm:gap-3 text-xs sm:text-sm">
                  {isProfileIncomplete && (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                        <span>Missing: {incompleteFields.join(', ')}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        className="text-xs sm:text-sm self-start sm:self-auto"
                      >
                        Complete Profile
                      </Button>
                    </div>
                  )}
                  
                  {!isProfileIncomplete && isVerificationIncomplete() && (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                        <span>Verify your email or phone number</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/verify')}
                        className="text-xs sm:text-sm self-start sm:self-auto"
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
