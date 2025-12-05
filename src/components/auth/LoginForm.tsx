
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PhoneAuthForm from './PhoneAuthForm';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { login, signInWithGoogle, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData.email, formData.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!"
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome to BuildHub!",
        description: "Account created successfully with Google"
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Google Sign-in Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToReset = (resetEmail || formData.email).trim();

    if (!emailToReset) {
      toast({
        title: "Email required",
        description: "Enter the email you use to sign in.",
        variant: "destructive"
      });
      return;
    }

    setResetLoading(true);

    try {
      await resetPassword(emailToReset);
      toast({
        title: "Reset link sent",
        description: "Check your email for instructions to reset your password."
      });
      setShowResetDialog(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: "Unable to send reset link",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">Welcome Back</CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Sign in to your BuildHub account
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Google Sign-in - More Prominent */}
          <Button 
            onClick={handleGoogleSignIn} 
            disabled={googleLoading}
            variant="outline"
            size="lg"
            className="w-full h-12 text-base font-medium border-2 hover:bg-blue-50 hover:border-blue-200"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                Phone
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(formData.email);
                        setShowResetDialog(true);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="phone">
              <PhoneAuthForm onSuccess={onSuccess} isLogin={true} />
            </TabsContent>
          </Tabs>
          
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up here
            </button>
          </div>
        </div>
      </CardContent>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter the email linked to your account and we'll send you a reset link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="reset-email">Email address</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResetDialog(false)}
                className="sm:w-auto w-full"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={resetLoading} className="sm:w-auto w-full">
                {resetLoading ? 'Sending...' : 'Send reset link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LoginForm;
