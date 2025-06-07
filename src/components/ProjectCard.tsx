import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, DollarSign, Bookmark, Eye, Clock } from 'lucide-react';
import BidFormModal from './BidFormModal';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCardProps {
  project: {
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
  };
  onSaveProject?: (projectId: string) => void;
  isSaved?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSaveProject, isSaved = false }) => {
  const { currentUser, userProfile } = useAuth();
  const [showBidModal, setShowBidModal] = useState(false);

  const isContractor = userProfile?.userType === 'contractor';
  const isOwner = currentUser?.uid === project.postedBy;

  const formatBudget = (amount: number, maxAmount?: number) => {
    const formatAmount = (amt: number) => {
      // Handle undefined, null, or invalid numbers
      if (!amt || isNaN(amt)) {
        console.log('Invalid amount detected:', amt);
        return '₹0';
      }
      
      // Convert to number if it's a string
      const numAmt = typeof amt === 'string' ? parseFloat(amt) : amt;
      
      if (isNaN(numAmt)) {
        console.log('Failed to parse amount:', amt);
        return '₹0';
      }
      
      if (numAmt >= 10000000) return `₹${(numAmt / 10000000).toFixed(1)} Cr`;
      if (numAmt >= 100000) return `₹${(numAmt / 100000).toFixed(1)} L`;
      return `₹${numAmt.toLocaleString('en-IN')}`;
    };

    if (maxAmount && maxAmount !== amount) {
      return `${formatAmount(amount)} - ${formatAmount(maxAmount)}`;
    }
    return formatAmount(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Date TBD';
    }
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Recently posted';
    
    try {
      const now = new Date();
      const posted = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const diffInMs = now.getTime() - posted.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Posted today';
      if (diffInDays === 1) return 'Posted 1 day ago';
      if (diffInDays > 30) return 'Posted over a month ago';
      return `Posted ${diffInDays} days ago`;
    } catch {
      return 'Recently posted';
    }
  };

  const handleSaveProject = () => {
    if (onSaveProject) {
      onSaveProject(project.id);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl line-clamp-2">{project.title || 'Untitled Project'}</CardTitle>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {project.status || 'open'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {getTimeAgo(project.createdAt)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600 line-clamp-3">{project.description || 'No description available'}</p>
          
          <div className="flex flex-wrap gap-2">
            {project.category && project.category.length > 0 ? (
              project.category.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">General</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-600">
                {formatBudget(project.budget, project.budgetMax)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{project.location || 'Location TBD'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Start: {formatDate(project.startDate)}</span>
            </div>
            
            {project.expectedDuration && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Duration: {project.expectedDuration}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button asChild variant="outline" className="flex-1">
              <Link to={`/project/${project.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Full Project
              </Link>
            </Button>
            
            {/* Only show bid button for contractors who don't own the project */}
            {isContractor && !isOwner && (
              <Button 
                onClick={() => setShowBidModal(true)} 
                className="flex-1"
              >
                📩 Place a Bid
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveProject}
              className={isSaved ? 'text-blue-600 border-blue-600' : ''}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Only show bid modal for contractors */}
      {isContractor && !isOwner && (
        <BidFormModal 
          open={showBidModal}
          onOpenChange={setShowBidModal}
          project={project}
        />
      )}
    </>
  );
};

export default ProjectCard;
