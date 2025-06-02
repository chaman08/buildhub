import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Phone, Mail, MessageCircle, CheckCircle, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Bid {
  id: string;
  projectId: string;
  projectTitle: string;
  contractorId: string;
  contractorName: string;
  contractorEmail?: string;
  contractorPhone?: string;
  contractorRating: number;
  priceQuoted: number;
  timeline: string;
  message: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  createdAt: any;
}

const BidsSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchReceivedBids();
    }
  }, [currentUser]);

  const fetchReceivedBids = async () => {
    if (!currentUser) return;

    try {
      console.log('Fetching received bids...');
      
      // Get all projects posted by current user
      const projectsQuery = query(
        collection(db, 'projects'),
        where('postedBy', '==', currentUser.uid)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectIds = projectsSnapshot.docs.map(doc => doc.id);
      const projectTitles = projectsSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().title;
        return acc;
      }, {} as Record<string, string>);

      if (projectIds.length === 0) {
        setBids([]);
        setLoading(false);
        return;
      }

      // Get all bids for these projects
      const bidsQuery = query(
        collection(db, 'bids'),
        where('projectId', 'in', projectIds)
      );
      const bidsSnapshot = await getDocs(bidsQuery);

      const bidsData = await Promise.all(
        bidsSnapshot.docs.map(async (bidDoc) => {
          const bidData = bidDoc.data();
          
          // Fetch contractor details
          try {
            const contractorDoc = await getDoc(doc(db, 'users', bidData.contractorId));
            const contractorData = contractorDoc.exists() ? contractorDoc.data() : null;
            
            return {
              id: bidDoc.id,
              projectId: bidData.projectId,
              projectTitle: projectTitles[bidData.projectId] || 'Unknown Project',
              contractorId: bidData.contractorId,
              contractorName: contractorData?.fullName || 'Unknown Contractor',
              contractorEmail: contractorData?.email,
              contractorPhone: contractorData?.mobile,
              contractorRating: contractorData?.rating || 4.0,
              priceQuoted: bidData.priceQuoted,
              timeline: bidData.timeline,
              message: bidData.message,
              status: bidData.status || 'pending',
              createdAt: bidData.createdAt
            };
          } catch (error) {
            console.error('Error fetching contractor details:', error);
            return null;
          }
        })
      );

      const validBids = bidsData.filter(bid => bid !== null) as Bid[];
      console.log('Received bids fetched:', validBids.length);
      setBids(validBids);
    } catch (error) {
      console.error('Error fetching received bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bid: Bid) => {
    try {
      const batch = writeBatch(db);
      
      // Update accepted bid status
      const acceptedBidRef = doc(db, 'bids', bid.id);
      batch.update(acceptedBidRef, {
        status: 'accepted',
        acceptedAt: new Date(),
        updatedAt: new Date()
      });

      // Update project to show it has accepted bids, but keep it open for more bids
      const projectRef = doc(db, 'projects', bid.projectId);
      batch.update(projectRef, {
        status: 'in_progress',
        acceptedContractorId: bid.contractorId,
        acceptedBidId: bid.id,
        updatedAt: new Date()
      });

      await batch.commit();

      // Update local state - only update the accepted bid
      setBids(prevBids => 
        prevBids.map(b => 
          b.id === bid.id ? { ...b, status: 'accepted' as const } : b
        )
      );

      toast({
        title: "Bid Accepted! 🎉",
        description: `You've accepted ${bid.contractorName}'s bid for ${bid.projectTitle}. Other bids remain available for consideration.`,
      });

    } catch (error) {
      console.error('Error accepting bid:', error);
      toast({
        title: "Error",
        description: "Failed to accept bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRejectBid = async (bid: Bid) => {
    try {
      const bidRef = doc(db, 'bids', bid.id);
      await updateDoc(bidRef, {
        status: 'rejected',
        rejectedAt: new Date(),
        updatedAt: new Date()
      });

      // Update local state
      setBids(prevBids => 
        prevBids.map(b => 
          b.id === bid.id ? { ...b, status: 'rejected' as const } : b
        )
      );

      toast({
        title: "Bid Rejected",
        description: `You've rejected ${bid.contractorName}'s bid`,
      });

    } catch (error) {
      console.error('Error rejecting bid:', error);
      toast({
        title: "Error",
        description: "Failed to reject bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatBudget = (amount: number) => {
    if (!amount || isNaN(amount)) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading received bids...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bids Received</h2>
        <Badge variant="outline" className="text-sm">
          {bids.length} total bids
        </Badge>
      </div>

      {bids.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Bids Yet</h3>
              <p className="text-gray-500">Once you post projects, contractors will start bidding on them.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <Card key={bid.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{bid.projectTitle}</CardTitle>
                    <Badge className={getStatusColor(bid.status)} variant="secondary">
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {bid.createdAt && new Date(bid.createdAt.toDate()).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {bid.contractorName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{bid.contractorName}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{bid.contractorRating}</span>
                    </div>
                    {bid.status === 'accepted' && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>📧 {bid.contractorEmail}</p>
                        <p>📞 {bid.contractorPhone}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-green-600">{formatBudget(bid.priceQuoted)}</div>
                    <div className="text-sm text-gray-500">Timeline: {bid.timeline}</div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                  "{bid.message}"
                </p>

                <div className="flex gap-2 pt-4 border-t">
                  {bid.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAcceptBid(bid)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept Bid
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleRejectBid(bid)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {bid.status === 'accepted' && (
                    <>
                      <div className="flex-1 text-center py-2">
                        <Badge className="bg-green-100 text-green-800">
                          ✅ Accepted - Contact details above
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => handleRejectBid(bid)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Withdraw
                      </Button>
                    </>
                  )}
                  
                  {bid.status === 'rejected' && (
                    <div className="flex-1 text-center py-2">
                      <Badge className="bg-red-100 text-red-800">
                        ❌ Rejected
                      </Badge>
                    </div>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BidsSection;
