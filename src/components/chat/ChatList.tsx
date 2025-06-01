
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatData {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'contractor';
  recipientId: string;
  recipientName: string;
  recipientType: 'customer' | 'contractor';
  participants: string[];
  message: string;
  timestamp: any;
  read: boolean;
}

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

interface ChatListProps {
  onSelectChat: (conversation: Conversation) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const { currentUser, userProfile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      try {
        // Get all chats where user is a participant
        const chatsQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', currentUser.uid),
          orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
          const chatsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ChatData[];

          // Group by project and recipient
          const conversationMap = new Map<string, Conversation>();

          for (const chat of chatsData) {
            const key = `${chat.projectId}-${chat.recipientId}`;
            
            if (!conversationMap.has(key)) {
              // Get project details
              const projectQuery = query(
                collection(db, 'projects'),
                where('__name__', '==', chat.projectId)
              );
              const projectSnapshot = await getDocs(projectQuery);
              const projectData = projectSnapshot.docs[0]?.data();

              conversationMap.set(key, {
                id: key,
                projectId: chat.projectId,
                projectTitle: projectData?.title || 'Unknown Project',
                recipientId: chat.recipientId,
                recipientName: chat.recipientName,
                recipientType: chat.recipientType,
                lastMessage: chat.message,
                lastMessageTime: chat.timestamp,
                unreadCount: 0
              });
            }

            // Update if this is a more recent message
            const existing = conversationMap.get(key)!;
            if (!existing.lastMessageTime || 
                (chat.timestamp && chat.timestamp > existing.lastMessageTime)) {
              existing.lastMessage = chat.message;
              existing.lastMessageTime = chat.timestamp;
            }

            // Count unread messages
            if (!chat.read && chat.senderId !== currentUser.uid) {
              existing.unreadCount++;
            }
          }

          setConversations(Array.from(conversationMap.values()));
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } else {
        return date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        });
      }
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading conversations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8 px-6">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                onClick={() => onSelectChat(conversation)}
                className="w-full justify-start p-4 h-auto"
              >
                <div className="flex items-start gap-3 w-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {conversation.recipientName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium truncate">
                        {conversation.recipientName}
                      </h4>
                      <div className="flex items-center gap-2">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {conversation.projectTitle}
                    </p>
                    
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatList;
