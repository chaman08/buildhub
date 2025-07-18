import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
  className?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 2000,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Animate logo appearance
    const logoTimer = setTimeout(() => setShowLogo(true), 200);
    const textTimer = setTimeout(() => setShowText(true), 600);
    const hideTimer = setTimeout(() => setIsVisible(false), duration - 300);
    const completeTimer = setTimeout(() => onComplete?.(), duration);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(hideTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 z-50 flex items-center justify-center',
      'transition-opacity duration-300',
      className
    )}>
      <div className="flex flex-col items-center space-y-6">
        {/* Logo */}
        <div className={cn(
          'transition-all duration-700 ease-out',
          showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        )}>
          <div className="bg-blue-600 rounded-xl p-4 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-4xl">B</span>
          </div>
        </div>

        {/* App Name */}
        <div className={cn(
          'transition-all duration-700 ease-out delay-200',
          showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">BuildHub</h1>
          <p className="text-gray-600 text-center">Connecting Projects with Professionals</p>
        </div>

        {/* Loading dots */}
        <div className={cn(
          'flex space-x-1 transition-all duration-700 ease-out delay-400',
          showText ? 'opacity-100' : 'opacity-0'
        )}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export { SplashScreen }; 