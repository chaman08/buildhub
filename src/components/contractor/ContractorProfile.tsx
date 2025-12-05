
import React from 'react';
import { ProfileManagement } from '@/components/ProfileManagement';
import KycStatusCard from '@/components/kyc/KycStatusCard';

const ContractorProfile: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
      <ProfileManagement />
      <KycStatusCard />
    </div>
  );
};

export default ContractorProfile;
