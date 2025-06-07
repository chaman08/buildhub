
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, FileText, MessageCircle, Settings, Users, Briefcase, CheckCircle } from 'lucide-react';
import ProjectsSection from './ProjectsSection';
import BidsSection from './BidsSection';
import AcceptedProjectsSection from './AcceptedProjectsSection';
import ContractorsSection from './ContractorsSection';
import ProfileSection from './ProfileSection';
import NotificationsSection from './NotificationsSection';
import SettingsSection from './SettingsSection';
import ChatList from '@/components/chat/ChatList';
import ChatInterface from '@/components/chat/ChatInterface';

interface Conversation {
  id: string;
  projectId: string;
  projectTitle: string;
  recipientId: string;
  recipientName: string;
  recipientType: 'customer' | 'contractor';
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
}

const DashboardLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <div className="pt-16 sm:pt-20 px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 p-1">
            <TabsTrigger value="projects" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Home className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Projects</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="bids" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Bids</span>
              <span className="sm:hidden">Bids</span>
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Ongoing</span>
              <span className="sm:hidden">Work</span>
            </TabsTrigger>
            <TabsTrigger value="contractors" className="hidden sm:flex items-center gap-2 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Contractors</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Messages</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="hidden sm:flex items-center gap-2 text-xs sm:text-sm">
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="hidden sm:flex items-center gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-3 sm:p-4 lg:p-6">
            <TabsContent value="projects">
              <ProjectsSection />
            </TabsContent>
            
            <TabsContent value="bids">
              <BidsSection />
            </TabsContent>
            
            <TabsContent value="ongoing">
              <AcceptedProjectsSection />
            </TabsContent>
            
            <TabsContent value="contractors">
              <ContractorsSection />
            </TabsContent>
            
            <TabsContent value="messages">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="lg:col-span-1">
                  <ChatList onSelectChat={setSelectedConversation} />
                </div>
                <div className="lg:col-span-2">
                  {selectedConversation ? (
                    <ChatInterface
                      projectId={selectedConversation.projectId}
                      projectTitle={selectedConversation.projectTitle}
                      recipientId={selectedConversation.recipientId}
                      recipientName={selectedConversation.recipientName}
                      recipientType={selectedConversation.recipientType}
                    />
                  ) : (
                    <div className="h-80 sm:h-96 flex items-center justify-center border rounded-lg">
                      <div className="text-center text-gray-500">
                        <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
                        <p className="text-sm sm:text-base">Select a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="profile">
              <ProfileSection />
            </TabsContent>
            
            <TabsContent value="settings">
              <SettingsSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardLayout;
