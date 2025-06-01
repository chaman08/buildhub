
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FolderOpen, Users, MessageCircle, Settings, PlusCircle } from 'lucide-react';
import ProfileSection from './ProfileSection';
import ProjectsSection from './ProjectsSection';
import BidsSection from './BidsSection';
import ContractorsSection from './ContractorsSection';
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
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="bids" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Bids</span>
            </TabsTrigger>
            <TabsTrigger value="contractors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Contractors</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="profile">
              <ProfileSection />
            </TabsContent>
            
            <TabsContent value="projects">
              <ProjectsSection />
            </TabsContent>
            
            <TabsContent value="bids">
              <BidsSection />
            </TabsContent>
            
            <TabsContent value="contractors">
              <ContractorsSection />
            </TabsContent>
            
            <TabsContent value="messages">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <div className="h-96 flex items-center justify-center border rounded-lg">
                      <div className="text-center text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                        <p>Select a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
