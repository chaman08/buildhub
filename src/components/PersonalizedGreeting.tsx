
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
    return !userProfile.fullName || !userProfile.mobile || !userProfile.city;
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

  return (
    <div className="pt-20 pb-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getTimeBasedGreeting()}, {getGreetingName()}! 👋
                  </h2>
                  <p className="text-gray-600">
                    Welcome to your construction project management platform
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {isProfileIncomplete() && (
                  <div className="flex items-center space-x-2 text-orange-600 bg-orange-100 px-3 py-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Profile Incomplete</span>
                  </div>
                )}
                
                {isVerificationIncomplete() && (
                  <div className="flex items-center space-x-2 text-amber-600 bg-amber-100 px-3 py-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Verification Pending</span>
                  </div>
                )}
                
                {!isProfileIncomplete() && !isVerificationIncomplete() && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-100 px-3 py-2 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Profile Complete</span>
                  </div>
                )}

                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>

            {(isProfileIncomplete() || isVerificationIncomplete()) && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Complete your profile to get started:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {isProfileIncomplete() && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span>Add personal details (name, mobile, city)</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                      >
                        Complete Profile
                      </Button>
                    </div>
                  )}
                  
                  {isVerificationIncomplete() && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span>Verify your email or phone number</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/verify')}
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
