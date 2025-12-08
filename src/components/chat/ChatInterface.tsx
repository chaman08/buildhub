import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, functions, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle, Paperclip, File, Check, CheckCheck, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { evaluateTrustGate } from '@/utils/trust';
import { buildConversationId, normalizeParticipants } from '@/utils/chat';

interface ChatMessage {
  id: string;
  projectId: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'contractor';
  recipientId: string;
  message: string;
  attachments?: string[];
  timestamp: any;
  read?: boolean;
  deliveredTo?: Record<string, any>;
  readBy?: Record<string, any>;
  status?: 'sent' | 'delivered' | 'read';
  participants: string[];
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
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const participants = useMemo(
    () => (currentUser ? normalizeParticipants([currentUser.uid, recipientId]) : []),
    [currentUser, recipientId]
  );

  const conversationId = useMemo(() => {
    if (!currentUser || !recipientId) return '';
    try {
      return buildConversationId(projectId, participants);
    } catch {
      return '';
    }
  }, [currentUser, projectId, participants, recipientId]);

  useEffect(() => {
    if (!currentUser || !recipientId || !conversationId) return;

    const messagesQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatMessage[];

      const filtered = messagesData.filter((msg) => {
        const msgParticipants = normalizeParticipants(msg.participants || []);
        const samePair =
          participants.length === 2 &&
          msgParticipants.length === 2 &&
          msgParticipants[0] === participants[0] &&
          msgParticipants[1] === participants[1];
        const sameProject = (msg.projectId || '') === (projectId || '');
        const matchesConversation = msg.conversationId === conversationId;
        return (matchesConversation || (samePair && sameProject));
      });

      setMessages(filtered);
    });

    return () => unsubscribe();
  }, [conversationId, currentUser, recipientId, participants, projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const ensureThreadDocument = async () => {
    if (!conversationId || participants.length !== 2) return;
    const threadRef = doc(db, 'chatThreads', conversationId);
    const snap = await getDoc(threadRef);
    if (!snap.exists()) {
      await setDoc(
        threadRef,
        {
          participants,
          projectId: projectId || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }
  };

  const uploadSelectedAttachments = async (): Promise<string[]> => {
    if (!attachments.length || !conversationId) return [];
    setUploading(true);
    try {
      await ensureThreadDocument();
      const uploads = attachments.slice(0, 5).map(async (file) => {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is larger than 10MB`);
        }
        const storageRef = ref(storage, `chatAttachments/${conversationId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file, { contentType: file.type });
        return getDownloadURL(storageRef);
      });
      return await Promise.all(uploads);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!currentUser || !userProfile || participants.length !== 2 || !conversationId) {
      toast({
        title: 'Sign in required',
        description: 'Log in to send messages.',
        variant: 'destructive'
      });
      return;
    }

    const gate = evaluateTrustGate(userProfile, 'message', { requireKyc: userProfile.userType === 'contractor' });
    if (!gate.allowed) {
      toast({
        title: 'Update your profile',
        description: gate.reason || 'Complete verification to send messages.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await ensureThreadDocument();
      const attachmentUrls = await uploadSelectedAttachments();
      const createChat = httpsCallable(functions, 'createChatMessage');
      await createChat({
        projectId: projectId || '',
        recipientId,
        recipientName,
        recipientType,
        message: newMessage.trim(),
        participants,
        attachments: attachmentUrls
      });
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Message not sent',
        description: 'Please try again in a moment.',
        variant: 'destructive'
      });
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        projectId: projectId || '',
        conversationId: conversationId || '',
        senderId: currentUser.uid,
        senderName: userProfile.fullName,
        senderType: userProfile.userType,
        recipientId,
        message: newMessage.trim() || '(failed to send)',
        attachments: [],
        timestamp: new Date(),
        deliveredTo: { [currentUser.uid]: new Date() },
        readBy: { [currentUser.uid]: new Date() },
        status: 'sent',
        participants
      }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // Mark messages as read when viewing
  useEffect(() => {
    const markRead = async () => {
      if (!currentUser) return;
      const unread = messages.filter(
        (m) => m.senderId !== currentUser.uid && !(m.readBy && m.readBy[currentUser.uid])
      );
      for (const msg of unread) {
        try {
          await updateDoc(doc(db, 'chats', msg.id), {
            [`deliveredTo.${currentUser.uid}`]: serverTimestamp(),
            [`readBy.${currentUser.uid}`]: serverTimestamp(),
            status: 'read'
          });
        } catch (err) {
          console.error('Failed to mark chat message read', err);
        }
      }
    };
    if (messages.length) {
      markRead();
    }
  }, [messages, currentUser, conversationId]);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = [...attachments, ...files].slice(0, 5);
    if (attachments.length + files.length > 5) {
      toast({
        title: 'Too many files',
        description: 'You can attach up to 5 files per message.',
        variant: 'destructive'
      });
    }
    setAttachments(next);
    e.target.value = '';
  };

  const removeAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((file) => file.name !== name));
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

  const messageStatusLabel = (message: ChatMessage) => {
    if (message.senderId !== currentUser?.uid) return '';
    if ((message.readBy && message.readBy[recipientId]) || message.status === 'read') {
      return 'Read';
    }
    if ((message.deliveredTo && message.deliveredTo[recipientId]) || message.status === 'delivered') {
      return 'Delivered';
    }
    return 'Sent';
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          Chat with {recipientName}
          <Badge variant="outline" className="ml-auto">
            {recipientType === 'contractor' ? 'Contractor' : 'Customer'}
          </Badge>
        </CardTitle>
        {projectTitle && projectTitle !== `Chat with ${recipientName}` && (
          <p className="text-sm text-gray-500">Project: {projectTitle}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Messages Area */}
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === currentUser?.uid;
              const status = messageStatusLabel(message);
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>
                        {message.senderName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-1' : ''}`}>
                    {!isOwnMessage && (
                      <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 space-y-2 ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.message && (
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      )}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="space-y-1">
                          {message.attachments.map((url, idx) => (
                            <a
                              key={`${message.id}-att-${idx}`}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center gap-2 text-sm underline ${isOwnMessage ? 'text-blue-100 hover:text-white' : 'text-blue-700 hover:text-blue-900'}`}
                            >
                              <File className="h-4 w-4" />
                              <span className="truncate max-w-[180px]">
                                {url.split('/').pop()?.split('?')[0] || `Attachment ${idx + 1}`}
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                      <p className={`text-xs mt-1 flex items-center gap-2 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                        {isOwnMessage && status && (
                          <span className="inline-flex items-center gap-1">
                            {status === 'Read' ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            {status}
                          </span>
                        )}
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
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t">
        {attachments.length > 0 && (
          <div className="pb-2 flex flex-wrap gap-2">
            {attachments.map((file) => (
              <Badge key={file.name} variant="secondary" className="flex items-center gap-2 py-1 px-2">
                <File className="h-3 w-3" />
                <span className="max-w-[160px] truncate text-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(file.name)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleAttachmentChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || uploading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
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
            disabled={(!newMessage.trim() && attachments.length === 0) || loading || uploading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
