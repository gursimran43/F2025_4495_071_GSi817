import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, User, Briefcase, Trophy, Clock, Sparkles, ArrowRight, ArrowLeft, Save, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface OnboardingData {
  name: string;
  email: string;
  profession: string;
  experience: string;
  industry: string;
  goals: string;
  timeline: string;
  currentSkills: string;
  learningStyle: string;
  weeklyHours: string;
  motivation: string;
}

const EditProfile = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    email: '',
    profession: '',
    experience: '',
    industry: '',
    goals: '',
    timeline: '',
    currentSkills: '',
    learningStyle: '',
    weeklyHours: '',
    motivation: '',
  });
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getOnboarding();

      if (response.success && response.data?.onboarding) {
        setData(response.data.onboarding);
      } else {
        // Fallback to localStorage
        const storedData = localStorage.getItem('onboardingData');
        if (storedData) {
          setData(JSON.parse(storedData));
        } else {
          // Use user data as fallback
          if (user) {
            setData(prev => ({
              ...prev,
              name: user.name || '',
              email: user.email || '',
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      toast({
        title: 'Info',
        description: 'Using previously saved data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // First save the onboarding data
      const saveResponse = await api.saveOnboarding(data);

      if (!saveResponse.success) {
        throw new Error(saveResponse.message || 'Failed to save profile');
      }

      // Update user name if changed
      if (data.name !== user?.name) {
        await updateUser({ name: data.name });
      }

      // Regenerate plan with updated data
      const response = await api.completeOnboarding(data);

      if (response.success) {
        // Save updated onboarding data to localStorage
        localStorage.setItem('onboardingData', JSON.stringify(data));

        toast({
          title: 'Profile Updated!',
          description: 'Your plan has been regenerated with your updated information.',
        });

        // Navigate back to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast({
          title: 'Saved',
          description: 'Profile updated. Plan regeneration will be applied shortly.',
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return data.name && data.email && data.profession;
      case 2:
        return data.experience && data.industry && data.currentSkills;
      case 3:
        return data.goals && data.timeline && data.motivation;
      case 4:
        return data.learningStyle && data.weeklyHours;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 text-primary animate-spin mx-auto" />
            <p className="text-lg text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <Header />

      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-4xl space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <User className="h-8 w-8 text-primary" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Edit Profile
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Update Your Information
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Update your details and regenerate your personalized plan
              </p>
            </div>
          </div>

          {/* Main Card */}
          <Card className="border-2 shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary"></div>

            <CardHeader className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">
                    {step === 1 && 'Personal Information'}
                    {step === 2 && 'Background & Skills'}
                    {step === 3 && 'Goals & Motivation'}
                    {step === 4 && 'Learning Preferences'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {step === 1 && 'Update your basic information'}
                    {step === 2 && 'Modify your experience and skills'}
                    {step === 3 && 'Refine your goals and timeline'}
                    {step === 4 && 'Adjust your learning preferences'}
                  </CardDescription>
                </div>
                <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20">
                  {step === 1 && <User className="h-8 w-8 text-primary" />}
                  {step === 2 && <Briefcase className="h-8 w-8 text-primary" />}
                  {step === 3 && <Trophy className="h-8 w-8 text-primary" />}
                  {step === 4 && <Sparkles className="h-8 w-8 text-primary" />}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Progress</span>
                  <span className="text-foreground font-semibold">Step {step} of {totalSteps}</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className={step >= 1 ? 'text-primary font-medium' : ''}>Personal</span>
                  <span className={step >= 2 ? 'text-primary font-medium' : ''}>Background</span>
                  <span className={step >= 3 ? 'text-primary font-medium' : ''}>Goals</span>
                  <span className={step >= 4 ? 'text-primary font-medium' : ''}>Preferences</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">💡 Update Info:</span> Changes here will regenerate your personalized plan with fresh recommendations.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., John Doe"
                      value={data.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="sarah@example.com"
                      value={data.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession" className="text-base font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Current Role / Position
                    </Label>
                    <Input
                      id="profession"
                      placeholder="e.g., Senior Product Manager"
                      value={data.profession}
                      onChange={(e) => handleChange('profession', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">💼 Your Background:</span> Keep your experience and skills up to date for better recommendations.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-base font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Years of Professional Experience
                    </Label>
                    <Input
                      id="experience"
                      placeholder="e.g., 5 years"
                      value={data.experience}
                      onChange={(e) => handleChange('experience', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-base font-semibold">
                      Industry / Field
                    </Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Technology, Healthcare, Finance"
                      value={data.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentSkills" className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Current Skills & Expertise
                    </Label>
                    <Textarea
                      id="currentSkills"
                      placeholder="List your technical skills, soft skills, certifications, and key competencies..."
                      value={data.currentSkills}
                      onChange={(e) => handleChange('currentSkills', e.target.value)}
                      rows={6}
                      className="text-base resize-none"
                    />
                    <p className="text-xs text-muted-foreground">Update with new skills you've acquired</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">🎯 Refined Goals:</span> Update your objectives to reflect your current aspirations.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals" className="text-base font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      Primary Goals & Objectives
                    </Label>
                    <Textarea
                      id="goals"
                      placeholder="What are your current career and personal development goals?"
                      value={data.goals}
                      onChange={(e) => handleChange('goals', e.target.value)}
                      rows={6}
                      className="text-base resize-none"
                    />
                    <p className="text-xs text-muted-foreground">Include career goals, skill targets, and impact aspirations</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline" className="text-base font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Target Timeline
                    </Label>
                    <Input
                      id="timeline"
                      placeholder="e.g., 18 months"
                      value={data.timeline}
                      onChange={(e) => handleChange('timeline', e.target.value)}
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-muted-foreground">When do you want to achieve these goals?</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivation" className="text-base font-semibold">
                      What motivates you?
                    </Label>
                    <Textarea
                      id="motivation"
                      placeholder="Share what drives you to achieve your goals..."
                      value={data.motivation}
                      onChange={(e) => handleChange('motivation', e.target.value)}
                      rows={4}
                      className="text-base resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">📚 Learning Style:</span> Update your preferences to get better-matched resources.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learningStyle" className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Preferred Learning Style
                    </Label>
                    <Textarea
                      id="learningStyle"
                      placeholder="How do you prefer to learn? (e.g., videos, hands-on, reading, mentorship)..."
                      value={data.learningStyle}
                      onChange={(e) => handleChange('learningStyle', e.target.value)}
                      rows={5}
                      className="text-base resize-none"
                    />
                    <p className="text-xs text-muted-foreground">E.g., video courses, reading, hands-on practice, mentorship</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weeklyHours" className="text-base font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Weekly Commitment
                    </Label>
                    <Input
                      id="weeklyHours"
                      placeholder="e.g., 10 hours per week"
                      value={data.weeklyHours}
                      onChange={(e) => handleChange('weeklyHours', e.target.value)}
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-muted-foreground">Hours per week for learning and development</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t">
                {step > 1 ? (
                  <Button variant="outline" onClick={handleBack} size="lg" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => navigate('/dashboard')} size="lg" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </Button>
                )}

                {step < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    size="lg"
                    className="gap-2 min-w-32"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepValid() || isSubmitting}
                    size="lg"
                    className="gap-2 min-w-40"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Regenerating Plan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save & Regenerate
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-card/50 backdrop-blur rounded-lg border border-border/50 text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Auto-Regenerate</h3>
              <p className="text-xs text-muted-foreground">Plan updates automatically with your changes</p>
            </div>
            <div className="p-4 bg-card/50 backdrop-blur rounded-lg border border-border/50 text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Fresh Recommendations</h3>
              <p className="text-xs text-muted-foreground">Get new tasks and resources tailored to you</p>
            </div>
            <div className="p-4 bg-card/50 backdrop-blur rounded-lg border border-border/50 text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Stay on Track</h3>
              <p className="text-xs text-muted-foreground">Keep your goals aligned with your progress</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EditProfile;
