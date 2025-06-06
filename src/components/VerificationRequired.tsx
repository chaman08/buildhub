
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, Mail, Phone } from 'lucide-react';

interface VerificationRequiredProps {
  action: string;
  children: React.ReactNode;
}

const VerificationRequired: React.FC<VerificationRequiredProps> = ({ action, children }) => {
  const { userProfile } = useAuth();

  const isVerified = userProfile?.isEmailVerified || userProfile?.isPhoneVerified;

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Shield className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium">Verification Required</p>
          <p className="text-sm text-gray-600">
            You need to verify your email or phone number to {action}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href="/profile">
              <Mail className="h-4 w-4 mr-1" />
              Verify Now
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default VerificationRequired;
