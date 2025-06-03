import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import PostProjectDialog from './PostProjectDialog';
import { toast } from '@/hooks/use-toast';

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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditDialog(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updatedData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        budget: Number(formData.get('budget')),
        location: formData.get('location') as string,
        startDate: formData.get('startDate') as string,
        expectedDuration: formData.get('expectedDuration') as string,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'projects', editingProject.id), updatedData);
      
      // Update local state
      setProjects(projects.map(p => 
        p.id === editingProject.id ? { ...p, ...updatedData } : p
      ));
      
      setShowEditDialog(false);
      setEditingProject(null);
      
      toast({
        title: "Project Updated",
        description: "Your project has been updated successfully."
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

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setProjects(projects.filter(p => p.id !== projectId));
      
      toast({
        title: "Project Deleted",
        description: "Your project has been deleted successfully."
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
    return <div className="p-4">Loading your projects...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">My Projects</h2>
        <Button onClick={() => setShowPostDialog(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Post New Project</span>
          <span className="xs:hidden">New Project</span>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 px-4">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 md:h-16 md:w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900">No Projects Yet</h3>
              <p className="text-sm text-gray-500 max-w-sm">Post your first project to start receiving bids from contractors.</p>
              <Button onClick={() => setShowPostDialog(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg line-clamp-2 pr-2">{project.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
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
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(project.status)} whitespace-nowrap text-xs`}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 pt-0">
                <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                    <DollarSign className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="truncate">Budget: {formatBudget(project.budget, project.budgetMax)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    <span className="truncate">Start: {new Date(project.startDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t">
                  <Button 
                    variant="link" 
                    className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-700 p-0 h-auto justify-start"
                    onClick={() => {
                      // Navigate to bids section with project filter
                      window.location.hash = `#bids?projectId=${project.id}`;
                    }}
                  >
                    View bids received
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
                      <a href={`/project/${project.id}`}>
                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 px-2"
                      onClick={() => handleDeleteProject(project.id, project.title)}
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
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

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
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
                  <Label htmlFor="budget">Budget (₹)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    defaultValue={editingProject.budget}
                    required
                  />
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
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={editingProject.startDate}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expectedDuration">Expected Duration</Label>
                  <Input
                    id="expectedDuration"
                    name="expectedDuration"
                    defaultValue={editingProject.expectedDuration || ''}
                    placeholder="e.g., 3 months"
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
                <Button type="submit" className="w-full sm:w-auto">Update Project</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsSection;
