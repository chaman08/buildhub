
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const usePostProject = () => {
  const [showPostDialog, setShowPostDialog] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handlePostProject = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    setShowPostDialog(true);
  };

  return {
    showPostDialog,
    setShowPostDialog,
    handlePostProject
  };
};
