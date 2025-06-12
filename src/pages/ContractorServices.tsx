
import React from 'react';
import Header from '@/components/Header';
import ContractorServicesComponent from '@/components/ContractorServices';

const ContractorServices: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ContractorServicesComponent />
    </div>
  );
};

export default ContractorServices;
