
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import ChatList from '@/components/chat/ChatList';
import ChatInterface from '@/components/chat/ChatInterface';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

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

const Messages: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatListConversations, setChatListConversations] = useState<Conversation[]>([]);

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  // Auto-select conversation if navigated with state
  React.useEffect(() => {
    if (
      location.state &&
      location.state.recipientId &&
      location.state.recipientName &&
      location.state.recipientType &&
      currentUser && 
      userProfile
    ) {
      const { recipientId, recipientName, recipientType } = location.state;
      
      // Create a virtual conversation for immediate chat
      const virtualConversation: Conversation = {
        id: `temp_${recipientId}`,
        projectId: '',
        projectTitle: '',
        recipientId,
        recipientName,
        recipientType,
        lastMessage: '',
        lastMessageTime: null,
        unreadCount: 0,
      };
      
      setSelectedConversation(virtualConversation);
      
      // Clear the navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, currentUser, userProfile, navigate, location.pathname]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <ChatList
              onSelectChat={setSelectedConversation}
              conversationsCallback={setChatListConversations}
            />
          </div>
          
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ChatInterface
                projectId={selectedConversation.projectId}
                projectTitle={selectedConversation.projectTitle || `Chat with ${selectedConversation.recipientName}`}
                recipientId={selectedConversation.recipientId}
                recipientName={selectedConversation.recipientName}
                recipientType={selectedConversation.recipientType}
              />
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
