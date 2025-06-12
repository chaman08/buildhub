import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Briefcase, FileText, CheckCircle, User, MessageCircle, PlusCircle } from 'lucide-react';
import ContractorHome from './ContractorHome';
import AvailableTenders from './AvailableTenders';
import MyBids from './MyBids';
import AcceptedProjects from './AcceptedProjects';
import ContractorProfile from './ContractorProfile';
import ChatList from '@/components/chat/ChatList';
import ChatInterface from '@/components/chat/ChatInterface';
import PostProjectDialog from '@/components/dashboard/PostProjectDialog';

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

const ContractorDashboardLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showPostDialog, setShowPostDialog] = useState(false);

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto pb-20 md:pb-0">
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
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
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
              <ContractorProfile />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-20">
        <div className="relative flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('tenders')}
            className={`flex flex-col items-center ${activeTab === 'tenders' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs mt-1">Tenders</span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex flex-col items-center ${activeTab === 'projects' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <Briefcase className="h-6 w-6" />
            <span className="text-xs mt-1">Projects</span>
          </button>
          {/* Floating Post Project Button */}
          <button
            onClick={() => setShowPostDialog(true)}
            className="absolute left-1/2 -translate-x-1/2 -top-7 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-white z-30"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            aria-label="Post Project"
          >
            <PlusCircle className="h-8 w-8" />
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center ${activeTab === 'messages' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Messages</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>

      {/* Post Project Dialog */}
      <PostProjectDialog
        open={showPostDialog}
        onOpenChange={setShowPostDialog}
      />
    </div>
  );
};

export default ContractorDashboardLayout;
