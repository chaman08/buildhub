
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// Remove: import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import ProfileCompletionRequired from '@/components/ProfileCompletionRequired';
import PostProjectForm from '@/components/forms/PostProjectForm';

interface PostProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectPosted?: () => Promise<void> | void;
}

const PostProjectDialog = ({ open, onOpenChange, onProjectPosted }: PostProjectDialogProps) => {
  const { currentUser, isVerificationComplete } = useAuth();
  const navigate = useNavigate();

  // If user is not logged in, redirect to auth page
  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  // Require both email and phone verified before posting
  if (!isVerificationComplete()) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <ProfileCompletionRequired
            message="Verify your email or phone number before posting a project."
          />
        </DialogContent>
      </Dialog>
    );
  }

  // If everything is good, show the post project form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <PostProjectForm
          onSuccess={() => {
            onProjectPosted && onProjectPosted();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PostProjectDialog;
