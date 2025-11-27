import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useContractorRating } from '@/hooks/useContractorRating';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, CheckCircle, Clock, Star, Bell, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  bidsPlaced: number;
  projectsAccepted: number;
  ongoingProjects: number;
}

const ContractorHome: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { rating, totalRatings, loading: ratingLoading } = useContractorRating(currentUser?.uid || '');
  const { notifications, loading: notificationsLoading, markAsRead, markAllAsRead } = useNotifications(currentUser?.uid || '');
  const [stats, setStats] = useState<DashboardStats>({
    bidsPlaced: 0,
    projectsAccepted: 0,
    ongoingProjects: 0
  });
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
        ongoingProjects
      });
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
      case 'message': return <MessageCircle className="h-4 w-4 text-purple-600" />;
      case 'review': return <Star className="h-4 w-4 text-orange-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type and data
    if (notification.projectId) {
      window.open(`/project/${notification.projectId}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
          <Skeleton className="h-16 w-16 rounded-full bg-white/40" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48 bg-white/40" />
            <Skeleton className="h-4 w-64 bg-white/30" />
            <Skeleton className="h-4 w-32 bg-white/30" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <Card key={`home-skeleton-${item}`} className="animate-card" style={{ animationDelay: `${item * 60}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="animate-card" style={{ animationDelay: '280ms' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={`notif-skeleton-${item}`} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            Welcome back, {userProfile?.fullName || 'Contractor'}!
          </h1>
          <p className="text-blue-100">
            {userProfile?.companyName && `${userProfile.companyName} • `}
            {userProfile?.serviceCategory || 'Construction Services'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-white font-medium">
                {ratingLoading ? 'Loading...' : `${rating || 'No rating'} ${totalRatings > 0 ? `(${totalRatings})` : ''}`}
              </span>
            </div>
          </div>
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
              {ratingLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                <>
                  {rating || 'No rating'}
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRatings > 0 ? `${totalRatings} reviews` : 'No reviews yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          {notifications.some(n => !n.read) && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {notificationsLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No new notifications</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt?.toDate()).toLocaleDateString()}
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
