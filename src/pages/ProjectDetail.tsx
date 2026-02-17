import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useBookmarks } from '@/contexts/BookmarkContext';
import Header from '@/components/Header';
import RatingModal from '@/components/RatingModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, DollarSign, ArrowLeft, Phone, Mail, MessageCircle, Star, Heart, ShieldCheck, ListChecks, Handshake, File } from 'lucide-react';
import { Input } from '@/components/ui/input';
import BidFormModal from '@/components/BidFormModal';
import ChatInterface from '@/components/chat/ChatInterface';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { buildTrustBadges, evaluateTrustGate } from '@/utils/trust';

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
  contractorVerified?: boolean;
  contractorVerificationBadge?: boolean;
  contractorKycStatus?: 'not_started' | 'pending' | 'under_review' | 'needs_info' | 'verified' | 'rejected';
  contractorProfileComplete?: boolean;
  contractorIsEmailVerified?: boolean;
  contractorIsPhoneVerified?: boolean;
}

interface HandoffMilestone {
  id: string;
  title: string;
  dueDate?: string;
  amount?: number;
  status: 'proposed' | 'agreed' | 'done';
}

interface ProjectHandoff {
  projectId: string;
  milestones: HandoffMilestone[];
  escrow: {
    enabled: boolean;
    ownerConfirmed: boolean;
    contractorConfirmed: boolean;
  };
  kickoff: {
    owner: Record<string, boolean>;
    contractor: Record<string, boolean>;
  };
  updatedAt?: any;
  updatedBy?: string | null;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const { isProjectBookmarked, toggleProjectBookmark } = useBookmarks();
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<ProjectHandoff | null>(null);
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [handoffSaving, setHandoffSaving] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '', amount: '' });

  const isOwner = currentUser?.uid === project?.postedBy;
  const isContractor = userProfile?.userType === 'contractor';
  const acceptedBid = bids.find(bid => bid.status === 'accepted');
  const isAcceptedContractor = !!(acceptedBid && currentUser?.uid === acceptedBid.contractorId);

  const ownerKickoffItems = [
    { id: 'scope', label: 'Scope, drawings, exclusions locked' },
    { id: 'milestones', label: 'Milestones and payment plan shared' },
    { id: 'payment', label: 'Escrow/deposit funded' },
    { id: 'access', label: 'Site access, permits, safety rules' },
  ];

  const contractorKickoffItems = [
    { id: 'mobilization', label: 'Crew + materials ready' },
    { id: 'communication', label: 'Comms cadence + channel set' },
    { id: 'safety', label: 'Safety plan + insurance confirmed' },
    { id: 'handoff', label: 'Mobilization date agreed' },
  ];

  const defaultHandoff = (id: string): ProjectHandoff => ({
    projectId: id,
    milestones: [],
    escrow: {
      enabled: false,
      ownerConfirmed: false,
      contractorConfirmed: false
    },
    kickoff: {
      owner: {
        scope: false,
        milestones: false,
        payment: false,
        access: false
      },
      contractor: {
        mobilization: false,
        communication: false,
        safety: false,
        handoff: false
      }
    }
  });

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
                contractorVerified: contractorData.verified || contractorData.verificationBadge,
                contractorVerificationBadge: contractorData.verificationBadge,
                contractorKycStatus: contractorData.kycStatus,
                contractorProfileComplete: contractorData.profileComplete,
                contractorIsEmailVerified: contractorData.isEmailVerified,
                contractorIsPhoneVerified: contractorData.isPhoneVerified,
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

  const mergeHandoffData = (data: any, id: string): ProjectHandoff => {
    const base = defaultHandoff(id);
    return {
      ...base,
      ...(data || {}),
      milestones: Array.isArray(data?.milestones) ? data.milestones : base.milestones,
      escrow: { ...base.escrow, ...(data?.escrow || {}) },
      kickoff: {
        owner: { ...base.kickoff.owner, ...(data?.kickoff?.owner || {}) },
        contractor: { ...base.kickoff.contractor, ...(data?.kickoff?.contractor || {}) },
      },
      updatedAt: data?.updatedAt,
      updatedBy: data?.updatedBy
    };
  };

  const fetchHandoff = async (id: string) => {
    setHandoffLoading(true);
    try {
      const handoffDoc = await getDoc(doc(db, 'projectHandoffs', id));
      if (handoffDoc.exists()) {
        setHandoff(mergeHandoffData(handoffDoc.data(), id));
      } else {
        setHandoff(defaultHandoff(id));
      }
    } catch (error) {
      console.error('Error loading handoff data:', error);
    } finally {
      setHandoffLoading(false);
    }
  };

  useEffect(() => {
    if (project?.id && bids.some((bid) => bid.status === 'accepted')) {
      fetchHandoff(project.id);
    }
  }, [project?.id, bids]);

  const persistHandoff = async (next: ProjectHandoff) => {
    if (!project || !currentUser) return;

    try {
      setHandoffSaving(true);

      // Construct the clean data object to match Firestore security rules
      const handoffData = {
        projectId: project.id,
        milestones: (next.milestones || []).map(m => ({
          id: m.id,
          title: m.title,
          status: m.status,
          ...(m.dueDate ? { dueDate: m.dueDate } : {}),
          ...(typeof m.amount === 'number' ? { amount: m.amount } : {})
        })),
        escrow: {
          enabled: !!next.escrow?.enabled,
          ownerConfirmed: !!next.escrow?.ownerConfirmed,
          contractorConfirmed: !!next.escrow?.contractorConfirmed
        },
        kickoff: {
          owner: next.kickoff?.owner || {},
          contractor: next.kickoff?.contractor || {}
        },
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      };

      console.log('Saving handoff data:', handoffData);

      await setDoc(
        doc(db, 'projectHandoffs', project.id),
        handoffData,
        { merge: true }
      );

      setHandoff(next);
      toast({
        title: "Progress saved",
        description: "Project handoff details updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving handoff:', error);

      let errorMessage = "Failed to update handoff details.";
      if (error?.code === 'permission-denied') {
        errorMessage = "Permission denied. Please ensure you are the project owner or the accepted contractor, and that the bid has been officially accepted.";
      }

      toast({
        title: "Error saving",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setHandoffSaving(false);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || (!isOwner && !isAcceptedContractor)) return;

    const title = newMilestone.title.trim();
    const amountValue = newMilestone.amount ? Number(newMilestone.amount) : undefined;
    if (!title) return;
    if (amountValue !== undefined && (Number.isNaN(amountValue) || amountValue < 0)) {
      return;
    }

    const base = handoff ?? defaultHandoff(project.id);
    const nextMilestone: HandoffMilestone = {
      id: `${Date.now()}`,
      title,
      dueDate: newMilestone.dueDate || undefined,
      amount: amountValue,
      status: 'proposed'
    };

    const next = { ...base, milestones: [...base.milestones, nextMilestone] };
    await persistHandoff(next);
    setNewMilestone({ title: '', dueDate: '', amount: '' });
  };

  const nextMilestoneStatus = (status: HandoffMilestone['status']) => {
    switch (status) {
      case 'proposed':
        return 'agreed';
      case 'agreed':
        return 'done';
      default:
        return 'done';
    }
  };

  const handleUpdateMilestoneStatus = async (id: string) => {
    if (!project || (!isOwner && !isAcceptedContractor) || !handoff) return;
    const next: ProjectHandoff = {
      ...handoff,
      milestones: handoff.milestones.map((m) =>
        m.id === id ? { ...m, status: nextMilestoneStatus(m.status) } : m
      )
    };
    await persistHandoff(next);
  };

  const handleEscrowToggle = async (key: 'enabled' | 'ownerConfirmed' | 'contractorConfirmed') => {
    if (!project || (!isOwner && !isAcceptedContractor)) return;
    const base = handoff ?? defaultHandoff(project.id);
    const next = {
      ...base,
      escrow: {
        ...base.escrow,
        [key]: !base.escrow[key]
      }
    };
    await persistHandoff(next);
  };

  const canEditKickoff = (role: 'owner' | 'contractor') =>
    role === 'owner' ? isOwner : !!isAcceptedContractor;

  const handleToggleKickoff = async (role: 'owner' | 'contractor', item: string) => {
    if (!project || !canEditKickoff(role)) return;
    const base = handoff ?? defaultHandoff(project.id);
    const currentValue = base.kickoff[role][item];
    const next = {
      ...base,
      kickoff: {
        ...base.kickoff,
        [role]: {
          ...base.kickoff[role],
          [item]: !currentValue
        }
      }
    };
    await persistHandoff(next);
  };

  const formatBudget = (amount: number) => {
    if (!amount || isNaN(amount)) return '₹0';
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

      setProject(prev => prev ? { ...prev, status: 'completed' } : prev);

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
    if (!currentUser || !userProfile || !project) {
      toast({
        title: 'Sign in required',
        description: 'Log in and complete your profile to message contractors.',
        variant: 'destructive'
      });
      return;
    }

    const gate = evaluateTrustGate(userProfile, 'message', { requireKyc: userProfile.userType === 'contractor' });
    if (!gate.allowed) {
      toast({
        title: 'Update your profile',
        description: gate.reason || 'Complete verification to start a chat.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const createChat = httpsCallable(functions, 'createChatMessage');
      await createChat({
        projectId: project.id,
        recipientId: contractorId,
        recipientName: contractorName,
        recipientType: 'contractor',
        message: `Hi ${contractorName}, I'm interested in discussing the project "${project.title}". Please let me know if you'd like to chat about the details.`,
        participants: [currentUser.uid, contractorId],
        attachments: []
      });

      setSelectedContractor({ id: contractorId, name: contractorName });
      setShowChatModal(true);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleContactCustomer = async () => {
    if (!currentUser || !userProfile || !project) {
      toast({
        title: 'Sign in required',
        description: 'Log in and complete your profile to message customers.',
        variant: 'destructive'
      });
      return;
    }

    const gate = evaluateTrustGate(userProfile, 'message', { requireKyc: userProfile.userType === 'contractor' });
    if (!gate.allowed) {
      toast({
        title: 'Update your profile',
        description: gate.reason || 'Complete verification to start a chat.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const customerDoc = await getDoc(doc(db, 'users', project.postedBy));
      if (!customerDoc.exists()) return;

      const customerData = customerDoc.data();

      const createChat = httpsCallable(functions, 'createChatMessage');
      await createChat({
        projectId: project.id,
        recipientId: project.postedBy,
        recipientName: customerData.fullName,
        recipientType: 'customer',
        participants: [currentUser.uid, project.postedBy],
        message: `Hello, I'm interested in your project "${project.title}". I'd like to discuss the requirements and my proposal.`,
        attachments: []
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
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <Card>
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
                            className={`h-6 w-6 ${isProjectBookmarked(project.id)
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white rounded-xl border border-gray-100 p-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Budget Range</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatBudget(project.budget)}
                        {project.budgetMax && project.budgetMax !== project.budget &&
                          ` - ${formatBudget(project.budgetMax)}`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</p>
                      <p className="text-lg font-semibold text-gray-900">{project.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 rounded-full">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(project.startDate)}</p>
                    </div>
                  </div>

                  {project.expectedDuration && (
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-50 rounded-full">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expected Duration</p>
                        <p className="text-lg font-semibold text-gray-900">{project.expectedDuration}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Project Description</h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{project.description}</p>
                  </div>
                </div>

                {/* Owner Actions */}
                {isOwner && project.status === 'in_progress' && acceptedBid && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleMarkCompleted}
                      className="w-full"
                      size="lg"
                    >
                      Mark Project as Completed
                    </Button>
                  </div>
                )}

                {/* Post-completion rating prompt */}
                {isOwner && project.status === 'completed' && acceptedBid && !project.rated && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        setSelectedContractor({
                          id: acceptedBid.contractorId,
                          name: acceptedBid.contractorName || 'Contractor'
                        });
                        setShowRatingModal(true);
                      }}
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      Rate {acceptedBid.contractorName || 'Contractor'}
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
                      Place Your Bid
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

            {/* Bids Section - Stacked under Description */}
            <Card className="shadow-sm border-gray-200">
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
                    {bids.map((bid) => {
                      const isAccepted = bid.status === 'accepted';
                      const trustBadges = buildTrustBadges({
                        verified: bid.contractorVerified,
                        verificationBadge: bid.contractorVerificationBadge,
                        kycStatus: bid.contractorKycStatus,
                        profileComplete: bid.contractorProfileComplete,
                        isEmailVerified: bid.contractorIsEmailVerified,
                        isPhoneVerified: bid.contractorIsPhoneVerified
                      }).slice(0, 3);

                      return (
                        <div
                          key={bid.id}
                          className={`group border rounded-xl p-5 transition-all hover:shadow-md ${isAccepted
                            ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-100'
                            : 'bg-white hover:border-gray-300'
                            }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                {bid.contractorName?.charAt(0) || 'C'}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                <div>
                                  <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                    {bid.contractorName}
                                  </h4>
                                  {trustBadges.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {trustBadges.map((badge) => (
                                        <Badge
                                          key={`${bid.id}-${badge.label}`}
                                          variant="outline"
                                          className={`${badge.className} text-[10px] h-5 px-1.5 border-none bg-opacity-10`}
                                        >
                                          {badge.label}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Badge
                                  variant={isAccepted ? 'default' : 'secondary'}
                                  className={isAccepted ? 'bg-blue-600' : ''}
                                >
                                  {bid.status.toUpperCase()}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tight">Bid Amount</p>
                                  <p className="font-bold text-green-700">{formatBudget(bid.priceQuoted)}</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tight">Timeline</p>
                                  <p className="font-bold text-gray-900">{bid.timeline}</p>
                                </div>
                              </div>

                              <div className="bg-white/50 rounded-lg p-3 border border-gray-100 mb-4">
                                <p className="text-sm text-gray-600 line-clamp-3 italic">"{bid.message}"</p>
                              </div>

                              {isOwner && (
                                <div className="flex flex-wrap gap-2">
                                  <Button size="sm" variant="outline" className="h-9 px-4 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                                    <Phone className="h-3.5 w-3.5 mr-2" />
                                    Call
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-9 px-4 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                                    <Mail className="h-3.5 w-3.5 mr-2" />
                                    Email
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleContactContractor(bid.contractorId, bid.contractorName || 'Contractor')}
                                    className="h-9 px-4 hover:bg-blue-600 hover:text-white transition-all bg-white"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5 mr-2" />
                                    Message
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Handoff & Milestones */}
            {acceptedBid && (
              <Card className="border-green-200 bg-white shadow-sm sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex flex-col gap-2">
                    <span className="flex items-center gap-2 text-green-700">
                      <Handshake className="h-5 w-5" />
                      Handoff & kickoff
                    </span>
                    <Badge variant="outline" className="text-[10px] font-normal text-green-700 border-green-200 bg-green-50 w-fit">
                      Contractor: {acceptedBid.contractorName || 'Contractor'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Milestones Subsection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-green-700" />
                        <p className="font-bold text-xs uppercase tracking-wider text-gray-500">Milestones</p>
                      </div>
                      {handoffSaving && (
                        <Badge variant="outline" className="text-[10px] animate-pulse">Saving...</Badge>
                      )}
                    </div>

                    {handoffLoading ? (
                      <p className="text-sm text-gray-600">Loading...</p>
                    ) : handoff?.milestones?.length ? (
                      <div className="space-y-3">
                        {handoff.milestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-2"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <p className="font-bold text-sm text-gray-900 leading-tight">{milestone.title}</p>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 h-5 ${milestone.status === 'done'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : milestone.status === 'agreed'
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  }`}
                              >
                                {milestone.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-gray-500">
                              <span>{milestone.dueDate ? `Due: ${milestone.dueDate}` : 'No date'}</span>
                              <span className="font-bold text-gray-700">{milestone.amount ? formatBudget(milestone.amount) : ''}</span>
                            </div>
                            {(isOwner || isAcceptedContractor) && milestone.status !== 'done' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-8 text-xs bg-white hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                onClick={() => handleUpdateMilestoneStatus(milestone.id)}
                                disabled={handoffSaving}
                              >
                                Mark {milestone.status === 'proposed' ? 'agreed' : 'done'}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-4 italic border border-dashed rounded-lg">No milestones added yet.</p>
                    )}

                    {(isOwner || isAcceptedContractor) && (
                      <form onSubmit={handleAddMilestone} className="space-y-3 pt-3 border-t">
                        <Input
                          value={newMilestone.title}
                          onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Milestone title..."
                          required
                          className="h-9 text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="date"
                            value={newMilestone.dueDate}
                            onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                            className="h-9 text-sm"
                          />
                          <Input
                            type="number"
                            value={newMilestone.amount}
                            onChange={(e) => setNewMilestone(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="Amount ₹"
                            className="h-9 text-sm"
                          />
                        </div>
                        <Button type="submit" disabled={handoffSaving} className="w-full h-9 text-sm">
                          Add Milestone
                        </Button>
                      </form>
                    )}
                  </div>

                  {/* Financial & Kickoff Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-700" />
                        <p className="font-bold text-xs uppercase tracking-wider text-gray-500">Financials</p>
                      </div>
                      <label className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${handoff?.escrow?.enabled ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'} cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={handoff?.escrow?.enabled || false}
                          onChange={() => handleEscrowToggle('enabled')}
                          disabled={!isOwner && !isAcceptedContractor}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-xs font-medium text-gray-700">Project requires Escrow / Payment schedule</span>
                      </label>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-blue-700" />
                        <p className="font-bold text-xs uppercase tracking-wider text-gray-500">Kickoff checklist</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Customer Actions</p>
                          <div className="space-y-1.5">
                            {ownerKickoffItems.map((item) => (
                              <label key={item.id} className={`flex items-start gap-2.5 p-2 rounded-md border text-[11px] ${handoff?.kickoff?.owner?.[item.id] ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'} ${!isOwner ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-blue-100'}`}>
                                <input
                                  type="checkbox"
                                  checked={handoff?.kickoff?.owner?.[item.id] || false}
                                  onChange={() => handleToggleKickoff('owner', item.id)}
                                  disabled={!isOwner}
                                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                                />
                                <span className="font-medium text-gray-700">{item.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Contractor Actions</p>
                          <div className="space-y-1.5">
                            {contractorKickoffItems.map((item) => (
                              <label key={item.id} className={`flex items-start gap-2.5 p-2 rounded-md border text-[11px] ${handoff?.kickoff?.contractor?.[item.id] ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'} ${!isAcceptedContractor ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-blue-100'}`}>
                                <input
                                  type="checkbox"
                                  checked={handoff?.kickoff?.contractor?.[item.id] || false}
                                  onChange={() => handleToggleKickoff('contractor', item.id)}
                                  disabled={!isAcceptedContractor}
                                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                                />
                                <span className="font-medium text-gray-700">{item.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
      {selectedContractor && project && (
        <RatingModal
          open={showRatingModal}
          onOpenChange={setShowRatingModal}
          contractorId={selectedContractor.id}
          contractorName={selectedContractor.name}
          projectId={projectId || ''}
          projectTitle={project.title}
          onSubmitted={() => {
            setProject(prev => prev ? { ...prev, rated: true } : prev);
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
