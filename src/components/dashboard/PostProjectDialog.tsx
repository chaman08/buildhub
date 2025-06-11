
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import ProfileCompletionRequired from '@/components/ProfileCompletionRequired';
import PostProjectForm from '@/components/forms/PostProjectForm';

interface PostProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectPosted?: () => Promise<void> | void;
}

const PostProjectDialog = ({ open, onOpenChange, onProjectPosted }: PostProjectDialogProps) => {
  const { currentUser } = useAuth();
  const { isProfileComplete, loading } = useProfileCompletion();
  const navigate = useNavigate();
  
  // If user is not logged in, redirect to auth page
  if (!currentUser) {
    navigate('/auth');
    return null;
  }
  
  // If still loading profile completion status
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-6">
            <div className="text-center">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // If profile is incomplete, show the profile completion prompt
  if (!isProfileComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <ProfileCompletionRequired 
            message="You need to complete your profile before posting a project."
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  // If everything is good, show the post project form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
