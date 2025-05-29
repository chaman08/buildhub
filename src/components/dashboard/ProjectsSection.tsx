
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react';
import PostProjectDialog from './PostProjectDialog';

const ProjectsSection: React.FC = () => {
  const [showPostDialog, setShowPostDialog] = useState(false);
  
  // Mock data - will be replaced with real data from Firestore
  const projects = [
    {
      id: '1',
      title: 'Residential House Construction',
      type: 'Residential',
      location: 'Mumbai, Maharashtra',
      budget: '₹15,00,000',
      status: 'Open',
      bidsCount: 5,
      postedDate: '2024-01-15',
      description: 'Need to construct a 2BHK house...'
    },
    {
      id: '2',
      title: 'Office Interior Renovation',
      type: 'Commercial',
      location: 'Pune, Maharashtra',
      budget: '₹8,00,000',
      status: 'In Progress',
      bidsCount: 8,
      postedDate: '2024-01-10',
      description: 'Complete interior renovation of office space...'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                      <Badge variant="outline">{project.type}</Badge>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
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
                    Budget: {project.budget}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    Posted: {new Date(project.postedDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm font-medium text-blue-600">
                    {project.bidsCount} bids received
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
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
      />
    </div>
  );
};

export default ProjectsSection;
