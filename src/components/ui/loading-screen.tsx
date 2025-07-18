import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  variant?: 'fullscreen' | 'overlay' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showLogo?: boolean;
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  variant = 'fullscreen',
  size = 'md',
  message,
  showLogo = true,
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const logoSize = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {showLogo && (
        <div className={cn('flex items-center justify-center', logoSize[size])}>
          <div className="bg-blue-600 rounded-lg p-2 shadow-lg">
            <span className="text-white font-bold text-xl">B</span>
          </div>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
        {message && (
          <span className="text-gray-600 font-medium">{message}</span>
        )}
      </div>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className={cn(
        'fixed inset-0 bg-white z-50 flex items-center justify-center',
        className
      )}>
        {content}
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={cn(
        'absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center',
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      {content}
    </div>
  );
};

export { LoadingScreen }; 