
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Settings, BarChart3, Shield, Flag } from 'lucide-react';
import AdminUserManagement from './AdminUserManagement';
import AdminProjectManagement from './AdminProjectManagement';
import AdminContractorManagement from './AdminContractorManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminContentModeration from './AdminContentModeration';
import AdminSystemSettings from './AdminSystemSettings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-900 text-white p-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-red-200">System Administration Dashboard</p>
      </div>
      
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="contractors" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Contractors
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="users">
              <AdminUserManagement />
            </TabsContent>
            
            <TabsContent value="projects">
              <AdminProjectManagement />
            </TabsContent>
            
            <TabsContent value="contractors">
              <AdminContractorManagement />
            </TabsContent>
            
            <TabsContent value="moderation">
              <AdminContentModeration />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>
            
            <TabsContent value="settings">
              <AdminSystemSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
