
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, UserCircle } from 'lucide-react';

interface ProfileCompletionRequiredProps {
  message: string;
}

const ProfileCompletionRequired: React.FC<ProfileCompletionRequiredProps> = ({ message }) => {
  const navigate = useNavigate();

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <ClipboardCheck className="mx-auto h-12 w-12 text-blue-500 mb-2" />
        <CardTitle>Profile Completion Required</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4">{message}</p>
        <p className="text-muted-foreground text-sm">
          To ensure a great experience for all users, we require complete profile information before you
          can access all features.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => navigate('/profile')} 
          className="flex items-center gap-2"
        >
          <UserCircle className="h-5 w-5" />
          Complete Your Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileCompletionRequired;
