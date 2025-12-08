import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Phone, Mail, MessageCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { buildTrustBadges } from '@/utils/trust';

interface Bid {
  id: string;
  projectId: string;
  projectTitle: string;
  contractorId: string;
  contractorName: string;
  contractorEmail?: string;
  contractorPhone?: string;
  contractorVerified?: boolean;
  contractorVerificationBadge?: boolean;
  contractorKycStatus?: 'not_started' | 'pending' | 'under_review' | 'needs_info' | 'verified' | 'rejected';
  contractorProfileComplete?: boolean;
  contractorIsEmailVerified?: boolean;
  contractorIsPhoneVerified?: boolean;
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

      const bidsQuery = query(
        collection(db, 'bids'),
        where('projectId', 'in', filteredProjectId ? [filteredProjectId] : projectIds)
      );
      const bidsSnapshot = await getDocs(bidsQuery);

      const bidsData = await Promise.all(
        bidsSnapshot.docs.map(async (bidDoc) => {
          const bidData = bidDoc.data();

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
              contractorVerified: contractorData?.verified || contractorData?.verificationBadge,
              contractorVerificationBadge: contractorData?.verificationBadge,
              contractorKycStatus: contractorData?.kycStatus,
              contractorProfileComplete: contractorData?.profileComplete,
              contractorIsEmailVerified: contractorData?.isEmailVerified,
              contractorIsPhoneVerified: contractorData?.isPhoneVerified,
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
    const projectAcceptedId = bids.find((b) => b.projectId === bid.projectId && b.status === 'accepted')?.id;

    if (projectAcceptedId && projectAcceptedId !== bid.id) {
      toast({
        title: "Bid already accepted",
        description: "You’ve already accepted another bid for this project.",
        variant: "destructive"
      });
      return;
    }

    if (!(bid.status === 'pending' || bid.status === 'shortlisted')) {
      toast({
        title: "Cannot accept",
        description: "Only pending or shortlisted bids can be accepted.",
        variant: "destructive"
      });
      return;
    }

    try {
      const acceptBidFn = httpsCallable(functions, 'acceptBid');
      await acceptBidFn({ bidId: bid.id });

      setBids(prevBids => 
        prevBids.map((b) => {
          if (b.projectId !== bid.projectId) return b;
          if (b.id === bid.id) {
            return { ...b, status: 'accepted' as const };
          }
          if (b.status === 'pending' || b.status === 'shortlisted') {
            return { ...b, status: 'rejected' as const };
          }
          return b;
        })
      );

      toast({
        title: "Bid accepted",
        description: `You've accepted ${bid.contractorName}'s bid for ${bid.projectTitle}. Other bids remain available for consideration.`,
      });

    } catch (error: any) {
      console.error('Detailed error in handleAcceptBid:', error);
      
      let errorMessage = "Failed to accept bid. Please try again.";
      const code = error?.code as string | undefined;

      if (code === 'permission-denied') {
        errorMessage = "Only the project owner can accept bids.";
      } else if (code === 'failed-precondition') {
        errorMessage = "Bid could not be accepted (already resolved or project already locked).";
      } else if (error instanceof Error && error.message.includes('not found')) {
        errorMessage = "Project not found. The project may have been deleted.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleRejectBid = async (bid: Bid) => {
    if (!(bid.status === 'pending' || bid.status === 'shortlisted')) {
      toast({
        title: "Cannot update bid",
        description: "Only pending or shortlisted bids can be updated.",
        variant: "destructive"
      });
      return;
    }

    try {
      const bidRef = doc(db, 'bids', bid.id);
      await updateDoc(bidRef, {
        status: 'rejected',
        rejectedAt: new Date(),
        updatedAt: new Date()
      });

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
          {bids.map((bid) => {
            const acceptedBidIdForProject = bids.find((b) => b.projectId === bid.projectId && b.status === 'accepted')?.id;
            const trustBadges = buildTrustBadges({
              verified: bid.contractorVerified,
              verificationBadge: bid.contractorVerificationBadge,
              kycStatus: bid.contractorKycStatus,
              profileComplete: bid.contractorProfileComplete,
              isEmailVerified: bid.contractorIsEmailVerified,
              isPhoneVerified: bid.contractorIsPhoneVerified
            }).slice(0, 3);
            return (
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
                        {trustBadges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {trustBadges.map((badge) => (
                              <Badge
                                key={`${bid.id}-${badge.label}`}
                                variant="outline"
                                className={`${badge.className} border`}
                              >
                                {badge.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto text-left sm:text-right">
                      <div className="font-semibold text-base md:text-lg text-green-600">{formatBudget(bid.priceQuoted)}</div>
                      <div className="text-xs md:text-sm text-gray-500">Timeline: {bid.timeline}</div>
                    </div>
                  </div>

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

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      "{bid.message}"
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    {(bid.status === 'pending' || bid.status === 'shortlisted') && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          size="sm" 
                          className="w-full sm:flex-1 text-xs md:text-sm"
                          onClick={() => handleAcceptBid(bid)}
                          disabled={!!acceptedBidIdForProject && acceptedBidIdForProject !== bid.id}
                        >
                          <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          {acceptedBidIdForProject && acceptedBidIdForProject !== bid.id ? 'Accepted elsewhere' : 'Accept Bid'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:flex-1 text-xs md:text-sm"
                          onClick={() => handleRejectBid(bid)}
                          disabled={!!acceptedBidIdForProject && acceptedBidIdForProject !== bid.id}
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
                            Accepted - Contact details above
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {bid.status === 'rejected' && (
                      <div className="text-center py-2">
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          Rejected
                        </Badge>
                      </div>
                    )}
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

export default BidsSection;
