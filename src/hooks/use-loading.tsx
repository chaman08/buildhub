import { useState, useCallback } from 'react';

interface UseLoadingOptions {
  initialLoading?: boolean;
  delay?: number;
}

export const useLoading = (options: UseLoadingOptions = {}) => {
  const { initialLoading = false, delay = 0 } = options;
  const [loading, setLoading] = useState(initialLoading);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const startLoading = useCallback((message?: string) => {
    if (delay > 0) {
      setTimeout(() => {
        setLoading(true);
        if (message) setLoadingMessage(message);
      }, delay);
    } else {
      setLoading(true);
      if (message) setLoadingMessage(message);
    }
  }, [delay]);

  const stopLoading = useCallback(() => {
    setLoading(false);
    setLoadingMessage('');
  }, []);

  const withLoading = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      startLoading(message);
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading
  };
}; 