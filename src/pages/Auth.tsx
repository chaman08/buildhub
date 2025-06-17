import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import ProfileCompletion from '@/components/auth/ProfileCompletion';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const Auth: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { currentUser, userProfile, isVerificationComplete } = useAuth();

  // Check if we should show signup based on navigation state
  useEffect(() => {
    if (location.state?.showSignup) {
      setIsLogin(false);
    }
  }, [location.state]);

  // Handle navigation after auth state changes
  useEffect(() => {
    const handleNavigation = async () => {
      if (!currentUser || !userProfile) return;

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
    };

    handleNavigation();
  }, [currentUser, userProfile, navigate, isVerificationComplete]);

  // Only show profile completion for non-Google users with incomplete profiles
  if (currentUser && userProfile && !userProfile.profileComplete && !userProfile.isEmailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="pt-20 px-4 sm:px-6 lg:px-8">
          <ProfileCompletion />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {isLogin ? (
            <LoginForm onSuccess={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSuccess={() => setIsLogin(true)} />
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
