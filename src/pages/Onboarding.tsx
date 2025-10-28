import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, User, Briefcase, Trophy, Clock, Sparkles, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

const Onboarding = () => {
  const [step, setStep] = useState(1);
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
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

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

  const handleSubmit = () => {
    // Save onboarding data
    localStorage.setItem('onboardingData', JSON.stringify(data));
    if (updateUser) {
      updateUser({ name: data.name, onboardingComplete: true });
    }
    navigate('/generating-plan');
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
                <Target className="h-8 w-8 text-primary" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GoalFlow
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Welcome to Your Journey
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Let's personalize your experience and create a roadmap to achieve your goals
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
                    {step === 2 && 'Your Goals & Timeline'}
                    {step === 3 && 'Skills & Experience'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {step === 1 && 'Tell us about yourself to get started'}
                    {step === 2 && 'Define what success looks like for you'}
                    {step === 3 && 'Help us understand your current skill level'}
                  </CardDescription>
                </div>
                <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20">
                  {step === 1 && <User className="h-8 w-8 text-primary" />}
                  {step === 2 && <Trophy className="h-8 w-8 text-primary" />}
                  {step === 3 && <Sparkles className="h-8 w-8 text-primary" />}
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
                      <span className="font-semibold text-foreground">💡 Why we ask:</span> This helps us create a personalized experience tailored to your career stage and aspirations.
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
                      <span className="font-semibold text-foreground">💼 Your Background:</span> Understanding your experience helps us tailor recommendations to your level.
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
                      placeholder="Example: Project management, Agile/Scrum methodologies, stakeholder communication, data analysis (SQL, Excel), team leadership, roadmap planning..."
                      value={data.currentSkills}
                      onChange={(e) => handleChange('currentSkills', e.target.value)}
                      rows={6}
                      className="text-base resize-none"
                    />
                    <p className="text-xs text-muted-foreground">List technical skills, soft skills, certifications, and key competencies</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">🎯 Be specific:</span> Clear goals help us create actionable steps and measure your progress effectively.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals" className="text-base font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      Primary Goals & Objectives
                    </Label>
                    <Textarea
                      id="goals"
                      placeholder="Example: Transition into a VP of Product role within my organization, build expertise in AI/ML product development, expand my professional network with C-suite executives, and mentor emerging product leaders..."
                      value={data.goals}
                      onChange={(e) => handleChange('goals', e.target.value)}
                      rows={6}
                      className="text-base resize-none"
                    />
                    <p className="text-xs text-muted-foreground">Include career goals, skill development targets, and the impact you want to create</p>
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
                      placeholder="Example: I want to make a bigger impact on product strategy and company direction. I'm driven by solving complex problems and helping others grow..."
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
                      <span className="font-semibold text-foreground">📚 Personalized Learning:</span> Your preferences help us recommend the most effective resources and schedule for you.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learningStyle" className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Preferred Learning Style
                    </Label>
                    <Textarea
                      id="learningStyle"
                      placeholder="Example: I learn best through hands-on projects and practical applications. I prefer video tutorials over reading documentation, and I like to learn with others in study groups..."
                      value={data.learningStyle}
                      onChange={(e) => handleChange('learningStyle', e.target.value)}
                      rows={5}
                      className="text-base resize-none"
                    />
                    <p className="text-xs text-muted-foreground">E.g., video courses, reading, hands-on practice, mentorship, group learning</p>
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
                    <p className="text-xs text-muted-foreground">How many hours per week can you dedicate to learning and development?</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t">
                {step > 1 ? (
                  <Button variant="outline" onClick={handleBack} size="lg" className="gap-2">
                    Back
                  </Button>
                ) : (
                  <div></div>
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
                    disabled={!isStepValid()}
                    size="lg"
                    className="gap-2 min-w-40"
                  >
                    Complete Setup
                    <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-card/50 backdrop-blur rounded-lg border border-border/50 text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Personalized Plan</h3>
              <p className="text-xs text-muted-foreground">AI-generated roadmap tailored to your goals</p>
            </div>
            <div className="p-4 bg-card/50 backdrop-blur rounded-lg border border-border/50 text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Track Progress</h3>
              <p className="text-xs text-muted-foreground">Monitor your achievements and milestones</p>
            </div>
            <div className="p-4 bg-card/50 backdrop-blur rounded-lg border border-border/50 text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Smart Recommendations</h3>
              <p className="text-xs text-muted-foreground">Get insights based on your progress</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Onboarding;
