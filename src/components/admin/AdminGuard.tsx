
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { currentUser, userProfile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <LoadingScreen
        variant="fullscreen"
        message="Checking admin permissions..."
        showLogo={true}
      />
    );
  }

  if (!currentUser || !userProfile || !isAdmin()) {
    return <Navigate to="/not-found" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
