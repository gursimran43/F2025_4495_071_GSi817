import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Target, LogOut, TrendingUp, CheckCircle2, Award, Zap, BookOpen, Rocket, Users, Calendar, Mail, Github, Linkedin, FileText, ExternalLink } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  percentage: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'certification' | 'network';
}

interface CertificationPath {
  id: string;
  name: string;
  description: string;
  platform: string;
  level: string;
  duration: string;
  link: string;
  focusAreas: string[];
}

const certificationPaths: CertificationPath[] = [
  {
    id: 'aws-saa',
    name: 'AWS Certified Solutions Architect – Associate',
    description: 'Design resilient architectures, secure workloads, and choose the right AWS services for scalable systems.',
    platform: 'AWS Skill Builder',
    level: 'Intermediate',
    duration: '3-4 months',
    link: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    focusAreas: ['Resilience', 'Security', 'Cost Optimization'],
  },
  {
    id: 'aws-sap',
    name: 'AWS Certified Solutions Architect – Professional',
    description: 'Validate advanced expertise in designing multi-account AWS ecosystems and migrating enterprise workloads.',
    platform: 'AWS Certification Portal',
    level: 'Advanced',
    duration: '4-6 months',
    link: 'https://aws.amazon.com/certification/certified-solutions-architect-professional/',
    focusAreas: ['Enterprise Design', 'Migration', 'Automation'],
  },
  {
    id: 'aws-cloud-quest',
    name: 'AWS Cloud Quest: Solutions Architect',
    description: 'Gamified, hands-on labs that simulate client engagements so you can design and deliver solutions end-to-end.',
    platform: 'AWS Skill Builder Labs',
    level: 'Hands-on',
    duration: 'Self-paced',
    link: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/11545/aws-cloud-quest-solutions-architect',
    focusAreas: ['Hands-on Labs', 'Client Briefs', 'Automation'],
  },
  {
    id: 'aws-well-architected',
    name: 'AWS Well-Architected Pro',
    description: 'Master the AWS Well-Architected pillars and learn how to run formal workload reviews with stakeholders.',
    platform: 'AWS Partner Training',
    level: 'Advanced',
    duration: '2-3 months',
    link: 'https://aws.amazon.com/training/learn-about/well-architected/',
    focusAreas: ['Operational Excellence', 'Reliability', 'Performance'],
  },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isCertificationDialogOpen, setIsCertificationDialogOpen] = useState(false);

  useEffect(() => {
    // Generate AI tasks based on onboarding data
    const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    const storedTasks = localStorage.getItem('userTasks');

    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      // Migrate old tasks to include percentage field
      const migratedTasks = parsedTasks.map((task: Task) => ({
        ...task,
        percentage: task.percentage ?? (task.completed ? 100 : 0)
      }));
      setTasks(migratedTasks);
      localStorage.setItem('userTasks', JSON.stringify(migratedTasks));
    } else {
      const generatedTasks = generateTasks(onboardingData);
      setTasks(generatedTasks);
      localStorage.setItem('userTasks', JSON.stringify(generatedTasks));
    }

    const storedRecs = localStorage.getItem('userRecommendations');
    if (storedRecs) {
      setRecommendations(JSON.parse(storedRecs));
    } else {
      const generatedRecs = generateRecommendations(onboardingData);
      setRecommendations(generatedRecs);
      localStorage.setItem('userRecommendations', JSON.stringify(generatedRecs));
    }
  }, []);

  const generateTasks = (data: any): Task[] => {
    const baseId = Date.now();
    return [
      {
        id: `${baseId}-1`,
        title: 'Set up daily learning routine',
        description: 'Dedicate 1-2 hours daily for skill development',
        completed: false,
        percentage: 0,
        priority: 'high',
        category: 'Foundation',
      },
      {
        id: `${baseId}-2`,
        title: 'Create a portfolio website',
        description: 'Showcase your current skills and projects',
        completed: false,
        percentage: 0,
        priority: 'high',
        category: 'Portfolio',
      },
      {
        id: `${baseId}-3`,
        title: 'Complete advanced course in your field',
        description: 'Enroll in a structured learning program',
        completed: false,
        percentage: 0,
        priority: 'high',
        category: 'Learning',
      },
      {
        id: `${baseId}-4`,
        title: 'Build 3 portfolio projects',
        description: 'Create projects that demonstrate your target skills',
        completed: false,
        percentage: 0,
        priority: 'medium',
        category: 'Projects',
      },
      {
        id: `${baseId}-5`,
        title: 'Network with industry professionals',
        description: 'Connect with 10+ people in your target role',
        completed: false,
        percentage: 0,
        priority: 'medium',
        category: 'Networking',
      },
      {
        id: `${baseId}-6`,
        title: 'Contribute to open source projects',
        description: 'Make meaningful contributions to 2-3 projects',
        completed: false,
        percentage: 0,
        priority: 'medium',
        category: 'Experience',
      },
      {
        id: `${baseId}-7`,
        title: 'Write technical blog posts',
        description: 'Share your learning through 5+ blog posts',
        completed: false,
        percentage: 0,
        priority: 'low',
        category: 'Content',
      },
      {
        id: `${baseId}-8`,
        title: 'Obtain relevant certification',
        description: 'Get certified in your target technology',
        completed: false,
        percentage: 0,
        priority: 'medium',
        category: 'Certification',
      },
    ];
  };

  const generateRecommendations = (data: any): Recommendation[] => {
    return [
      {
        id: '1',
        title: 'Advanced System Design Course',
        description: 'Master distributed systems and scalability patterns',
        type: 'course',
      },
      {
        id: '2',
        title: 'Build a Microservices Project',
        description: 'Create a real-world application using microservices architecture',
        type: 'project',
      },
      {
        id: '3',
        title: 'AWS Solutions Architect Certification',
        description: 'Validate your cloud architecture skills',
        type: 'certification',
      },
      {
        id: '4',
        title: 'Join Tech Communities',
        description: 'Engage with developer communities and attend meetups',
        type: 'network',
      },
    ];
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed, percentage: !task.completed ? 100 : task.percentage } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('userTasks', JSON.stringify(updatedTasks));
  };

  const updateTaskPercentage = (taskId: string, percentage: number) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, percentage, completed: percentage === 100 } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('userTasks', JSON.stringify(updatedTasks));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalPercentage = tasks.reduce((sum, task) => sum + task.percentage, 0);
  const progress = tasks.length > 0 ? (totalPercentage / tasks.length) : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'low':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return '📚';
      case 'project':
        return '🚀';
      case 'certification':
        return '🏆';
      case 'network':
        return '🤝';
      default:
        return '💡';
    }
  };

  const handleRecommendationClick = (rec: Recommendation) => {
    if (rec.title === 'AWS Solutions Architect Certification') {
      setIsCertificationDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg sm:rounded-xl flex-shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block truncate">
                  GoalFlow
                </span>
                <p className="text-xs text-muted-foreground hidden sm:block">Your Success Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {user ? (
                <>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">Keep pushing forward! 🚀</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout} className="gap-1 sm:gap-2">
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <Card className="border-2 bg-gradient-to-br from-primary/10 to-accent/10 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/resume-builder')}>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      Resume Builder
                      <Badge variant="secondary" className="text-xs">AI Powered</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a professional resume with AI assistance
                    </p>
                  </div>
                  <Rocket className="h-5 w-5 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-accent/10 to-primary/10 hover:shadow-lg transition-all">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/20 rounded-xl">
                    <Zap className="h-8 w-8 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      Quick Actions
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Access your tools and features
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4 sm:pt-6 pb-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 w-full">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Progress</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{Math.round(progress)}%</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4 sm:pt-6 pb-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 w-full">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Completed</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{completedCount}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4 sm:pt-6 pb-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 w-full">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">In Progress</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{tasks.length - completedCount}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg flex-shrink-0">
                    <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4 sm:pt-6 pb-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 w-full">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Tasks</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{tasks.length}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg flex-shrink-0">
                    <Award className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <Card className="border-2 shadow-xl animate-slide-in-right">
            <CardHeader className="space-y-3 sm:space-y-1 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <span className="truncate">Your Journey Progress</span>
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    You're doing amazing! Keep up the momentum 🎉
                  </CardDescription>
                </div>
                <div className="flex sm:block justify-between sm:text-right bg-muted/50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                  <p className="text-xs sm:text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">7 days 🔥</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 pt-2">
              <div className="space-y-3">
                <div className="flex justify-between items-baseline text-sm gap-2">
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm">Overall Completion</span>
                  <span className="font-bold text-foreground text-base sm:text-lg">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-3 sm:h-4" />
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground gap-2">
                  <span className="truncate">{completedCount} completed</span>
                  <span className="truncate">{tasks.length - completedCount} remaining</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t">
                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-primary">{completedCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Done</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-accent">{Math.round(progress)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Progress</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{tasks.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-2xl flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <span className="truncate">Your Action Plan</span>
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    AI-generated personalized roadmap
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 w-full sm:w-auto flex-shrink-0">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Schedule</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-3 sm:space-y-4">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${task.completed
                      ? 'bg-muted/30 border-border/50'
                      : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-2 sm:gap-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1 sm:mt-1.5 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                      />
                      <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4
                              className={`font-semibold text-sm sm:text-lg break-words ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                                }`}
                            >
                              {task.title}
                            </h4>
                            <p className={`text-xs sm:text-sm break-words ${task.completed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                              {task.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-shrink-0">
                            <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                              {task.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Percentage Slider */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                            <span className="text-muted-foreground font-medium truncate">Progress</span>
                            <span className="font-bold text-foreground flex-shrink-0">{task.percentage}%</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Slider
                              value={[task.percentage]}
                              onValueChange={(value) => updateTaskPercentage(task.id, value[0])}
                              max={100}
                              step={5}
                              className="flex-1"
                            />
                            {task.completed && (
                              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-lg sm:text-2xl flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <span className="truncate">Recommended Steps</span>
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Curated opportunities to accelerate growth
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRecommendationClick(rec)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleRecommendationClick(rec);
                      }
                    }}
                    className="group p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="text-2xl sm:text-3xl">{getTypeIcon(rec.type)}</span>
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-lg text-foreground group-hover:text-primary transition-colors break-words">
                          {rec.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                          {rec.description}
                        </p>
                        <Badge variant="outline" className="mt-2 capitalize text-xs">
                          {rec.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Motivation Section */}
          <Card className="border-2 shadow-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
            <CardContent className="pt-5 sm:pt-6 pb-5 sm:pb-6">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 sm:p-4 bg-background rounded-full">
                    <Award className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground px-4">
                    You're Making Great Progress!
                  </h3>
                  <p className="text-xs sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
                    Remember, every expert was once a beginner. Stay consistent, embrace challenges, and celebrate small wins along the way.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-2 px-4">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto text-sm">
                    <Users className="h-4 w-4" />
                    Join Community
                  </Button>
                  <Button className="gap-2 w-full sm:w-auto text-sm">
                    <Zap className="h-4 w-4" />
                    Share Progress
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg font-bold text-foreground">GoalFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering individuals to achieve their goals through personalized action plans and AI-powered insights.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="p-2 bg-muted rounded-lg hover:bg-primary/10 transition-colors">
                  <Github className="h-4 w-4 text-foreground" />
                </a>
                <a href="#" className="p-2 bg-muted rounded-lg hover:bg-primary/10 transition-colors">
                  <Linkedin className="h-4 w-4 text-foreground" />
                </a>
                <a href="#" className="p-2 bg-muted rounded-lg hover:bg-primary/10 transition-colors">
                  <Mail className="h-4 w-4 text-foreground" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 GoalFlow. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ for ambitious achievers
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={isCertificationDialogOpen} onOpenChange={setIsCertificationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-left text-xl sm:text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="h-5 w-5 text-primary" />
              </div>
              AWS Solutions Architect Playbook
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Choose the certification path that matches your experience, then jump directly to the official AWS learning hub.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {certificationPaths.map((cert) => (
                <Card key={cert.id} className="border-2 h-full flex flex-col bg-card/95">
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base sm:text-lg text-foreground flex-1">
                        {cert.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {cert.level}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs bg-primary/5 border-primary/30">
                        {cert.duration}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {cert.platform}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {cert.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cert.focusAreas.map((area) => (
                        <Badge
                          key={`${cert.id}-${area}`}
                          variant="outline"
                          className="text-xs bg-accent/10 border-accent/30"
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild variant="secondary" className="mt-auto gap-2 text-sm">
                      <a
                        href={cert.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full"
                      >
                        Go to platform
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-dashed border-primary/40 bg-primary/5">
              <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center py-4">
                <div className="p-3 bg-background rounded-2xl">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    Prep smarter with hands-on labs
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Pair these certifications with 1-2 hours of lab time per day and keep track of milestones right inside your GoalFlow dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
