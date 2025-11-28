import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Award, Lock, ChevronRight } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import InterviewQuestions from './InterviewQuestions';
import InterviewResults from './InterviewResults';

interface InterviewPreparationProps {
  onStartInterview?: () => void;
}

const InterviewPreparation = ({ onStartInterview }: InterviewPreparationProps) => {
  const [canStartInterview, setCanStartInterview] = useState(false);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    checkAvailability();
    loadHistory();
  }, []);

  const checkAvailability = async () => {
    try {
      setIsLoading(true);
      const response = await api.checkInterviewAvailability();
      if (response.success && response.data) {
        setCanStartInterview(response.data.canStartInterview);
        setCompletedTasksCount(response.data.completedTasksCount);
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error checking interview availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to check interview availability',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.getInterviewHistory();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading interview history:', error);
    }
  };

  const handleStartInterview = async () => {
    try {
      setIsLoading(true);
      const response = await api.startInterview();
      if (response.success && response.data) {
        setSessionId(response.data.sessionId);
        setQuestions(response.data.questions);
        setShowQuestions(true);
        onStartInterview?.();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to start interview',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to start interview session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswers = async (answers: any[]) => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const response = await api.submitInterviewAnswers(sessionId, answers);
      if (response.success && response.data) {
        setResults(response.data);
        setShowQuestions(false);
        setShowResults(true);
        loadHistory(); // Refresh stats
        toast({
          title: 'Interview Completed!',
          description: `You scored ${response.data.totalScore}%!`,
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to submit answers',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit answers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    setShowQuestions(false);
    setShowResults(false);
    setSessionId(null);
    setQuestions([]);
    setResults(null);
    checkAvailability();
    loadHistory();
  };

  // Show questions view
  if (showQuestions && sessionId && questions.length > 0) {
    return (
      <InterviewQuestions
        questions={questions}
        onSubmit={handleSubmitAnswers}
        onCancel={handleBackToDashboard}
        isLoading={isLoading}
      />
    );
  }

  // Show results view
  if (showResults && results) {
    return (
      <InterviewResults
        results={results}
        onBack={handleBackToDashboard}
      />
    );
  }

  // Show preparation card (default view)
  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-accent/5 via-card to-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-lg sm:text-2xl flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg flex-shrink-0">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              <span className="truncate">Interview Preparation</span>
              <Badge variant="secondary" className="text-xs">AI Powered</Badge>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Practice interview questions based on your completed tasks
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-4">
          {/* Stats Display */}
          {stats && stats.totalAttempts > 0 && (
            <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.totalAttempts}</p>
                <p className="text-xs text-muted-foreground mt-1">Attempts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{stats.averageScore}%</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.bestScore}%</p>
                <p className="text-xs text-muted-foreground mt-1">Best Score</p>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="p-5 rounded-xl border-2 border-dashed border-accent/30 bg-accent/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className={`p-3 rounded-lg flex-shrink-0 ${canStartInterview ? 'bg-accent/20' : 'bg-muted'}`}>
                {canStartInterview ? (
                  <Brain className="h-8 w-8 text-accent" />
                ) : (
                  <Lock className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {canStartInterview
                    ? 'Ready to Start Interview Preparation?'
                    : 'Complete Tasks to Unlock'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {message}
                </p>
                {canStartInterview && (
                  <p className="text-sm text-accent font-medium">
                    We'll generate personalized interview questions based on your {completedTasksCount} completed task{completedTasksCount > 1 ? 's' : ''}!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleStartInterview}
            disabled={!canStartInterview || isLoading}
            className="w-full gap-2 h-12 text-base font-semibold"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Questions...
              </>
            ) : canStartInterview ? (
              <>
                Start Interview Preparation
                <ChevronRight className="h-5 w-5" />
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                Complete Tasks to Unlock
              </>
            )}
          </Button>

          {/* Features List */}
          {canStartInterview && (
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">10 Questions</p>
                  <p className="text-xs text-muted-foreground">Mix of MCQ and short answers</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">AI Evaluation</p>
                  <p className="text-xs text-muted-foreground">Instant feedback on your answers</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewPreparation;
