
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    if (currentUser && userProfile) {
      // Check if user needs verification
      if (!userProfile.isEmailVerified || !userProfile.isPhoneVerified) {
        navigate('/verify');
      } else {
        navigate('/');
      }
    }
  }, [currentUser, userProfile, navigate]);

  const handleAuthSuccess = () => {
    // Navigation will be handled by the useEffect above
  };

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
    </div>
  );
};

export default Auth;
