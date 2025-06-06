
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import ProfileCompletionRequired from '@/components/ProfileCompletionRequired';

// This is a mock component just to show integration - you would normally have your own ContractorBidModal implementation
const ContractorBidModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
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
          <Button>Submit Bid</Button>
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
