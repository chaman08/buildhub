
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const VerificationPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  const { currentUser, userProfile, sendEmailVerification, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  const handleResendEmail = async () => {
    try {
      await sendEmailVerification();
      toast({
        title: "Email Sent",
        description: "Verification email has been resent"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSendOTP = async () => {
    // In a real implementation, you would integrate with Firebase phone auth
    // For now, we'll simulate sending an OTP
    toast({
      title: "OTP Sent",
      description: `OTP sent to ${userProfile?.mobile}`
    });
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would verify the OTP with Firebase
      // For demo purposes, we'll accept "123456" as valid OTP
      if (otp === '123456') {
        await updateDoc(doc(db, 'users', currentUser!.uid), {
          isPhoneVerified: true
        });
        setPhoneVerified(true);
        await refreshUserProfile();
        toast({
          title: "Phone Verified",
          description: "Your phone number has been verified successfully"
        });
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please enter the correct OTP",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshEmail = async () => {
    await currentUser?.reload();
    await refreshUserProfile();
  };

  if (!userProfile) return null;

  const isEmailVerified = userProfile.isEmailVerified;
  const isPhoneVerified = userProfile.isPhoneVerified || phoneVerified;
  const isFullyVerified = isEmailVerified && isPhoneVerified;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verify Your Account</h1>
          <p className="text-gray-600">
            Please complete the verification steps below to access all features
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Verification
                {isEmailVerified ? (
                  <CheckCircle className="h-5 w-5 ml-auto text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 ml-auto text-orange-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEmailVerified ? (
                <div className="text-green-600">
                  ✓ Your email address has been verified
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    We've sent a verification email to <strong>{userProfile.email}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Please check your inbox and click the verification link.
                  </p>
                  <div className="flex space-x-2">
                    <Button onClick={handleResendEmail} variant="outline">
                      Resend Email
                    </Button>
                    <Button onClick={handleRefreshEmail} variant="outline">
                      I've Verified
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Phone Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Phone Verification
                {isPhoneVerified ? (
                  <CheckCircle className="h-5 w-5 ml-auto text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 ml-auto text-orange-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPhoneVerified ? (
                <div className="text-green-600">
                  ✓ Your phone number has been verified
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Verify your phone number: <strong>{userProfile.mobile}</strong>
                  </p>
                  <Button onClick={handleSendOTP} variant="outline">
                    Send OTP
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                    <Button 
                      onClick={handleVerifyOTP} 
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Demo: Use OTP "123456" for testing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Status */}
          {isFullyVerified && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Account Fully Verified!
                </h3>
                <p className="text-green-700 mb-4">
                  You can now access all features of the platform
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Continue to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
