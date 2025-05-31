import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react';
import PostProjectDialog from './PostProjectDialog';
import { toast } from '@/components/ui/use-toast';

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

const ProjectsSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchUserProjects();
    }
  }, [currentUser]);

  const fetchUserProjects = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      console.log('Fetching projects for user:', currentUser.uid);
      
      const projectsQuery = query(
        collection(db, 'projects'),
        where('postedBy', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(projectsQuery);
      console.log('Projects found:', snapshot.size);
      
      const projectData = snapshot.docs.map(doc => {
        const data = doc.data();
        const projectData = {
          id: doc.id,
          ...data,
          postedBy: data.postedBy || currentUser.uid
        };
        console.log('Project data:', projectData);
        return projectData;
      }) as Project[];
      
      setProjects(projectData);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      toast({
        title: "Error Loading Projects",
        description: "Failed to load your projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (amount: number, maxAmount?: number) => {
    const formatAmount = (amt: number) => {
      if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(1)} Cr`;
      if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)} L`;
      return `₹${amt.toLocaleString('en-IN')}`;
    };

    if (maxAmount && maxAmount !== amount) {
      return `${formatAmount(amount)} - ${formatAmount(maxAmount)}`;
    }
    return formatAmount(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading your projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
        <Button onClick={() => setShowPostDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Post New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Projects Yet</h3>
              <p className="text-gray-500">Post your first project to start receiving bids from contractors.</p>
              <Button onClick={() => setShowPostDialog(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex flex-wrap gap-1">
                        {project.category.slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {project.category.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.category.length - 2}
                          </Badge>
                        )}
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DollarSign className="h-4 w-4" />
                    Budget: {formatBudget(project.budget, project.budgetMax)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    Start: {new Date(project.startDate).toLocaleDateString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm font-medium text-blue-600">
                    View bids received
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/project/${project.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PostProjectDialog 
        open={showPostDialog}
        onOpenChange={setShowPostDialog}
        onProjectPosted={fetchUserProjects}
      />
    </div>
  );
};

export default ProjectsSection;
