import React from 'react';
import { LoadingScreen } from './loading-screen';

interface RouteLoadingProps {
  message?: string;
}

const RouteLoading: React.FC<RouteLoadingProps> = ({ 
  message = 'Loading page...' 
}) => {
  return (
    <LoadingScreen
      variant="overlay"
      size="md"
      message={message}
      showLogo={true}
      className="bg-white/90"
    />
  );
};

export { RouteLoading }; 