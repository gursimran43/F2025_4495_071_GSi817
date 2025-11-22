import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OtpInput } from '@/components/ui/otp-input';
import { Target, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { updateUser } = useAuth();

  const phoneNumber = location.state?.phoneNumber;
  const email = location.state?.email;
  const password = location.state?.password;
  const name = location.state?.name;
  const mode = location.state?.mode; // 'signup' or 'login'

  useEffect(() => {
    if (!phoneNumber || !mode) {
      toast({
        title: 'Error',
        description: 'Missing phone number or verification mode',
        variant: 'destructive',
      });
      navigate('/signup');
      return;
    }

    setupRecaptcha();
    sendOtp();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      });
    }
  };

  const sendOtp = async () => {
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);

      toast({
        title: 'OTP Sent',
        description: `Verification code sent to ${phoneNumber}`,
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsResending(true);
    setCanResend(false);
    setCountdown(60);

    try {
      await sendOtp();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend OTP',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a 6-digit OTP',
        variant: 'destructive',
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: 'Error',
        description: 'Please request a new OTP',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const firebaseToken = await result.user.getIdToken();

      // Send to backend for verification and account creation/login
      const response = await api.verifyOtp({
        email,
        password,
        name,
        phoneNumber,
        firebaseToken,
        mode,
      });

      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        await updateUser(user);

        toast({
          title: 'Success!',
          description: mode === 'signup' ? 'Account created successfully' : 'Login successful',
        });

        navigate(mode === 'signup' ? '/onboarding' : '/dashboard');
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          <span className="text-2xl font-semibold text-foreground">GoalFlow</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify Your Phone</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {phoneNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <OtpInput
                value={otp}
                onChange={setOtp}
                length={6}
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleVerifyOtp}
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              {canResend ? (
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-primary"
                >
                  {isResending ? 'Resending...' : 'Resend OTP'}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend available in {countdown}s
                </p>
              )}
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate(mode === 'signup' ? '/signup' : '/login')}
                className="text-sm text-muted-foreground"
              >
                Change phone number
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OtpVerification;
