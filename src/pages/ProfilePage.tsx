import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileManagement } from '@/components/ProfileManagement';
import { Card, CardContent } from '@/components/ui/card';

export const ProfilePage = () => {
  const { userProfile } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {userProfile?.fullName || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Welcome to your profile dashboard. Here you can manage your account information and preferences.
            </p>
          </CardContent>
        </Card>
      </div>

      <ProfileManagement />
    </div>
  );
}; 