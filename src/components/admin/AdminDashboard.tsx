
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FolderOpen, 
  UserCheck, 
  BarChart3, 
  Shield, 
  Settings,
  MessageSquare
} from 'lucide-react';
import AdminUserManagement from './AdminUserManagement';
import AdminProjectManagement from './AdminProjectManagement';
import AdminContractorManagement from './AdminContractorManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminContentModeration from './AdminContentModeration';
import AdminSystemSettings from './AdminSystemSettings';
import AdminContactMessages from './AdminContactMessages';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="contractors">Contractors</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">456</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Contractors</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">789</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">5 unread</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setActiveTab('users')} className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button onClick={() => setActiveTab('projects')} className="w-full justify-start" variant="outline">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Review Projects
                  </Button>
                  <Button onClick={() => setActiveTab('contractors')} className="w-full justify-start" variant="outline">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve Contractors
                  </Button>
                  <Button onClick={() => setActiveTab('messages')} className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Messages
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <span className="text-green-600 font-medium">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Authentication</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage</span>
                    <span className="text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Service</span>
                    <span className="text-yellow-600 font-medium">Limited</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <AdminProjectManagement />
          </TabsContent>

          <TabsContent value="contractors" className="mt-6">
            <AdminContractorManagement />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <AdminContactMessages />
          </TabsContent>

          <TabsContent value="moderation" className="mt-6">
            <AdminContentModeration />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <AdminSystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
