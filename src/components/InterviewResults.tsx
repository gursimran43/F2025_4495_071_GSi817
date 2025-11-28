import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, CheckCircle2, XCircle, ChevronLeft, TrendingUp, Award } from 'lucide-react';

interface Answer {
  questionIndex: number;
  userAnswer: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
}

interface Question {
  question: string;
  type: 'mcq' | 'short';
  options?: string[];
  correctAnswer?: string;
  expectedKeywords?: string[];
  category: string;
  relatedTask: string;
}

interface Results {
  sessionId: string;
  totalScore: number;
  answers: Answer[];
  questions: Question[];
}

interface InterviewResultsProps {
  results: Results;
  onBack: () => void;
}

const InterviewResults = ({ results, onBack }: InterviewResultsProps) => {
  const { totalScore, answers, questions } = results;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalQuestions = questions.length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent Performance!';
    if (score >= 60) return 'Good Job!';
    if (score >= 40) return 'Keep Practicing!';
    return 'Room for Improvement';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400';
    if (score >= 60) return 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400';
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Overall Score Card */}
      <Card className="border-2 shadow-xl bg-gradient-to-br from-accent/10 via-card to-primary/10">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-background rounded-full">
                <Trophy className={`h-12 w-12 ${getScoreColor(totalScore)}`} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                {totalScore}%
              </h2>
              <Badge variant="outline" className={`text-base px-4 py-1 ${getScoreBadgeColor(totalScore)}`}>
                {getScoreMessage(totalScore)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{correctCount}/{totalQuestions}</p>
                <p className="text-sm text-muted-foreground mt-1">Correct Answers</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-accent">{Math.round(totalScore)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
              </div>
            </div>
            <Progress value={totalScore} className="h-3 max-w-md mx-auto" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Detailed Results
          </CardTitle>
          <CardDescription>
            Review your answers and learn from the feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => {
            const answer = answers.find(a => a.questionIndex === index);
            if (!answer) return null;

            return (
              <div
                key={index}
                className={`p-4 sm:p-5 rounded-xl border-2 ${
                  answer.isCorrect
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    answer.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {answer.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Question {index + 1}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-primary/5 border-primary/30">
                        {question.category}
                      </Badge>
                      <Badge variant={answer.isCorrect ? 'default' : 'destructive'} className="text-xs">
                        {answer.score}%
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg text-foreground leading-relaxed">
                      {question.question}
                    </h3>
                  </div>
                </div>

                {/* User Answer */}
                <div className="space-y-3 pl-0 sm:pl-12">
                  <div className="p-3 bg-card rounded-lg border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Your Answer:
                    </p>
                    <p className="text-sm text-foreground">{answer.userAnswer}</p>
                  </div>

                  {/* Correct Answer (for MCQ) */}
                  {question.type === 'mcq' && question.correctAnswer && !answer.isCorrect && (
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-1">
                        Correct Answer:
                      </p>
                      <p className="text-sm text-foreground">{question.correctAnswer}</p>
                    </div>
                  )}

                  {/* Expected Keywords (for short answers) */}
                  {question.type === 'short' && question.expectedKeywords && question.expectedKeywords.length > 0 && (
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase mb-2">
                        Key Concepts:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {question.expectedKeywords.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-blue-500/5">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                    <p className="text-xs font-semibold text-accent uppercase mb-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Feedback:
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{answer.feedback}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onBack} variant="outline" className="w-full sm:w-auto gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Button onClick={onBack} className="w-full sm:flex-1 gap-2">
          Try Another Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewResults;
