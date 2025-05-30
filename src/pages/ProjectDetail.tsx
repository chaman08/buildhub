
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, DollarSign, ArrowLeft, Phone, Mail, MessageCircle } from 'lucide-react';
import BidFormModal from '@/components/BidFormModal';

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
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUser?.uid === project?.postedBy;
  const isContractor = userProfile?.userType === 'contractor';

  useEffect(() => {
    if (projectId) {
      fetchProjectAndBids();
    }
  }, [projectId]);

  const fetchProjectAndBids = async () => {
    if (!projectId) return;

    try {
      // Fetch project details
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
        
        // Fetch bids for this project
        const bidsQuery = query(
          collection(db, 'bids'),
          where('projectId', '==', projectId)
        );
        const bidsSnapshot = await getDocs(bidsQuery);
        const bidsData = bidsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Bid[];

        // Fetch contractor details for each bid
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
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">{project.title}</CardTitle>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
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
                  <p className="text-sm text-gray-500 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {project.category.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Project Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>

                {isContractor && !isOwner && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => setShowBidModal(true)}
                      className="w-full"
                      size="lg"
                    >
                      📩 Place Your Bid
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
                                <Button size="sm" variant="outline">
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

      <BidFormModal 
        open={showBidModal}
        onOpenChange={setShowBidModal}
        project={project}
      />
    </div>
  );
};

export default ProjectDetail;
