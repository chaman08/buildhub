import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationResult } from 'firebase/auth';

interface PhoneLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  phoneNumber: string;
}

const PhoneLinkingModal: React.FC<PhoneLinkingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  phoneNumber
}) => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const { linkPhoneToUser, verifyAndLinkPhone } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && step === 1) {
      handleSendOTP();
    }
  }, [isOpen]);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const result = await linkPhoneToUser(phoneNumber);
      setConfirmationResult(result);
      setStep(2);
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });
    } catch (error: any) {
      console.error('Phone linking OTP error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
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
      await verifyAndLinkPhone(confirmationResult, otp);
      
      toast({
        title: "Phone Linked Successfully",
        description: "Your phone number has been linked to your account"
      });
      
      onSuccess();
      onClose();
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

  const handleResendOTP = async () => {
    await handleSendOTP();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Link Phone Number
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {step === 1 && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
              <p>Sending verification code to {phoneNumber}...</p>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>
              
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, index) => (
                        <InputOTPSlot key={index} {...slot} />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify & Link'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-sm text-gray-500"
                >
                  Skip for now
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneLinkingModal; 