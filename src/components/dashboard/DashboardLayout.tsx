import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, FileText, MessageCircle, Settings, Users, Briefcase, CheckCircle, PlusCircle } from 'lucide-react';
import ProjectsSection from './ProjectsSection';
import BidsSection from './BidsSection';
import AcceptedProjectsSection from './AcceptedProjectsSection';
import ContractorsSection from './ContractorsSection';
import ProfileSection from './ProfileSection';
import NotificationsSection from './NotificationsSection';
import SettingsSection from './SettingsSection';
import PostProjectDialog from './PostProjectDialog';
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
  const [showPostDialog, setShowPostDialog] = useState(false);

  return (
    <div className="pt-20 px-4 pb-28 md:pb-12 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex flex-wrap gap-2 px-3 py-2 bg-slate-50">
            <TabsTrigger
              value="projects"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Bids</span>
            </TabsTrigger>
            <TabsTrigger
              value="ongoing"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Ongoing</span>
            </TabsTrigger>
            <TabsTrigger
              value="contractors"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Contractors</span>
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
            >
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
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
            
            <TabsContent value="profile">
              <ProfileSection />
            </TabsContent>
            
            <TabsContent value="settings">
              <SettingsSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Mobile Bottom Navigation with Floating Post Project Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-t border-gray-200 shadow-lg md:hidden z-20">
        <div className="relative flex justify-around items-center h-16 px-3">
          <button
            onClick={() => setActiveTab('bids')}
            className={`flex flex-col items-center ${activeTab === 'bids' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <FileText className="h-7 w-7" />
            <span className="text-[11px] mt-1">Bids</span>
          </button>
          <button
            onClick={() => setShowPostDialog(true)}
            className="absolute left-1/2 -translate-x-1/2 -top-7 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-white z-30"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            aria-label="Post Project"
          >
            <PlusCircle className="h-8 w-8" />
          </button>
          <button
            onClick={() => setActiveTab('contractors')}
            className={`flex flex-col items-center ${activeTab === 'contractors' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <Users className="h-7 w-7" />
            <span className="text-[11px] mt-1">Contractors</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center ${activeTab === 'messages' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <MessageCircle className="h-7 w-7" />
            <span className="text-[11px] mt-1">Messages</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <Briefcase className="h-7 w-7" />
            <span className="text-[11px] mt-1">Profile</span>
          </button>
        </div>
      </div>

      <PostProjectDialog
        open={showPostDialog}
        onOpenChange={setShowPostDialog}
      />
    </div>
  );
};

export default DashboardLayout;
