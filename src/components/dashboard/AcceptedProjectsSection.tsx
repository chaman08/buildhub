
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, MessageCircle, Calendar, DollarSign, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AcceptedProject {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  acceptedContractorId: string;
  contractorName: string;
  contractorEmail: string;
  contractorPhone: string;
  acceptedBidAmount: number;
  timeline: string;
  status: 'in_progress' | 'completed';
}

const AcceptedProjectsSection: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [acceptedProjects, setAcceptedProjects] = useState<AcceptedProject[]>([]);
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
      
      // Get projects that are in progress or completed
      const projectsQuery = query(
        collection(db, 'projects'),
        where('postedBy', '==', currentUser.uid),
        where('status', 'in', ['in_progress', 'completed'])
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      
      const projectsData = await Promise.all(
        projectsSnapshot.docs.map(async (projectDoc) => {
          const projectData = projectDoc.data();
          
          if (!projectData.acceptedContractorId || !projectData.acceptedBidId) {
            return null;
          }
          
          try {
            // Fetch contractor details
            const contractorDoc = await getDoc(doc(db, 'users', projectData.acceptedContractorId));
            const contractorData = contractorDoc.exists() ? contractorDoc.data() : null;
            
            // Fetch accepted bid details
            const bidDoc = await getDoc(doc(db, 'bids', projectData.acceptedBidId));
            const bidData = bidDoc.exists() ? bidDoc.data() : null;
            
            return {
              id: projectDoc.id,
              title: projectData.title,
              description: projectData.description,
              location: projectData.location,
              startDate: projectData.startDate,
              acceptedContractorId: projectData.acceptedContractorId,
              contractorName: contractorData?.fullName || 'Unknown Contractor',
              contractorEmail: contractorData?.email || '',
              contractorPhone: contractorData?.mobile || '',
              acceptedBidAmount: bidData?.priceQuoted || 0,
              timeline: bidData?.timeline || 'N/A',
              status: projectData.status
            };
          } catch (error) {
            console.error('Error fetching project details:', error);
            return null;
          }
        })
      );
      
      const validProjects = projectsData.filter(project => project !== null) as AcceptedProject[];
      console.log('Accepted projects fetched:', validProjects.length);
      setAcceptedProjects(validProjects);
    } catch (error) {
      console.error('Error fetching accepted projects:', error);
    } finally {
      setLoading(false);
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
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEmailContractor = (email: string, projectTitle: string) => {
    const subject = encodeURIComponent(`Regarding Project: ${projectTitle}`);
    const body = encodeURIComponent(`Hello,\n\nI would like to discuss the project "${projectTitle}".\n\nBest regards`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleChatWithContractor = (contractorId: string, projectId: string) => {
    // Navigate to messages page with contractor context
    navigate('/messages', { 
      state: { 
        recipientId: contractorId, 
        projectId: projectId 
      } 
    });
  };

  if (loading) {
    return <div>Loading your accepted projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Ongoing Projects</h2>
        <Badge variant="outline" className="text-sm">
          {acceptedProjects.length} active projects
        </Badge>
      </div>

      {acceptedProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Ongoing Projects</h3>
              <p className="text-gray-500">Your accepted projects will appear here once you approve contractor bids.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {acceptedProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    {project.title}
                  </CardTitle>
                  <Badge className={getStatusColor(project.status)} variant="secondary">
                    {project.status === 'in_progress' ? 'In Progress' : 'Completed'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {project.description}
                </p>

                {/* Project Details */}
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {formatBudget(project.acceptedBidAmount)}
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

                {/* Contractor Information */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="font-medium text-sm mb-2 text-green-800">👷 Assigned Contractor</h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-green-100">
                        {project.contractorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{project.contractorName}</p>
                      <div className="text-xs text-gray-600 mt-1">
                        <p>📧 {project.contractorEmail}</p>
                        <p>📞 {project.contractorPhone}</p>
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
                    onClick={() => window.open(`/project/${project.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Project
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEmailContractor(project.contractorEmail, project.title)}
                    title="Send Email"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleChatWithContractor(project.acceptedContractorId, project.id)}
                    title="Start Chat"
                  >
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

export default AcceptedProjectsSection;
