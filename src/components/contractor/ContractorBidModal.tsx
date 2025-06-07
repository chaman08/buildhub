
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import ProfileCompletionRequired from '@/components/ProfileCompletionRequired';

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
  projectType?: 'residential' | 'commercial' | 'government';
}

interface ContractorBidModalProps {
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onBidSubmitted?: () => Promise<void> | void;
}

const ContractorBidModal = ({ open, onOpenChange, project, onBidSubmitted }: ContractorBidModalProps) => {
  const { isProfileComplete, loading } = useProfileCompletion();
  
  // If still loading or we know the profile is complete, render normally
  if (loading || isProfileComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Your Bid</DialogTitle>
          </DialogHeader>
          {/* Your existing bid form */}
          <p>Bid form would go here</p>
          <Button onClick={() => onBidSubmitted && onBidSubmitted()}>Submit Bid</Button>
        </DialogContent>
      </Dialog>
    );
  }
  
  // If profile is incomplete, show the profile completion prompt
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ProfileCompletionRequired 
          message="You need to complete your contractor profile before placing bids."
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContractorBidModal;
