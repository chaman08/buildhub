
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Phone, Mail, MessageCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
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
  const [filteredProjectId, setFilteredProjectId] = useState<string | null>(null);

  useEffect(() => {
    // Get project ID from URL if present
    const hash = window.location.hash;
    const projectIdMatch = hash.match(/projectId=([^&]+)/);
    if (projectIdMatch) {
      setFilteredProjectId(projectIdMatch[1]);
    }

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

      // If filtering by project ID, only get bids for that project
      const bidsQuery = query(
        collection(db, 'bids'),
        where('projectId', 'in', filteredProjectId ? [filteredProjectId] : projectIds)
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

  const clearProjectFilter = () => {
    setFilteredProjectId(null);
    window.location.hash = '#bids';
    fetchReceivedBids();
  };

  const handleAcceptBid = async (bid: Bid) => {
    try {
      console.log('Starting bid acceptance process for bid:', bid.id);
      
      const batch = writeBatch(db);
      
      // Update accepted bid status
      const acceptedBidRef = doc(db, 'bids', bid.id);
      console.log('Updating bid document:', bid.id);
      
      batch.update(acceptedBidRef, {
        status: 'accepted',
        acceptedAt: new Date(),
        updatedAt: new Date(),
        projectStatus: 'in_progress'
      });

      // Update project status and details
      const projectRef = doc(db, 'projects', bid.projectId);
      console.log('Updating project document:', bid.projectId);
      
      // First verify the project exists
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) {
        throw new Error(`Project ${bid.projectId} not found`);
      }

      batch.update(projectRef, {
        status: 'in_progress',
        acceptedContractorId: bid.contractorId,
        acceptedBidId: bid.id,
        acceptedBidAmount: bid.priceQuoted,
        acceptedTimeline: bid.timeline,
        updatedAt: new Date()
      });

      console.log('Committing batch updates...');
      await batch.commit();
      console.log('Batch updates committed successfully');

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
      console.error('Detailed error in handleAcceptBid:', error);
      
      // More specific error messages based on the error type
      let errorMessage = "Failed to accept bid. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          errorMessage = "Project not found. The project may have been deleted.";
        } else if (error.message.includes('permission-denied')) {
          errorMessage = "Permission denied. Please make sure you have the right access.";
        } else if (error.message.includes('already-exists')) {
          errorMessage = "This bid has already been accepted.";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
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
    return <div className="p-4">Loading received bids...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          {filteredProjectId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearProjectFilter}
              className="flex items-center gap-2 self-start"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Back to All Bids</span>
              <span className="xs:hidden">Back</span>
            </Button>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {filteredProjectId ? 'Project Bids' : 'Bids Received'}
          </h2>
        </div>
        <Badge variant="outline" className="text-xs md:text-sm whitespace-nowrap">
          {bids.length} total bids
        </Badge>
      </div>

      {bids.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 px-4">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 md:h-16 md:w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900">No Bids Yet</h3>
              <p className="text-sm text-gray-500 max-w-sm">Once you post projects, contractors will start bidding on them.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <Card key={bid.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg line-clamp-2 pr-2">{bid.projectTitle}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${getStatusColor(bid.status)} text-xs`} variant="secondary">
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                    {bid.createdAt && new Date(bid.createdAt.toDate()).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-0">
                {/* Contractor Info - Mobile Layout */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                      <AvatarFallback className="text-sm">
                        {bid.contractorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm md:text-base truncate">{bid.contractorName}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 fill-current" />
                        <span className="text-xs md:text-sm text-gray-600">{bid.contractorRating}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price and Timeline - Stacked on mobile */}
                  <div className="w-full sm:w-auto text-left sm:text-right">
                    <div className="font-semibold text-base md:text-lg text-green-600">{formatBudget(bid.priceQuoted)}</div>
                    <div className="text-xs md:text-sm text-gray-500">Timeline: {bid.timeline}</div>
                  </div>
                </div>

                {/* Contact Info for Accepted Bids */}
                {bid.status === 'accepted' && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h5 className="font-medium text-sm text-green-800 mb-2">Contact Information</h5>
                    <div className="space-y-1 text-sm text-green-700">
                      {bid.contractorEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{bid.contractorEmail}</span>
                        </div>
                      )}
                      {bid.contractorPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{bid.contractorPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    "{bid.message}"
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  {bid.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        size="sm" 
                        className="w-full sm:flex-1 text-xs md:text-sm"
                        onClick={() => handleAcceptBid(bid)}
                      >
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Accept Bid
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:flex-1 text-xs md:text-sm"
                        onClick={() => handleRejectBid(bid)}
                      >
                        <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  {bid.status === 'accepted' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 text-center py-2">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          ✅ Accepted - Contact details above
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs md:text-sm"
                        onClick={() => handleRejectBid(bid)}
                      >
                        <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Withdraw
                      </Button>
                    </div>
                  )}
                  
                  {bid.status === 'rejected' && (
                    <div className="text-center py-2">
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        ❌ Rejected
                      </Badge>
                    </div>
                  )}
                  
                  {/* Communication Buttons */}
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 sm:flex-none text-xs"
                      onClick={() => window.location.href = `mailto:${bid.contractorEmail}`}
                    >
                      <Mail className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span className="hidden xs:inline">Email</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 sm:flex-none text-xs"
                      onClick={() => window.location.href = '/messages'}
                    >
                      <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span className="hidden xs:inline">Chat</span>
                    </Button>
                  </div>
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
