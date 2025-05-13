
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  PhoneAuthProvider,
  signInWithPhoneNumber
} from "firebase/auth";
import { auth, setupRecaptcha } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const recaptchaVerifierRef = useRef<any>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'customer', // 'customer' or 'contractor'
  });

  // Verification states
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (!phoneVerified) {
      setError('Please verify your phone number');
      return false;
    }
    
    if (!emailVerified) {
      setError('Please verify your email address');
      return false;
    }
    
    return true;
  };

  // Function to send OTP to phone
  const handlePhoneVerification = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = setupRecaptcha('recaptcha-container');
    }

    setVerifyingPhone(true);
    setError('');

    try {
      // Set up the invisible reCAPTCHA
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = setupRecaptcha('recaptcha-container');
      }

      // Format phone number with country code if missing
      const phoneNumberWithCode = formData.phone.startsWith('+') 
        ? formData.phone 
        : `+91${formData.phone}`; // Default to US code, adjust as needed

      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        phoneNumberWithCode, 
        recaptchaVerifierRef.current
      );
      
      setConfirmationResult(confirmationResult);
      toast({
        title: "Verification code sent",
        description: `Please enter the 6-digit code sent to ${formData.phone}`,
      });
    } catch (err: any) {
      console.error('Phone verification error:', err);
      setError(`Phone verification failed: ${err.message}`);
      // Reset reCAPTCHA if error
      recaptchaVerifierRef.current = null;
    } finally {
      setVerifyingPhone(false);
    }
  };

  // Function to verify phone OTP
  const verifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length !== 6 || !confirmationResult) {
      setError('Please enter a valid verification code');
      return;
    }

    setVerifyingPhone(true);
    setError('');

    try {
      await confirmationResult.confirm(phoneOtp);
      setPhoneVerified(true);
      toast({
        title: "Phone verified!",
        description: "Your phone number has been verified successfully.",
      });
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(`OTP verification failed: ${err.message}`);
    } finally {
      setVerifyingPhone(false);
    }
  };

  // Function to send email verification
  const handleEmailVerification = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Please enter a valid password (min 6 characters)');
      return;
    }

    setVerifyingEmail(true);
    setError('');

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      setEmailVerified(true);
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox and click the verification link",
      });
    } catch (err: any) {
      console.error('Email verification error:', err);
      setError(`Email verification failed: ${err.message}`);
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Account already created during email verification
      // We can add user details to Firestore/database here
      
      toast({
        title: "Account created successfully!",
        description: "Redirecting to dashboard...",
      });
      
      // Redirect based on user type
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(`Failed to create account: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Type Selection */}
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="customer">Customer (Looking for contractors)</option>
                <option value="contractor">Contractor (Offering services)</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Section */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={emailVerified}
                    className={emailVerified ? "bg-green-50 border-green-500" : ""}
                  />
                </div>
                <Button 
                  type="button"
                  onClick={handleEmailVerification}
                  disabled={emailVerified || verifyingEmail}
                  variant={emailVerified ? "outline" : "default"}
                  className={emailVerified ? "border-green-500 text-green-600" : ""}
                >
                  {verifyingEmail ? "Sending..." : emailVerified ? "Verified ✓" : "Verify Email"}
                </Button>
              </div>
              {emailVerified && (
                <p className="text-sm text-green-600">Email verified successfully!</p>
              )}
            </div>

            {/* Phone Section */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1234567890"
                    disabled={phoneVerified}
                    className={phoneVerified ? "bg-green-50 border-green-500" : ""}
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={handlePhoneVerification}
                  disabled={phoneVerified || verifyingPhone || !formData.phone}
                  variant={phoneVerified ? "outline" : "default"}
                  className={phoneVerified ? "border-green-500 text-green-600" : ""}
                >
                  {verifyingPhone ? "Sending..." : phoneVerified ? "Verified ✓" : "Send OTP"}
                </Button>
              </div>

              {confirmationResult && !phoneVerified && (
                <div className="mt-4 space-y-2">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Enter verification code
                  </label>
                  <div className="flex space-x-2">
                    <InputOTP 
                      maxLength={6} 
                      value={phoneOtp} 
                      onChange={(value) => setPhoneOtp(value)}
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
                    type="button" 
                    onClick={verifyPhoneOtp} 
                    disabled={phoneOtp.length !== 6 || verifyingPhone}
                    className="mt-2"
                  >
                    {verifyingPhone ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I accept the <Link to="#" className="text-primary">Terms and Conditions</Link>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={loading || !emailVerified || !phoneVerified || !termsAccepted}
                className="w-full"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>

            {/* Hidden element for reCAPTCHA */}
            <div id="recaptcha-container"></div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => alert('Google sign up would happen here')}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                  </svg>
                </button>
              </div>

              <div>
                <button
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => alert('Phone OTP sign up would happen here')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
