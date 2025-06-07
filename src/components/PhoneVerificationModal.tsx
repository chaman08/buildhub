
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Phone, Shield } from 'lucide-react';

interface PhoneVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationComplete?: () => void;
  isRequired?: boolean;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  open,
  onOpenChange,
  onVerificationComplete,
  isRequired = false
}) => {
  const { updatePhoneNumber, verifyPhoneOTP, userProfile } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState(userProfile?.countryCode || '+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await updatePhoneNumber(countryCode, phoneNumber);
      setConfirmationResult(result);
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${countryCode}${phoneNumber}`
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

  const handleVerifyOTP = async () => {
    if (!confirmationResult || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneOTP(confirmationResult, otp);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully!"
      });
      onVerificationComplete?.();
      onOpenChange(false);
      // Reset form
      setStep('phone');
      setPhoneNumber('');
      setOtp('');
      setConfirmationResult(null);
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

  const handleClose = () => {
    if (!isRequired) {
      onOpenChange(false);
      setStep('phone');
      setPhoneNumber('');
      setOtp('');
      setConfirmationResult(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={isRequired ? (e) => e.preventDefault() : undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Phone Verification
              {isRequired && <span className="text-red-500">*</span>}
            </DialogTitle>
            <DialogDescription>
              {isRequired 
                ? "Phone verification is required to complete your profile and access all features."
                : "Verify your phone number for enhanced security."
              }
            </DialogDescription>
          </DialogHeader>

          {step === 'phone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
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
                    id="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isRequired && (
                  <Button variant="outline" onClick={handleClose} className="flex-1">
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={handleSendOTP} 
                  disabled={loading} 
                  className={`${isRequired ? 'w-full' : 'flex-1'} flex items-center gap-2`}
                >
                  <Phone className="h-4 w-4" />
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the 6-digit code sent to {countryCode}{phoneNumber}
                </p>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  className="justify-center"
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
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('phone')} 
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyOTP} 
                  disabled={loading || otp.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={handleSendOTP} 
                disabled={loading}
                className="w-full text-sm"
              >
                Resend OTP
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* reCAPTCHA container */}
      <div id="phone-update-recaptcha" className="hidden"></div>
    </>
  );
};

export default PhoneVerificationModal;
