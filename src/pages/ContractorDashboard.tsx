
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import ContractorDashboardLayout from '@/components/contractor/ContractorDashboardLayout';

const ContractorDashboard: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    } else if (userProfile?.userType !== 'contractor') {
      navigate('/dashboard');
    }
  }, [currentUser, userProfile, navigate]);

  if (!currentUser || userProfile?.userType !== 'contractor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header />
      <ContractorDashboardLayout />
      <MobileBottomNav />
    </div>
  );
};

export default ContractorDashboard;
