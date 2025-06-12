
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContractorHome from './ContractorHome';
import AvailableTenders from './AvailableTenders';
import MyBids from './MyBids';
import AcceptedProjects from './AcceptedProjects';
import ContractorProfile from './ContractorProfile';
import Portfolio from './Portfolio';
import PostContractorProject from './PostContractorProject';

const ContractorDashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="container mx-auto py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-6">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="tenders">Tenders</TabsTrigger>
          <TabsTrigger value="bids">My Bids</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="post-service">Post Service</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <ContractorHome />
        </TabsContent>

        <TabsContent value="tenders">
          <AvailableTenders />
        </TabsContent>

        <TabsContent value="bids">
          <MyBids />
        </TabsContent>

        <TabsContent value="projects">
          <AcceptedProjects />
        </TabsContent>

        <TabsContent value="post-service">
          <PostContractorProject />
        </TabsContent>

        <TabsContent value="portfolio">
          <Portfolio />
        </TabsContent>

        <TabsContent value="profile">
          <ContractorProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractorDashboardLayout;
