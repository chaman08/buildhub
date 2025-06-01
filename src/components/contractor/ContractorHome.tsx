
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, CheckCircle, Clock, Star, Bell } from 'lucide-react';

interface DashboardStats {
  bidsPlaced: number;
  projectsAccepted: number;
  ongoingProjects: number;
  rating: number;
}

interface Notification {
  id: string;
  message: string;
  type: 'bid_update' | 'project_update' | 'payment';
  createdAt: any;
  read: boolean;
}

const ContractorHome: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    bidsPlaced: 0,
    projectsAccepted: 0,
    ongoingProjects: 0,
    rating: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser) return;

    try {
      // Fetch bids placed
      const bidsQuery = query(
        collection(db, 'bids'),
        where('contractorId', '==', currentUser.uid)
      );
      const bidsSnapshot = await getDocs(bidsQuery);
      const bidsData = bidsSnapshot.docs.map(doc => doc.data());

      // Calculate stats
      const bidsPlaced = bidsData.length;
      const projectsAccepted = bidsData.filter(bid => bid.status === 'accepted').length;
      const ongoingProjects = bidsData.filter(bid => bid.status === 'accepted' && bid.projectStatus !== 'completed').length;

      setStats({
        bidsPlaced,
        projectsAccepted,
        ongoingProjects,
        rating: userProfile?.rating || 4.5
      });

      // Mock notifications - in real app, fetch from Firestore
      setNotifications([
        {
          id: '1',
          message: 'Your bid for "Residential Construction" has been shortlisted',
          type: 'bid_update',
          createdAt: new Date(),
          read: false
        },
        {
          id: '2',
          message: 'Project "Office Interior" milestone payment released',
          type: 'payment',
          createdAt: new Date(),
          read: false
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_update': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'project_update': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'payment': return <Star className="h-4 w-4 text-yellow-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <Avatar className="h-16 w-16">
          <AvatarImage src={userProfile?.profilePicture} />
          <AvatarFallback className="text-blue-600 bg-white text-xl">
            {userProfile?.fullName?.charAt(0) || 'C'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {userProfile?.fullName || 'Contractor'}!
          </h1>
          <p className="text-blue-100">
            {userProfile?.companyName && `${userProfile.companyName} • `}
            {userProfile?.serviceCategory || 'Construction Services'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bids Placed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bidsPlaced}</div>
            <p className="text-xs text-muted-foreground">Total bids submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projectsAccepted}</div>
            <p className="text-xs text-muted-foreground">Winning bids</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ongoingProjects}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.rating}
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            </div>
            <p className="text-xs text-muted-foreground">Client feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No new notifications</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorHome;
