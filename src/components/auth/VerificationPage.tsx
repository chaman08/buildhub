
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

const VerificationPage: React.FC = () => {
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const { 
    currentUser, 
    userProfile, 
    sendEmailVerification, 
    refreshUserProfile,
    setupRecaptcha,
    sendPhoneOTP,
    verifyPhoneOTP,
    isVerificationComplete
  } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Setup reCAPTCHA
    if (!recaptchaVerifier) {
      const verifier = setupRecaptcha('recaptcha-container');
      setRecaptchaVerifier(verifier);
    }
    
    return () => {
      recaptchaVerifier?.clear();
    };
  }, []);

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

  const handleSendPhoneOTP = async () => {
    if (!userProfile?.mobile || !recaptchaVerifier) {
      toast({
        title: "Error",
        description: "Phone number or reCAPTCHA not ready",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await sendPhoneOTP(userProfile.mobile, recaptchaVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `OTP sent to ${userProfile.mobile}`
      });
    } catch (error: any) {
      console.error('Phone OTP error:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (!confirmationResult || phoneOtp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneOTP(confirmationResult, phoneOtp);
      setPhoneVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully"
      });
    } catch (error: any) {
      console.error('Phone verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshEmail = async () => {
    await refreshUserProfile();
  };

  if (!userProfile) return null;

  const isEmailVerified = userProfile.isEmailVerified;
  const isPhoneVerified = userProfile.isPhoneVerified || phoneVerified;
  const hasMinimumVerification = isVerificationComplete();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verify Your Account</h1>
          <p className="text-gray-600">
            {hasMinimumVerification 
              ? "Great! You can now access the platform. Complete both verifications for full security."
              : "Please verify at least one contact method to access the platform"
            }
          </p>
        </div>

        {/* Minimum verification info card */}
        {hasMinimumVerification && !isEmailVerified && !isPhoneVerified && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Account Access Granted</h3>
                  <p className="text-blue-700 text-sm">
                    You can now use the platform! For enhanced security, we recommend completing both email and phone verification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Email Verification */}
          {userProfile.email && (
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
          )}

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
                  
                  {!otpSent ? (
                    <Button 
                      onClick={handleSendPhoneOTP} 
                      disabled={loading}
                      variant="outline"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Enter the 6-digit OTP sent to your phone:
                      </p>
                      <div className="flex space-x-2 items-center">
                        <InputOTP
                          maxLength={6}
                          value={phoneOtp}
                          onChange={setPhoneOtp}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                        <Button 
                          onClick={handleVerifyPhoneOTP} 
                          disabled={loading || phoneOtp.length !== 6}
                        >
                          {loading ? 'Verifying...' : 'Verify'}
                        </Button>
                      </div>
                      <Button 
                        onClick={handleSendPhoneOTP} 
                        variant="outline" 
                        size="sm"
                        disabled={loading}
                      >
                        Resend OTP
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Continue to platform button */}
          {hasMinimumVerification && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Ready to Continue!
                </h3>
                <p className="text-green-700 mb-4">
                  {isEmailVerified && isPhoneVerified 
                    ? "Both verifications complete! You have full access to all features."
                    : "You have sufficient verification to access the platform."
                  }
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Continue to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default VerificationPage;
