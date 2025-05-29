
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, MessageCircle, FileText, User } from 'lucide-react';

const NotificationsSection: React.FC = () => {
  // Mock data - will be replaced with real data
  const notifications = [
    {
      id: '1',
      type: 'bid',
      title: 'New bid received',
      message: 'Raj Construction submitted a bid for your Residential House Construction project',
      time: '2 hours ago',
      read: false,
      icon: FileText
    },
    {
      id: '2',
      type: 'message',
      title: 'Message from contractor',
      message: 'Modern Interiors sent you a message regarding your office renovation project',
      time: '1 day ago',
      read: true,
      icon: MessageCircle
    },
    {
      id: '3',
      type: 'profile',
      title: 'Profile incomplete',
      message: 'Complete your profile to get better project recommendations',
      time: '3 days ago',
      read: false,
      icon: User
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Notifications & Messages</h2>
        <Button variant="outline" size="sm">
          Mark all as read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
              <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <Card key={notification.id} className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${!notification.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <IconComponent className={`h-5 w-5 ${!notification.read ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        {!notification.read && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
