import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Edit, Calendar, DollarSign, CheckCircle, Clock, Star, AlertCircle, Trash2, Plus, Users, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface AcceptedProject {
  id: string;
  projectId: string;
  projectTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  priceQuoted: number;
  timeline: string;
  status: 'accepted' | 'in_progress' | 'completed';
  startDate?: string;
  completionDate?: string;
  notes?: string;
}

interface ContractorProject {
  id: string;
  title: string;
  description: string;
  category: string;
  priceRange: {
    min: number;
    max: number;
  };
  location: string;
  serviceType: 'fixed' | 'hourly';
  availability: string;
  experience: string;
  portfolio: string[];
  contactInfo: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  status: 'active' | 'paused' | 'completed';
  postedBy: string;
  createdAt: any;
  updatedAt: any;
  views?: number;
  inquiries?: number;
}

interface ProjectBid {
  id: string;
  projectId: string;
  contractorId: string;
  contractorName: string;
  contractorEmail: string;
  contractorPhone: string;
  priceQuoted: number;
  timeline: string;
  proposal: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

const AcceptedProjects: React.FC = () => {
  const { currentUser } = useAuth();
  const [acceptedProjects, setAcceptedProjects] = useState<AcceptedProject[]>([]);
  const [contractorProjects, setContractorProjects] = useState<ContractorProject[]>([]);
  const [projectBids, setProjectBids] = useState<{[projectId: string]: ProjectBid[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<ContractorProject | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProjectForBids, setSelectedProjectForBids] = useState<ContractorProject | null>(null);
  const [showBidsDialog, setShowBidsDialog] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  const fetchProjects = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch accepted projects (from bids)
      const acceptedBidsQuery = query(
        collection(db, 'bids'),
        where('contractorId', '==', currentUser.uid),
        where('status', '==', 'accepted'),
        orderBy('createdAt', 'desc')
      );
      
      const acceptedSnapshot = await getDocs(acceptedBidsQuery);
      const acceptedData = acceptedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AcceptedProject[];

      // Fetch contractor posted projects
      const contractorProjectsQuery = query(
        collection(db, 'contractor_projects'),
        where('postedBy', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const contractorSnapshot = await getDocs(contractorProjectsQuery);
      const contractorData = contractorSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContractorProject[];

      // Fetch bids for each contractor project
      const bidsData: {[projectId: string]: ProjectBid[]} = {};
      for (const project of contractorData) {
        const bidsQuery = query(
          collection(db, 'bids'),
          where('projectId', '==', project.id),
          orderBy('createdAt', 'desc')
        );
        
        const bidsSnapshot = await getDocs(bidsQuery);
        bidsData[project.id] = bidsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProjectBid[];
      }

      setAcceptedProjects(acceptedData);
      setContractorProjects(contractorData);
      setProjectBids(bidsData);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditContractorProject = (project: ContractorProject) => {
    setEditingProject(project);
    setShowEditDialog(true);
  };

  const handleUpdateContractorProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updatedData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        priceRange: {
          min: Number(formData.get('priceMin')),
          max: Number(formData.get('priceMax'))
        },
        location: formData.get('location') as string,
        serviceType: formData.get('serviceType') as 'fixed' | 'hourly',
        availability: formData.get('availability') as string,
        experience: formData.get('experience') as string,
        status: formData.get('status') as 'active' | 'paused' | 'completed',
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'contractor_projects', editingProject.id), updatedData);
      
      setContractorProjects(contractorProjects.map(p => 
        p.id === editingProject.id ? { ...p, ...updatedData } : p
      ));
      
      setShowEditDialog(false);
      setEditingProject(null);
      
      toast({
        title: "Project Updated",
        description: "Your service project has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContractorProject = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'contractor_projects', projectId));
      setContractorProjects(contractorProjects.filter(p => p.id !== projectId));
      
      toast({
        title: "Project Deleted",
        description: "Your service project has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewBids = (project: ContractorProject) => {
    setSelectedProjectForBids(project);
    setShowBidsDialog(true);
  };

  const handleBidAction = async (bidId: string, action: 'accept' | 'reject') => {
    try {
      await updateDoc(doc(db, 'bids', bidId), {
        status: action === 'accept' ? 'accepted' : 'rejected',
        updatedAt: new Date()
      });

      // Update local state
      if (selectedProjectForBids) {
        const updatedBids = projectBids[selectedProjectForBids.id].map(bid =>
          bid.id === bidId ? { ...bid, status: action === 'accept' ? 'accepted' : 'rejected' } : bid
        );
        setProjectBids({
          ...projectBids,
          [selectedProjectForBids.id]: updatedBids
        });
      }

      toast({
        title: action === 'accept' ? "Bid Accepted" : "Bid Rejected",
        description: `The bid has been ${action}ed successfully.`
      });
    } catch (error) {
      console.error('Error updating bid:', error);
      toast({
        title: "Error",
        description: "Failed to update bid. Please try again.",
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN');
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'accepted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Clock className="h-4 w-4" />;
      case 'completed': return <Star className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p>Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-700 mb-2">Error Loading Projects</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProjects}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            {acceptedProjects.length} accepted contracts
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {contractorProjects.filter(p => p.status === 'active').length} active services
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="accepted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accepted">Accepted Contracts</TabsTrigger>
          <TabsTrigger value="services">My Services</TabsTrigger>
        </TabsList>

        <TabsContent value="accepted" className="space-y-6">
          {acceptedProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Accepted Projects</h3>
                  <p className="text-gray-500">You haven't won any contracts yet. Keep bidding on tenders!</p>
                  <Button onClick={() => window.location.hash = '#tenders'}>
                    Browse Tenders
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Accepted Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Timeline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acceptedProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="font-medium">{project.projectTitle}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{project.customerName}</div>
                            <div className="text-sm text-gray-500">{project.customerEmail}</div>
                            {project.customerPhone && (
                              <div className="text-sm text-gray-500">{project.customerPhone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {formatBudget(project.priceQuoted)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {project.timeline}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(project.status)} variant="outline">
                            {getStatusIcon(project.status)}
                            <span className="ml-1">{project.status.replace('_', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/project/${project.projectId}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {project.customerPhone && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`tel:${project.customerPhone}`)}
                              >
                                📞
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
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">My Posted Services</h3>
            <Button onClick={() => window.location.hash = '#home'}>
              <Plus className="h-4 w-4 mr-2" />
              Post New Service
            </Button>
          </div>

          {contractorProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Services Posted</h3>
                  <p className="text-gray-500">Start advertising your services to get more clients.</p>
                  <Button onClick={() => window.location.hash = '#home'}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractorProjects.map((project) => {
                      const bids = projectBids[project.id] || [];
                      const pendingBids = bids.filter(bid => bid.status === 'pending').length;
                      
                      return (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{project.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {project.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{project.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600">
                              {formatBudget(project.priceRange.min)} - {formatBudget(project.priceRange.max)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(project.status)} variant="outline">
                              {getStatusIcon(project.status)}
                              <span className="ml-1">{project.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              <div>Views: {project.views || 0}</div>
                              <div>Total Bids: {bids.length}</div>
                              {pendingBids > 0 && (
                                <div className="text-orange-600 font-medium">
                                  {pendingBids} pending
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(`/contractor-services`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewBids(project)}
                                className={pendingBids > 0 ? 'border-orange-500 text-orange-600' : ''}
                              >
                                <Users className="h-4 w-4" />
                                {bids.length > 0 && <span className="ml-1">{bids.length}</span>}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditContractorProject(project)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteContractorProject(project.id, project.title)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Service Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <form onSubmit={handleUpdateContractorProject} className="space-y-4">
              <div>
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingProject.title}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingProject.description}
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingProject.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Carpentry">Carpentry</SelectItem>
                      <SelectItem value="Painting">Painting</SelectItem>
                      <SelectItem value="Renovation">Renovation</SelectItem>
                      <SelectItem value="Landscaping">Landscaping</SelectItem>
                      <SelectItem value="Interior Design">Interior Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingProject.location}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priceMin">Min Price (₹)</Label>
                  <Input
                    id="priceMin"
                    name="priceMin"
                    type="number"
                    defaultValue={editingProject.priceRange.min}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priceMax">Max Price (₹)</Label>
                  <Input
                    id="priceMax"
                    name="priceMax"
                    type="number"
                    defaultValue={editingProject.priceRange.max}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select name="serviceType" defaultValue={editingProject.serviceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingProject.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    name="availability"
                    defaultValue={editingProject.availability}
                    placeholder="e.g., Mon-Fri 9AM-6PM"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    defaultValue={editingProject.experience}
                    placeholder="e.g., 5+ years"
                  />
                </div>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">Update Service</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Bids Dialog */}
      <Dialog open={showBidsDialog} onOpenChange={setShowBidsDialog}>
        <DialogContent className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bids for "{selectedProjectForBids?.title}"
            </DialogTitle>
          </DialogHeader>
          
          {selectedProjectForBids && (
            <div className="space-y-4">
              {projectBids[selectedProjectForBids.id]?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Bids Yet</h3>
                  <p className="text-gray-500">No one has bid on this project yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projectBids[selectedProjectForBids.id]?.map((bid) => (
                    <Card key={bid.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{bid.contractorName}</h4>
                            <p className="text-sm text-gray-500">{bid.contractorEmail}</p>
                            <p className="text-sm text-gray-500">{bid.contractorPhone}</p>
                          </div>
                          <Badge className={getStatusColor(bid.status)} variant="outline">
                            {getStatusIcon(bid.status)}
                            <span className="ml-1">{bid.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              {formatBudget(bid.priceQuoted)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Timeline: {bid.timeline}</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Proposal:</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {bid.proposal}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Submitted: {formatDate(bid.createdAt)}
                          </span>
                          
                          {bid.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleBidAction(bid.id, 'accept')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBidAction(bid.id, 'reject')}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcceptedProjects;
