import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Brain, ChevronLeft, ChevronRight, CheckCircle2, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Question {
  question: string;
  type: 'mcq' | 'short';
  options?: string[];
  category: string;
  relatedTask: string;
}

interface InterviewQuestionsProps {
  questions: Question[];
  onSubmit: (answers: Array<{ questionIndex: number; userAnswer: string }>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const InterviewQuestions = ({ questions, onSubmit, onCancel, isLoading }: InterviewQuestionsProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = answers[currentQuestionIndex] || '';

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value,
    }));
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      toast({
        title: 'Answer Required',
        description: 'Please provide an answer before proceeding',
        variant: 'destructive',
      });
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const unansweredQuestions = questions
      .map((_, index) => index)
      .filter(index => !answers[index]?.trim());

    if (unansweredQuestions.length > 0) {
      toast({
        title: 'Incomplete Answers',
        description: `Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`,
        variant: 'destructive',
      });
      setCurrentQuestionIndex(unansweredQuestions[0]);
      return;
    }

    // Format answers for submission
    const formattedAnswers = questions.map((_, index) => ({
      questionIndex: index,
      userAnswer: answers[index],
    }));

    onSubmit(formattedAnswers);
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(key => answers[parseInt(key)]?.trim()).length;
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-2 bg-gradient-to-r from-accent/10 to-primary/10">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">Interview Practice Session</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length} • {getAnsweredCount()}/{questions.length} answered
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/30">
              {currentQuestion.category}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
            </Badge>
            {currentAnswer && (
              <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Answered
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl sm:text-2xl text-foreground leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
          {currentQuestion.relatedTask && (
            <CardDescription className="text-sm">
              Related to: {currentQuestion.relatedTask}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* MCQ Options */}
          {currentQuestion.type === 'mcq' && currentQuestion.options && (
            <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value={option} id={`option-${index}`} className="mt-1" />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Short Answer Input */}
          {currentQuestion.type === 'short' && (
            <div className="space-y-2">
              <Label htmlFor="short-answer" className="text-sm font-medium">
                Your Answer (2-3 sentences recommended)
              </Label>
              <Textarea
                id="short-answer"
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[150px] text-base"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {currentAnswer.length} characters
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit All Answers
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={isLoading}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? 'default' : answers[index]?.trim() ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className="w-10 h-10 p-0"
                disabled={isLoading}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewQuestions;
