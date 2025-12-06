
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserCheck, UserX, Eye, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserProfile } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(usersQuery);
      const userData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm)
      );
    }
    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteUserAndData = async (user: UserProfile) => {
    if (!window.confirm(`Delete ${user.fullName || 'this user'} and all related data? This cannot be undone.`)) {
      return;
    }

    setDeletingUserId(user.uid);
    try {
      // Gather documents tied to the user
      const [projectsSnap, contractorProjectsSnap, bidsAsContractorSnap, bidsAsCustomerSnap] = await Promise.all([
        getDocs(query(collection(db, 'projects'), where('postedBy', '==', user.uid))),
        getDocs(query(collection(db, 'contractor_projects'), where('postedBy', '==', user.uid))),
        getDocs(query(collection(db, 'bids'), where('contractorId', '==', user.uid))),
        getDocs(query(collection(db, 'bids'), where('customerId', '==', user.uid)))
      ]);

      // Delete projects the user posted
      for (const docSnap of projectsSnap.docs) {
        await deleteDoc(doc(db, 'projects', docSnap.id));
      }

      // Delete contractor service listings
      for (const docSnap of contractorProjectsSnap.docs) {
        await deleteDoc(doc(db, 'contractor_projects', docSnap.id));
      }

      // Delete bids (as contractor and customer)
      const bidIds = new Set<string>();
      bidsAsContractorSnap.docs.forEach((d) => bidIds.add(d.id));
      bidsAsCustomerSnap.docs.forEach((d) => bidIds.add(d.id));
      for (const bidId of bidIds) {
        await deleteDoc(doc(db, 'bids', bidId));
      }

      // Finally delete the user document
      await deleteDoc(doc(db, 'users', user.uid));

      setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      setFilteredUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      toast({
        title: 'Account deleted',
        description: `${user.fullName || 'User'} and related data were removed.`
      });
    } catch (error) {
      console.error('Error deleting user and data:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not delete user. Check permissions and retry.',
        variant: 'destructive'
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.userType === 'contractor' ? 'default' : 'secondary'}>
                      {user.userType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.isEmailVerified && (
                        <Badge variant="outline" className="text-green-600">Email</Badge>
                      )}
                      {user.isPhoneVerified && (
                        <Badge variant="outline" className="text-blue-600">Phone</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div><strong>Name:</strong> {selectedUser.fullName}</div>
                              <div><strong>Email:</strong> {selectedUser.email}</div>
                              <div><strong>Phone:</strong> {selectedUser.mobile}</div>
                              <div><strong>City:</strong> {selectedUser.city}</div>
                              <div><strong>User Type:</strong> {selectedUser.userType}</div>
                              {selectedUser.userType === 'contractor' && (
                                <>
                                  <div><strong>Company:</strong> {selectedUser.companyName}</div>
                                  <div><strong>Service:</strong> {selectedUser.serviceCategory}</div>
                                  <div><strong>Experience:</strong> {selectedUser.experience} years</div>
                                </>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => deleteUserAndData(user)}
                        disabled={deletingUserId === user.uid}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
