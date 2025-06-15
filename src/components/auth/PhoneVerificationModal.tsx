import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Verify OTP
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  
  const { setupRecaptcha, sendPhoneOTP, verifyPhoneOTP, currentUser } = useAuth();
  const { toast } = useToast();

  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+33', country: 'France' },
    { code: '+49', country: 'Germany' },
    { code: '+61', country: 'Australia' },
    { code: '+971', country: 'UAE' },
    { code: '+65', country: 'Singapore' }
  ];

  const initializeRecaptcha = () => {
    try {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
      const verifier = setupRecaptcha('phone-verification-recaptcha-modal');
      setRecaptchaVerifier(verifier);
      return verifier;
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      toast({
        title: "Error",
        description: "Failed to initialize verification. Please refresh the page and try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    const fullPhone = `${countryCode}${phoneNumber}`;
    console.log('Sending OTP to phone number:', fullPhone, 'for user:', currentUser?.uid);
    setLoading(true);
    
    try {
      // Initialize reCAPTCHA before sending OTP
      const verifier = initializeRecaptcha();
      const result = await sendPhoneOTP(fullPhone, verifier);
      setConfirmationResult(result);
      setStep(2);
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${fullPhone}`
      });
    } catch (error: any) {
      console.error('Phone OTP error:', error);
      let errorMessage = "Failed to send OTP. Please try again.";
      
      if (error.code === 'auth/invalid-app-credential') {
        errorMessage = "Verification failed. Please refresh the page and try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please try again later.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Reset reCAPTCHA on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!confirmationResult || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "No authenticated user found. Please login first.",
        variant: "destructive"
      });
      return;
    }

    console.log('Verifying OTP for existing user:', currentUser.uid);
    setLoading(true);
    
    try {
      // For existing users, we just verify the phone without creating new account
      await verifyPhoneOTP(confirmationResult, otp);
      
      // Wait for user profile to be updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully!"
      });
      
      // Clean up reCAPTCHA
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
      
      // Call success callback and close modal
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Phone verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setPhoneNumber('');
    setOtp('');
    setConfirmationResult(null);
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      setRecaptchaVerifier(null);
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleResendOTP = async () => {
    setOtp('');
    setLoading(true);
    try {
      await handleSendOTP();
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your phone"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Phone Verification</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Enter your phone number to receive a verification code"
              : "Enter the 6-digit code sent to your phone"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="flex space-x-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} {country.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1"
                    required
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSendOTP} 
                disabled={loading || !phoneNumber || phoneNumber.length < 10}
                className="w-full"
              >
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
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
                </div>

                <Button 
                  onClick={handleVerifyOTP} 
                  disabled={loading || otp.length !== 6}
                  className="w-full"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm"
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* reCAPTCHA container */}
        <div id="phone-verification-recaptcha-modal" className="hidden"></div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneVerificationModal;
