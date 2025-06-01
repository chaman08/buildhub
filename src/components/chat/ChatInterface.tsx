
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'contractor';
  message: string;
  timestamp: any;
  read: boolean;
}

interface ChatInterfaceProps {
  projectId: string;
  projectTitle: string;
  recipientId: string;
  recipientName: string;
  recipientType: 'customer' | 'contractor';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  projectId,
  projectTitle,
  recipientId,
  recipientName,
  recipientType
}) => {
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectId || !currentUser) return;

    const messagesQuery = query(
      collection(db, 'chats'),
      where('projectId', '==', projectId),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [projectId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !userProfile) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'chats'), {
        projectId,
        senderId: currentUser.uid,
        senderName: userProfile.fullName,
        senderType: userProfile.userType,
        recipientId,
        recipientName,
        recipientType,
        participants: [currentUser.uid, recipientId],
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          Chat with {recipientName}
          <Badge variant="outline" className="ml-auto">
            {recipientType === 'contractor' ? 'Contractor' : 'Customer'}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-500">Project: {projectTitle}</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === currentUser?.uid;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>
                        {message.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-1' : ''}`}>
                    {!isOwnMessage && (
                      <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  {isOwnMessage && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>
                        {userProfile?.fullName.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
