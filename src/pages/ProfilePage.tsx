
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileManagement } from '@/components/ProfileManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Shield } from 'lucide-react';
import PhoneVerificationModal from '@/components/auth/PhoneVerificationModal';
import { useToast } from '@/hooks/use-toast';

export const ProfilePage = () => {
  const { userProfile, sendEmailVerification, refreshUserProfile } = useAuth();
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);
  const { toast } = useToast();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleEmailVerification = async () => {
    try {
      await sendEmailVerification();
      toast({
        title: "Verification Email Sent",
        description: "Please check your email and click the verification link."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive"
      });
    }
  };

  const handlePhoneVerificationSuccess = () => {
    toast({
      title: "Phone Verified",
      description: "Your phone number has been verified successfully!"
    });
    refreshUserProfile();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {userProfile?.fullName || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Welcome to your profile dashboard. Here you can manage your account information and preferences.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Status Card */}
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Account Verification</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Verification */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Verification</p>
                    <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={userProfile?.isEmailVerified ? "default" : "secondary"}>
                    {userProfile?.isEmailVerified ? "✓ Verified" : "Pending"}
                  </Badge>
                  {!userProfile?.isEmailVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEmailVerification}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>

              {/* Phone Verification */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Phone Verification</p>
                    <p className="text-sm text-muted-foreground">
                      {userProfile?.mobile || 'No phone number added'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={userProfile?.isPhoneVerified ? "default" : "secondary"}>
                    {userProfile?.isPhoneVerified ? "✓ Verified" : "Pending"}
                  </Badge>
                  {!userProfile?.isPhoneVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPhoneVerificationModal(true)}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {(!userProfile?.isEmailVerified || !userProfile?.isPhoneVerified) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Complete your verification:</strong> Verify your email and phone number to access all features and improve account security.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ProfileManagement />

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneVerificationModal}
        onClose={() => setShowPhoneVerificationModal(false)}
        onSuccess={handlePhoneVerificationSuccess}
      />
    </div>
  );
}; 
