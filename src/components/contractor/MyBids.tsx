
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Calendar, DollarSign, CheckCircle, X, Clock, Star } from 'lucide-react';

interface Bid {
  id: string;
  projectId: string;
  projectTitle?: string;
  priceQuoted: number;
  timeline: string;
  message: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  createdAt: any;
  updatedAt: any;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const MyBids: React.FC = () => {
  const { currentUser } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchMyBids();
    }
  }, [currentUser]);

  const fetchMyBids = async () => {
    if (!currentUser) return;

    try {
      console.log('Fetching contractor bids...');
      
      const bidsQuery = query(
        collection(db, 'bids'),
        where('contractorId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(bidsQuery);
      const bidsData = await Promise.all(
        snapshot.docs.map(async (bidDoc) => {
          const bidData = bidDoc.data();
          
          // Fetch project title and customer details
          try {
            const projectDoc = await getDoc(doc(db, 'projects', bidData.projectId));
            const projectData = projectDoc.exists() ? projectDoc.data() : null;
            
            let customerData = null;
            if (projectData?.postedBy) {
              const customerDoc = await getDoc(doc(db, 'users', projectData.postedBy));
              customerData = customerDoc.exists() ? customerDoc.data() : null;
            }
            
            return {
              id: bidDoc.id,
              ...bidData,
              projectTitle: projectData?.title || 'Project Not Found',
              customerName: customerData?.fullName || 'Unknown Customer',
              customerEmail: customerData?.email,
              customerPhone: customerData?.mobile,
            };
          } catch (error) {
            console.error('Error fetching project for bid:', error);
            return {
              id: bidDoc.id,
              ...bidData,
              projectTitle: 'Project Not Found'
            };
          }
        })
      );
      
      console.log('Contractor bids fetched:', bidsData.length);
      setBids(bidsData as Bid[]);
    } catch (error) {
      console.error('Error fetching contractor bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shortlisted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'shortlisted': return <Star className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatBudget = (amount: number) => {
    if (!amount || isNaN(amount)) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN');
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return <div>Loading your bids...</div>;
  }

  const acceptedBids = bids.filter(bid => bid.status === 'accepted');
  const pendingBids = bids.filter(bid => bid.status === 'pending');
  const rejectedBids = bids.filter(bid => bid.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Bids</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            {acceptedBids.length} accepted
          </Badge>
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            {pendingBids.length} pending
          </Badge>
          <Badge variant="outline" className="text-red-600 border-red-600">
            {rejectedBids.length} rejected
          </Badge>
        </div>
      </div>

      {bids.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Bids Yet</h3>
              <p className="text-gray-500">Start browsing available tenders and place your first bid.</p>
              <Button onClick={() => window.location.hash = '#tenders'}>
                Browse Tenders
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Accepted Bids - Highlighted */}
          {acceptedBids.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  🎉 Accepted Bids - Contact Details Revealed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {acceptedBids.map((bid) => (
                    <div key={bid.id} className="bg-white p-4 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg text-green-800">{bid.projectTitle}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="font-semibold text-green-600">{formatBudget(bid.priceQuoted)}</span>
                            <span>Timeline: {bid.timeline}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(bid.status)} variant="outline">
                          {getStatusIcon(bid.status)}
                          <span className="ml-1">Accepted</span>
                        </Badge>
                      </div>
                      
                      {/* Customer Contact Details */}
                      <div className="bg-green-100 p-3 rounded-lg mb-3">
                        <h5 className="font-medium text-green-800 mb-2">👤 Customer Contact</h5>
                        <div className="text-sm text-green-700">
                          <p><strong>Name:</strong> {bid.customerName}</p>
                          <p><strong>Email:</strong> {bid.customerEmail}</p>
                          <p><strong>Phone:</strong> {bid.customerPhone}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/project/${bid.projectId}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Project
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`tel:${bid.customerPhone}`)}
                        >
                          📞 Call
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`mailto:${bid.customerEmail}`)}
                        >
                          📧 Email
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Bids Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Bids History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Quote</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map((bid) => (
                    <TableRow key={bid.id} className={bid.status === 'accepted' ? 'bg-green-50' : ''}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bid.projectTitle}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {bid.message.substring(0, 50)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatBudget(bid.priceQuoted)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {bid.timeline}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bid.status)} variant="outline">
                          {getStatusIcon(bid.status)}
                          <span className="ml-1">{bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(bid.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/project/${bid.projectId}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {bid.status === 'pending' && (
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyBids;
