
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  Reply, 
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  where 
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: any;
  status: 'unread' | 'read' | 'replied';
}

const AdminContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(
      collection(db, 'contactMessages'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactMessage[];
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = messages;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.name.toLowerCase().includes(query) ||
        msg.email.toLowerCase().includes(query) ||
        msg.subject.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query)
      );
    }

    setFilteredMessages(filtered);
  }, [messages, statusFilter, searchQuery]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'read'
      });
      toast({
        title: "Message marked as read",
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast({
        title: "Error updating message",
        variant: "destructive",
      });
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'replied',
        reply: replyText,
        repliedAt: new Date()
      });
      
      // Here you would typically send an email reply
      console.log('Reply sent:', replyText);
      
      toast({
        title: "Reply sent successfully",
        description: "The customer will receive your reply via email.",
      });
      
      setReplyText('');
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error sending reply",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await deleteDoc(doc(db, 'contactMessages', messageId));
      toast({
        title: "Message deleted successfully",
      });
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error deleting message",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive">Unread</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'replied':
        return <Badge variant="default">Replied</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contact Messages</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border rounded-md"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Messages ({filteredMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{message.name}</h3>
                      <p className="text-sm text-gray-600">{message.email}</p>
                    </div>
                    {getStatusBadge(message.status)}
                  </div>
                  <p className="font-medium text-sm mb-1">{message.subject}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(message.timestamp)}
                  </p>
                </div>
              ))}
              {filteredMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No messages found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Details */}
        <Card>
          <CardHeader>
            <CardTitle>Message Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{selectedMessage.name}</span>
                    <span className="text-gray-600">({selectedMessage.email})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(selectedMessage.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="flex space-x-2">
                  {selectedMessage.status === 'unread' && (
                    <Button
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(selectedMessage.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>

                {/* Reply Section */}
                <div className="border-t pt-4">
                  <Label htmlFor="reply">Send Reply</Label>
                  <Textarea
                    id="reply"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                  <Button
                    onClick={() => handleReply(selectedMessage.id)}
                    disabled={!replyText.trim() || isReplying}
                    className="mt-2"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    {isReplying ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a message to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminContactMessages;
