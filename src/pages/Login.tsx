import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [use2FA, setUse2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call login API
      const response = await api.login(email, password);

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      // Check if OTP is required
      if (response.data && 'requiresOTP' in response.data && response.data.requiresOTP) {
        // Need 2FA - redirect to OTP verification
        if (use2FA) {
          if (!phoneNumber.startsWith('+')) {
            toast({
              variant: 'destructive',
              title: 'Invalid phone number',
              description: 'Phone number must include country code (e.g., +1234567890)',
            });
            setIsLoading(false);
            return;
          }

          navigate('/verify-otp', {
            state: {
              email,
              password,
              phoneNumber,
              mode: 'login',
            },
          });
        } else {
          // User has 2FA enabled but didn't check the box
          toast({
            variant: 'destructive',
            title: '2FA Required',
            description: 'This account has two-factor authentication enabled. Please check "Use 2-Factor Authentication" and enter your phone number.',
          });
          setUse2FA(true);
          setIsLoading(false);
        }
      } else if (response.data && 'token' in response.data && 'user' in response.data) {
        // Direct login (test password or no 2FA)
        setAuthData(response.data.user, response.data.token);

        const isTestMode = password === '979797';
        toast({
          title: 'Welcome back!',
          description: isTestMode ? 'Login successful (test mode)' : 'Login successful',
        });

        // Navigate based on onboarding status
        if (response.data.user.onboardingComplete) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          <span className="text-2xl font-semibold text-foreground">GoalFlow</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Log in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {password === '979797' && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span>✓</span> Test mode enabled - 2FA disabled
                  </p>
                )}
              </div>

              {password !== '979797' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use2fa"
                    checked={use2FA}
                    onCheckedChange={(checked) => setUse2FA(checked as boolean)}
                  />
                  <label
                    htmlFor="use2fa"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Use 2-Factor Authentication
                  </label>
                </div>
              )}

              {use2FA && (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required={use2FA}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : use2FA ? 'Continue to Verification' : 'Log in'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;