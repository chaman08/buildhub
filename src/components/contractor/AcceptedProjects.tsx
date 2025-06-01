
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, Calendar, DollarSign, CheckCircle, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AcceptedProject {
  id: string;
  bidId: string;
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  quotedPrice: number;
  timeline: string;
  startDate: string;
  location: string;
  status: 'accepted' | 'in_progress' | 'completed';
  acceptedAt: any;
}

const AcceptedProjects: React.FC = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<AcceptedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchAcceptedProjects();
    }
  }, [currentUser]);

  const fetchAcceptedProjects = async () => {
    if (!currentUser) return;

    try {
      console.log('Fetching accepted projects...');
      
      // Get accepted bids
      const bidsQuery = query(
        collection(db, 'bids'),
        where('contractorId', '==', currentUser.uid),
        where('status', '==', 'accepted')
      );
      
      const bidsSnapshot = await getDocs(bidsQuery);
      const acceptedProjectsData = await Promise.all(
        bidsSnapshot.docs.map(async (bidDoc) => {
          const bidData = bidDoc.data();
          
          try {
            // Fetch project details
            const projectDoc = await getDoc(doc(db, 'projects', bidData.projectId));
            const projectData = projectDoc.exists() ? projectDoc.data() : null;
            
            // Fetch client details
            const clientDoc = await getDoc(doc(db, 'users', projectData?.postedBy || ''));
            const clientData = clientDoc.exists() ? clientDoc.data() : null;
            
            return {
              id: bidDoc.id,
              bidId: bidDoc.id,
              projectId: bidData.projectId,
              projectTitle: projectData?.title || 'Unknown Project',
              projectDescription: projectData?.description || '',
              clientName: clientData?.fullName || 'Unknown Client',
              clientEmail: clientData?.email || '',
              clientPhone: clientData?.mobile || '',
              quotedPrice: bidData.priceQuoted,
              timeline: bidData.timeline,
              startDate: projectData?.startDate || '',
              location: projectData?.location || '',
              status: bidData.projectStatus || 'accepted',
              acceptedAt: bidData.updatedAt
            };
          } catch (error) {
            console.error('Error fetching project details:', error);
            return null;
          }
        })
      );
      
      const validProjects = acceptedProjectsData.filter(project => project !== null);
      console.log('Accepted projects fetched:', validProjects.length);
      setProjects(validProjects as AcceptedProject[]);
    } catch (error) {
      console.error('Error fetching accepted projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (project: AcceptedProject) => {
    try {
      const bidRef = doc(db, 'bids', project.bidId);
      await updateDoc(bidRef, {
        projectStatus: 'completed',
        completedAt: new Date()
      });
      
      // Update local state
      setProjects(prev => 
        prev.map(p => 
          p.id === project.id 
            ? { ...p, status: 'completed' as const }
            : p
        )
      );
      
      toast({
        title: "Project Marked as Completed",
        description: "The project has been marked as completed successfully.",
      });
    } catch (error) {
      console.error('Error marking project as completed:', error);
      toast({
        title: "Error",
        description: "Failed to mark project as completed. Please try again.",
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
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading your projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Accepted Projects</h2>
        <Badge variant="outline" className="text-sm">
          {projects.length} active projects
        </Badge>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Accepted Projects</h3>
              <p className="text-gray-500">Your accepted project bids will appear here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    {project.projectTitle}
                  </CardTitle>
                  <Badge className={getStatusColor(project.status)} variant="secondary">
                    {project.status === 'in_progress' ? 'In Progress' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {project.projectDescription}
                </p>

                {/* Project Details */}
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {formatBudget(project.quotedPrice)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Timeline: {project.timeline}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{project.location}</span>
                  </div>
                </div>

                {/* Client Information */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Client Information</h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {project.clientName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{project.clientName}</p>
                      <div className="flex gap-3 mt-1">
                        {project.clientPhone && (
                          <a 
                            href={`tel:${project.clientPhone}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                        {project.clientEmail && (
                          <a 
                            href={`mailto:${project.clientEmail}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(`/project/${project.projectId}`, '_blank')}
                  >
                    View Project
                  </Button>
                  
                  {project.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => markAsCompleted(project)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcceptedProjects;
