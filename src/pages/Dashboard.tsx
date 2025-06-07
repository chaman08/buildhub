
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Dashboard: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    } else if (userProfile?.userType === 'contractor') {
      navigate('/contractor-dashboard');
    }
  }, [currentUser, userProfile, navigate]);

  if (!currentUser || userProfile?.userType === 'contractor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />
      <DashboardLayout />
      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
