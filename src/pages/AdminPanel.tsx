
import React from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminPanel: React.FC = () => {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
};

export default AdminPanel;
