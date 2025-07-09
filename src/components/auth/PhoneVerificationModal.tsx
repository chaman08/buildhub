
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RecaptchaVerifier, PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState('');
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
      setVerificationId('');
      cleanupRecaptcha();
    } else {
      // Pre-fill phone number if available
      if (userProfile?.mobile) {
        const mobile = userProfile.mobile;
        if (mobile.startsWith('+91')) {
          setCountryCode('+91');
          setPhoneNumber(mobile.substring(3));
        } else if (mobile.startsWith('+1')) {
          setCountryCode('+1');
          setPhoneNumber(mobile.substring(2));
        } else if (mobile.startsWith('+')) {
          const match = mobile.match(/^(\+\d{1,4})(\d+)$/);
          if (match) {
            setCountryCode(match[1]);
            setPhoneNumber(match[2]);
          }
        } else {
          setPhoneNumber(mobile);
        }
      }
    }
  }, [isOpen, userProfile]);

  // Add useEffect for cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecaptcha();
    };
  }, []);

  // Fix reCAPTCHA initialization to ensure container exists
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (!recaptchaVerifierRef.current && document.getElementById('recaptcha-container')) {
          try {
            const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              size: 'invisible',
              callback: () => {
                console.log('reCAPTCHA solved');
              },
              'expired-callback': () => {
                console.log('reCAPTCHA expired');
                cleanupRecaptcha();
              }
            });
            recaptchaVerifierRef.current = recaptchaVerifier;
          } catch (error) {
            console.error('Error initializing reCAPTCHA:', error);
            toast({
              title: 'reCAPTCHA Error',
              description: 'Failed to initialize reCAPTCHA. Please refresh and try again.',
              variant: 'destructive'
            });
          }
        }
      }, 0); // Wait for next tick so the container is rendered
    }
    return () => {
      cleanupRecaptcha();
    };
  }, [isOpen]);

  const cleanupRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (error) {
        console.log('Error cleaning up reCAPTCHA:', error);
      }
      recaptchaVerifierRef.current = null;
    }
    
    // Clear the container
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
    if (countryCode === '+91') {
      return /^[6-9]\d{9}$/.test(cleanPhone);
    }
    
    // For other countries, just check if it has at least 10 digits
    return cleanPhone.length >= 10;
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

    // Clean and validate phone number
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    if (!validatePhoneNumber(cleanPhoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: countryCode === '+91' 
          ? "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
          : "Please enter a valid phone number",
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
      const fullPhoneNumber = `${countryCode}${cleanPhoneNumber}`;
      console.log('Sending OTP to phone number:', fullPhoneNumber, 'for user:', currentUser.uid);
      // Use the existing recaptchaVerifierRef
      const recaptchaVerifier = recaptchaVerifierRef.current;
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized. Please refresh and try again.');
      }
      // Send OTP using PhoneAuthProvider
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(fullPhoneNumber, recaptchaVerifier);
      
      setVerificationId(verificationId);
      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown
      setRetryCount(0); // Reset retry count on success
      
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code"
      });
    } catch (error: any) {
      console.error('Phone OTP error:', error);
      
      cleanupRecaptcha();

      let errorMessage = "Failed to send OTP. Please try again.";
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "Invalid phone number format. Please check the number and country code.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please wait a few minutes before trying again.";
        setRetryCount(prev => prev + 1);
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = "SMS quota exceeded. Please try again later.";
      } else if (error.code === 'auth/invalid-app-credential') {
        errorMessage = "Phone verification service is temporarily unavailable. Please try again later or contact support.";
        console.error('reCAPTCHA configuration issue - check Firebase Console settings');
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = "Security verification failed. Please refresh the page and try again.";
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
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    if (!verificationId) {
      toast({
        title: "Error",
        description: "No verification in progress. Please request a new OTP.",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create phone credential
      const phoneCredential = PhoneAuthProvider.credential(verificationId, otp);
      
      // Link the phone credential to the current user account
      await linkWithCredential(currentUser, phoneCredential);
      
      console.log('Phone verification successful for user:', currentUser.uid);
      
      // Update user profile in Firestore to mark phone as verified
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const fullPhoneNumber = `${countryCode}${cleanPhoneNumber}`;
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        isPhoneVerified: true,
        mobile: fullPhoneNumber,
        updatedAt: new Date()
      });
      
      toast({
        title: "Success",
        description: "Phone number verified successfully"
      });
      
      // Refresh user profile and call success callback
      await refreshUserProfile();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('OTP verification error:', error);
      let errorMessage = "Failed to verify OTP. Please try again.";
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "Invalid OTP. Please check the code and try again.";
      } else if (error.code === 'auth/code-expired') {
        errorMessage = "OTP has expired. Please request a new one.";
      } else if (error.code === 'auth/credential-already-in-use') {
        errorMessage = "This phone number is already linked to another account.";
      } else if (error.code === 'auth/provider-already-linked') {
        errorMessage = "A phone number is already linked to this account.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "This phone number is already linked to another account.";
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
                    maxLength={15}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {countryCode === '+91' 
                    ? "Enter your 10-digit mobile number (starting with 6, 7, 8, or 9)"
                    : "Enter your phone number without the country code"
                  }
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

              {retryCount >= MAX_RETRIES && (
                <p className="text-sm text-red-600 text-center">
                  Too many attempts. Please wait a few minutes before trying again.
                </p>
              )}
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
                <p className="text-sm text-muted-foreground mt-1">
                  Code sent to {countryCode}{phoneNumber}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || !otp || otp.length !== 6}
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