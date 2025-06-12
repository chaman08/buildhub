import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useBookmarks } from '@/contexts/BookmarkContext';
import Header from '@/components/Header';
import RatingModal from '@/components/RatingModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, DollarSign, ArrowLeft, Phone, Mail, MessageCircle, Star, Heart } from 'lucide-react';
import BidFormModal from '@/components/BidFormModal';
import ChatInterface from '@/components/chat/ChatInterface';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string[];
  budget: number;
  budgetMax?: number;
  location: string;
  startDate: string;
  postedBy: string;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  createdAt: any;
  expectedDuration?: string;
  rated?: boolean;
}

interface Bid {
  id: string;
  contractorId: string;
  priceQuoted: number;
  timeline: string;
  message: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  createdAt: any;
  contractorName?: string;
  contractorEmail?: string;
  contractorPhone?: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentUser, userProfile } = useAuth();
  const { isProjectBookmarked, toggleProjectBookmark } = useBookmarks();
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUser?.uid === project?.postedBy;
  const isContractor = userProfile?.userType === 'contractor';
  const acceptedBid = bids.find(bid => bid.status === 'accepted');

  useEffect(() => {
    if (projectId) {
      fetchProjectAndBids();
    }
  }, [projectId]);

  const fetchProjectAndBids = async () => {
    if (!projectId) return;

    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
        
        const bidsQuery = query(
          collection(db, 'bids'),
          where('projectId', '==', projectId)
        );
        const bidsSnapshot = await getDocs(bidsQuery);
        const bidsData = bidsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Bid[];

        const bidsWithContractorInfo = await Promise.all(
          bidsData.map(async (bid) => {
            const contractorDoc = await getDoc(doc(db, 'users', bid.contractorId));
            if (contractorDoc.exists()) {
              const contractorData = contractorDoc.data();
              return {
                ...bid,
                contractorName: contractorData.fullName || 'Unknown Contractor',
                contractorEmail: contractorData.email,
                contractorPhone: contractorData.mobile,
              };
            }
            return bid;
          })
        );

        setBids(bidsWithContractorInfo);
      } else {
        setError('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleMarkCompleted = async () => {
    if (!project || !projectId) return;

    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: 'completed',
        completedAt: serverTimestamp()
      });

      setProject({ ...project, status: 'completed' });

      // Show rating modal if there's an accepted contractor
      if (acceptedBid) {
        setSelectedContractor({
          id: acceptedBid.contractorId,
          name: acceptedBid.contractorName || 'Contractor'
        });
        setShowRatingModal(true);
      }
    } catch (error) {
      console.error('Error marking project completed:', error);
    }
  };

  const handleContactContractor = async (contractorId: string, contractorName: string) => {
    if (!currentUser || !userProfile || !project) return;

    try {
      await addDoc(collection(db, 'chats'), {
        projectId: project.id,
        senderId: currentUser.uid,
        senderName: userProfile.fullName,
        senderType: userProfile.userType,
        recipientId: contractorId,
        recipientName: contractorName,
        recipientType: 'contractor',
        participants: [currentUser.uid, contractorId],
        message: `Hi ${contractorName}, I'm interested in discussing the project "${project.title}". Please let me know if you'd like to chat about the details.`,
        timestamp: serverTimestamp(),
        read: false
      });

      setSelectedContractor({ id: contractorId, name: contractorName });
      setShowChatModal(true);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleContactCustomer = async () => {
    if (!currentUser || !userProfile || !project) return;

    try {
      const customerDoc = await getDoc(doc(db, 'users', project.postedBy));
      if (!customerDoc.exists()) return;

      const customerData = customerDoc.data();
      
      await addDoc(collection(db, 'chats'), {
        projectId: project.id,
        senderId: currentUser.uid,
        senderName: userProfile.fullName,
        senderType: userProfile.userType,
        recipientId: project.postedBy,
        recipientName: customerData.fullName,
        recipientType: 'customer',
        participants: [currentUser.uid, project.postedBy],
        message: `Hello, I'm interested in your project "${project.title}". I'd like to discuss the requirements and my proposal.`,
        timestamp: serverTimestamp(),
        read: false
      });

      setSelectedContractor({ id: project.postedBy, name: customerData.fullName });
      setShowChatModal(true);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div>Loading project details...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 px-4 max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error || 'Project not found'}
              </h3>
              <Button asChild>
                <Link to="/projects">Back to Projects</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                      {currentUser && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleProjectBookmark(project.id)}
                          className="ml-2"
                        >
                          <Heart
                            className={`h-6 w-6 ${
                              isProjectBookmarked(project.id)
                                ? 'fill-blue-600 text-blue-600'
                                : 'text-gray-400'
                            }`}
                          />
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.category.map((cat, index) => (
                        <Badge key={index} variant="secondary">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge
                    variant={
                      project.status === 'open'
                        ? 'default'
                        : project.status === 'in_progress'
                        ? 'secondary'
                        : project.status === 'completed'
                        ? 'default'
                        : 'destructive'
                    }
                    className={
                      project.status === 'completed' 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : ''
                    }
                  >
                    {project.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-semibold text-green-600">
                        {formatBudget(project.budget)}
                        {project.budgetMax && project.budgetMax !== project.budget && 
                          ` - ${formatBudget(project.budgetMax)}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{project.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{formatDate(project.startDate)}</p>
                    </div>
                  </div>
                  
                  {project.expectedDuration && (
                    <div>
                      <p className="text-sm text-gray-500">Expected Duration</p>
                      <p className="font-medium">{project.expectedDuration}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Project Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>

                {/* Owner Actions */}
                {isOwner && project.status === 'in_progress' && acceptedBid && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleMarkCompleted}
                      className="w-full"
                      size="lg"
                    >
                      ✅ Mark Project as Completed
                    </Button>
                  </div>
                )}

                {/* Contractor Actions */}
                {isContractor && !isOwner && project.status === 'open' && (
                  <div className="pt-4 border-t space-y-3">
                    <Button 
                      onClick={() => setShowBidModal(true)}
                      className="w-full"
                      size="lg"
                    >
                      📩 Place Your Bid
                    </Button>
                    
                    <Button 
                      onClick={handleContactCustomer}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Customer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bids Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Bids Received
                  <Badge variant="outline">{bids.length}</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {bids.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No bids received yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div key={bid.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {bid.contractorName?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{bid.contractorName}</h4>
                              <Badge variant={bid.status === 'pending' ? 'secondary' : 'default'}>
                                {bid.status}
                              </Badge>
                            </div>
                            
                            <div className="text-sm space-y-1">
                              <p><strong>Quote:</strong> {formatBudget(bid.priceQuoted)}</p>
                              <p><strong>Timeline:</strong> {bid.timeline}</p>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-2">{bid.message}</p>
                            
                            {isOwner && (
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="outline">
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleContactContractor(bid.contractorId, bid.contractorName || 'Contractor')}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {isContractor && !isOwner && (
        <BidFormModal 
          open={showBidModal}
          onOpenChange={setShowBidModal}
          project={project}
        />
      )}

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat</DialogTitle>
          </DialogHeader>
          {selectedContractor && project && (
            <ChatInterface
              projectId={project.id}
              projectTitle={project.title}
              recipientId={selectedContractor.id}
              recipientName={selectedContractor.name}
              recipientType={isContractor ? 'customer' : 'contractor'}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      {selectedContractor && (
        <RatingModal
          open={showRatingModal}
          onOpenChange={setShowRatingModal}
          contractorId={selectedContractor.id}
          contractorName={selectedContractor.name}
          projectId={projectId || ''}
          projectTitle={project.title}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
