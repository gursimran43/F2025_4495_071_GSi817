import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuthData } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match',
      });
      return;
    }

    // Only validate phone number if not using test password
    if (password !== '979797' && !phoneNumber.startsWith('+')) {
      toast({
        variant: 'destructive',
        title: 'Invalid phone number',
        description: 'Phone number must include country code (e.g., +1234567890)',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call signup API
      const response = await api.signup(email, password, name);

      if (!response.success) {
        throw new Error(response.message || 'Signup failed');
      }

      // Check if OTP is required
      if (response.data && 'requiresOTP' in response.data && response.data.requiresOTP) {
        // Navigate to OTP verification page
        navigate('/verify-otp', {
          state: {
            email,
            password,
            name,
            phoneNumber,
            mode: 'signup',
          },
        });
      } else if (response.data && 'token' in response.data && 'user' in response.data) {
        // Test password used - direct signup without 2FA
        setAuthData(response.data.user, response.data.token);

        toast({
          title: 'Account created successfully!',
          description: 'Welcome to GoalFlow (test mode)',
        });

        // Navigate to onboarding
        navigate('/onboarding');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Signup Error',
        description: error instanceof Error ? error.message : 'An error occurred during signup',
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
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Get started with your goal achievement journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                <Label htmlFor="phoneNumber">
                  Phone Number {password !== '979797' && <span className="text-destructive">*</span>}
                  {password === '979797' && <span className="text-xs text-muted-foreground ml-2">(Optional in test mode)</span>}
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required={password !== '979797'}
                />
                <p className="text-xs text-muted-foreground">
                  {password === '979797'
                    ? 'Test mode: 2FA disabled - phone number optional'
                    : 'Include country code (e.g., +1 for US)'}
                </p>
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
                  minLength={6}
                />
                {password === '979797' && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span>✓</span> Test mode enabled - 2FA will be skipped
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : password === '979797' ? 'Sign Up (Test Mode)' : 'Continue to Verification'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
