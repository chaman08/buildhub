import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RouteLoading } from './route-loading';

interface RouteTransitionProps {
  children: React.ReactNode;
}

const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== currentPath) {
      setIsLoading(true);
      setCurrentPath(location.pathname);
      
      // Simulate loading time for route transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentPath]);

  if (isLoading) {
    return <RouteLoading message="Loading page..." />;
  }

  return <>{children}</>;
};

export { RouteTransition }; 