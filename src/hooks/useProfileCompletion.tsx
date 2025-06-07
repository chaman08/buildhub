
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseProfileCompletionOptions {
  redirectOnIncomplete?: boolean;
  onIncomplete?: () => void;
}

export const useProfileCompletion = (options: UseProfileCompletionOptions = {}) => {
  const { userProfile, isProfileComplete } = useAuth();
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      const complete = isProfileComplete();
      setIsComplete(complete);
      
      if (!complete && options.onIncomplete) {
        options.onIncomplete();
      }
      
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [userProfile, options.onIncomplete, isProfileComplete]);

  return {
    isProfileComplete: isComplete,
    loading,
    userProfile
  };
};
