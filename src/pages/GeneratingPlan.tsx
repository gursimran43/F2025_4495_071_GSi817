import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Target, Trophy, Zap, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const GeneratingPlan = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { icon: Target, text: "Analyzing your goals...", duration: 1500 },
        { icon: Zap, text: "Creating personalized roadmap...", duration: 1800 },
        { icon: Trophy, text: "Setting up milestones...", duration: 1500 },
        { icon: Sparkles, text: "Finalizing your plan...", duration: 1200 }
    ];

    useEffect(() => {
        let stepIndex = 0;
        let progressValue = 0;
        const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

        const progressInterval = setInterval(() => {
            progressValue += 1;
            setProgress(progressValue);

            if (progressValue >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => navigate('/dashboard'), 500);
            }
        }, totalDuration / 100);

        const stepInterval = setInterval(() => {
            if (stepIndex < steps.length - 1) {
                stepIndex++;
                setCurrentStep(stepIndex);
            }
        }, totalDuration / steps.length);

        return () => {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
        };
    }, [navigate]);

    const StepIcon = steps[currentStep].icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-2xl space-y-8 animate-fade-in relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Target className="h-10 w-10 text-primary" />
                    </div>
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        GoalFlow
                    </span>
                </div>

                {/* Main Card */}
                <div className="bg-card/80 backdrop-blur-lg border-2 border-border rounded-2xl p-12 shadow-2xl">
                    {/* Animated Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative p-6 bg-primary/10 rounded-full border-2 border-primary/20">
                                <StepIcon className="h-16 w-16 text-primary animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Current Step Text */}
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl font-bold text-foreground">
                            {steps[currentStep].text}
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            This will only take a moment
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-4">
                        <Progress value={progress} className="h-3" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Processing...</span>
                            <span className="font-semibold text-primary">{progress}%</span>
                        </div>
                    </div>

                    {/* Steps List */}
                    <div className="mt-12 space-y-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <div
                                    key={index}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${isCurrent ? 'bg-primary/10 border border-primary/20' : ''
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Icon className={`h-5 w-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                                    )}
                                    <span className={`text-sm ${isCompleted || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                                        }`}>
                                        {step.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Text */}
                <p className="text-center text-sm text-muted-foreground">
                    Our AI is crafting a personalized experience just for you
                </p>
            </div>
        </div>
    );
};

export default GeneratingPlan;
