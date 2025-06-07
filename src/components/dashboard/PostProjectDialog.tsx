
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import ProfileCompletionRequired from '@/components/ProfileCompletionRequired';

interface PostProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectPosted?: () => Promise<void> | void;
}

// This is a mock component just to show integration - you would normally have your own PostProjectDialog implementation
const PostProjectDialog = ({ open, onOpenChange, onProjectPosted }: PostProjectDialogProps) => {
  const { isProfileComplete, loading } = useProfileCompletion();
  const [shouldShowProfilePrompt, setShouldShowProfilePrompt] = useState(false);
  
  // If still loading or we know the profile is complete, render normally
  if (loading || isProfileComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post a New Project</DialogTitle>
          </DialogHeader>
          {/* Your existing post project form */}
          <p>Project posting form would go here</p>
          <Button onClick={() => onProjectPosted && onProjectPosted()}>Post Project</Button>
        </DialogContent>
      </Dialog>
    );
  }
  
  // If profile is incomplete, show the profile completion prompt
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ProfileCompletionRequired 
          message="You need to complete your profile before posting a project."
        />
      </DialogContent>
    </Dialog>
  );
};

export default PostProjectDialog;
