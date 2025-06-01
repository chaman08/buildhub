
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Briefcase, FileText, CheckCircle, User, Upload, MessageCircle } from 'lucide-react';
import ContractorHome from './ContractorHome';
import AvailableTenders from './AvailableTenders';
import MyBids from './MyBids';
import AcceptedProjects from './AcceptedProjects';
import ContractorProfile from './ContractorProfile';
import Portfolio from './Portfolio';

const ContractorDashboardLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="tenders" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Tenders</span>
            </TabsTrigger>
            <TabsTrigger value="bids" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">My Bids</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
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
            
            <TabsContent value="profile">
              <ContractorProfile />
            </TabsContent>
            
            <TabsContent value="portfolio">
              <Portfolio />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ContractorDashboardLayout;
