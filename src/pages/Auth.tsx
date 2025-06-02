
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import ProfileCompletion from '@/components/auth/ProfileCompletion';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { currentUser, userProfile, isVerificationComplete } = useAuth();

  useEffect(() => {
    if (currentUser && userProfile) {
      // Check if Google user needs to complete profile
      if (!userProfile.mobile) {
        // Show profile completion, don't navigate
        return;
      }
      
      // Check if user has at least one verification (email OR phone)
      if (isVerificationComplete()) {
        // Navigate based on user type
        if (userProfile.userType === 'contractor') {
          navigate('/contractor-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/verify');
      }
    }
  }, [currentUser, userProfile, navigate, isVerificationComplete]);

  const handleAuthSuccess = () => {
    // Navigation will be handled by the useEffect above
  };

  // Show profile completion for Google users with incomplete profiles
  if (currentUser && userProfile && !userProfile.mobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <ProfileCompletion />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4">
          {isLogin ? (
            <LoginForm 
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={() => setIsLogin(false)}
            />
          ) : (
            <SignupForm onSuccess={handleAuthSuccess} />
          )}
          
          {!isLogin && (
            <div className="text-center mt-4">
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* reCAPTCHA container for phone auth */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Auth;
