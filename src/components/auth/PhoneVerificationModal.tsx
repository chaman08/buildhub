import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+65', country: 'Singapore' },
  { code: '+60', country: 'Malaysia' },
  { code: '+61', country: 'Australia' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' }
];

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, verifyPhoneOTP } = useAuth();
  const { toast } = useToast();
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setOtpSent(false);
      setOtp('');
      setPhoneNumber('');
      setCountdown(0);
      setRetryCount(0);
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    }
  }, [isOpen]);

  const initializeRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          if (recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current.clear();
            recaptchaVerifierRef.current = null;
          }
        }
      });
    }
    return recaptchaVerifierRef.current;
  };

  const handleSendOTP = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please sign in first",
        variant: "destructive"
      });
      return;
    }

    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    // Check retry count
    if (retryCount >= MAX_RETRIES) {
      toast({
        title: "Too Many Attempts",
        description: "Please wait a few minutes before trying again",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      console.log('Sending OTP to phone number:', fullPhoneNumber, 'for user:', currentUser.uid);
      
      // Initialize reCAPTCHA
      const recaptchaVerifier = initializeRecaptcha();
      
      // Render the reCAPTCHA widget
      await recaptchaVerifier.render();
      
      // Send OTP
      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown
      setRetryCount(0); // Reset retry count on success
      
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code"
      });
    } catch (error: any) {
      console.error('Phone OTP error:', error);
      
      // Reset reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }

      let errorMessage = "Failed to send OTP. Please try again.";
      if (error.code === 'auth/invalid-app-credential') {
        errorMessage = "Verification failed. Please refresh the page and try again.";
        // Reset reCAPTCHA completely
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        }
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please wait a few minutes before trying again.";
        setRetryCount(prev => prev + 1);
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "Invalid phone number format. Please check and try again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive"
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: "Error",
        description: "No verification in progress. Please request a new OTP.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      console.log('Phone verification successful:', result);
      
      // Update user profile
      await verifyPhoneOTP(otp);
      
      toast({
        title: "Success",
        description: "Phone number verified successfully"
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Your Phone Number</DialogTitle>
          <DialogDescription>
            Enter your phone number to receive a verification code
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!otpSent ? (
            <>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select country" />
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
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your 10-digit phone number without the country code
                </p>
              </div>

              {/* reCAPTCHA container */}
              <div id="recaptcha-container" className="flex justify-center" />

              <Button
                onClick={handleSendOTP}
                disabled={loading || !phoneNumber || retryCount >= MAX_RETRIES}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  maxLength={6}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || !otp}
                  className="w-full"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button
                  onClick={handleSendOTP}
                  disabled={loading || countdown > 0 || retryCount >= MAX_RETRIES}
                  variant="outline"
                  className="w-full"
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneVerificationModal;
