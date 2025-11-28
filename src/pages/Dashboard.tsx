import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target, LogOut, TrendingUp, CheckCircle2, Award, Zap, BookOpen, Rocket,
  Users, Calendar, FileText, BarChart3, PieChart, Activity, Clock, Brain,
  Lightbulb, Star, ArrowUpRight, ArrowDownRight, Minus, Mail, Github, Linkedin,
  ExternalLink, MessageCircle, Globe2, Layers, GraduationCap, User
} from 'lucide-react';
import InterviewPreparation from '@/components/InterviewPreparation';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface Subtask {
  title: string;
  completed: boolean;
}

interface Task {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  completed: boolean;
  percentage: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  subtasks?: Subtask[];
  aiGenerated?: boolean;
}

interface Recommendation {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'certification' | 'network';
  relevance?: string;
  dismissed?: boolean;
  clicked?: boolean;
  aiGenerated?: boolean;
  // Enhanced metadata
  platform?: string;
  provider?: string;
  link?: string;
  format?: string;
  level?: string;
  duration?: string;
  price?: string;
  outcomes?: string[];
  bonuses?: string[];
  focusAreas?: string[];
  highlights?: string[];
  audience?: string;
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

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

interface CommunityHub {
  id: string;
  name: string;
  platform: string;
  format: string;
  audience: string;
  description: string;
  link: string;
  highlights: string[];
}

const communityHubs: CommunityHub[] = [
  {
    id: 'reddit-aws-cert',
    name: 'r/AWSCertifications',
    platform: 'Reddit',
    format: 'Async forum + AMAs',
    audience: 'Aspiring & certified AWS architects',
    description: 'Daily study threads, exam experience writeups, and resource swaps focused on AWS certifications.',
    link: 'https://www.reddit.com/r/AWSCertifications/',
    highlights: ['Exam debriefs', 'Study cohorts', 'Resource library'],
  },
  {
    id: 'reddit-cloud',
    name: 'r/aws',
    platform: 'Reddit',
    format: 'Architecture reviews',
    audience: 'Cloud engineers & builders',
    description: 'Share designs, troubleshoot deployments, and learn from weekly show-and-tell posts from AWS practitioners.',
    link: 'https://www.reddit.com/r/aws/',
    highlights: ['Design critiques', 'Launch feedback', 'News digests'],
  },
  {
    id: 'discord-freecodecamp',
    name: 'freeCodeCamp Cloud Guild',
    platform: 'Discord',
    format: 'Live chats + study rooms',
    audience: 'Hands-on learners & career switchers',
    description: 'Join Pomodoro study rooms, cloud challenge channels, and mentorship office hours to stay accountable.',
    link: 'https://discord.gg/freecodecamp',
    highlights: ['Pomodoro rooms', 'Mentor Q&A', 'Accountability pods'],
  },
  {
    id: 'cncf-slack',
    name: 'CNCF Slack #aws + #serverless',
    platform: 'Slack',
    format: 'Channel-based hub',
    audience: 'Platform, DevOps, and OSS maintainers',
    description: 'Tap into CNCF working groups, meetup announcements, and open-source collaboration threads.',
    link: 'https://slack.cncf.io/',
    highlights: ['Working groups', 'Meetup calendar', 'Open issues'],
  },
  {
    id: 'devto-cloud',
    name: 'Dev.to Cloud & Serverless',
    platform: 'Dev.to',
    format: 'Articles + discussions',
    audience: 'Writers & builders documenting journeys',
    description: 'Publish progress logs, get editorial feedback, and connect with readers who follow AWS career paths.',
    link: 'https://dev.to/t/cloud',
    highlights: ['Writing prompts', 'Peer edits', 'Signal boosting'],
  },
];

interface CourseOption {
  id: string;
  title: string;
  provider: string;
  format: string;
  level: string;
  duration: string;
  price: string;
  description: string;
  link: string;
  outcomes: string[];
  bonuses: string[];
}

const courseCatalog: CourseOption[] = [
  {
    id: 'educative-system-design',
    title: 'Grokking Advanced System Design',
    provider: 'Educative.io',
    format: 'Interactive lessons + visuals',
    level: 'Intermediate–Advanced',
    duration: '6-8 weeks',
    price: '$79/mo or $199 yearly',
    description: 'Deep dives into multi-region architectures, event-driven patterns, and tradeoff analysis with curated practice prompts.',
    link: 'https://www.educative.io/path/grokking-advanced-system-design',
    outcomes: ['Multi-region design drills', 'Capacity planning worksheets', 'Interview-ready diagrams'],
    bonuses: ['Downloadable templates', 'Weekly office hours', 'Progress analytics'],
  },
  {
    id: 'exponent-masterclass',
    title: 'Exponent System Design Masterclass',
    provider: 'Exponent',
    format: 'Live cohort + on-demand library',
    level: 'Mid/Senior ICs',
    duration: '4-week cohort',
    price: '$399 per seat',
    description: 'Instructor-led breakdowns of FAANG-style prompts with peer review, mock interviews, and personalized feedback.',
    link: 'https://www.tryexponent.com/courses/system-design',
    outcomes: ['Instructor feedback', 'Mock interview bank', 'Peer review circles'],
    bonuses: ['Community slack', 'Resume review', 'Lifetime recordings'],
  },
  {
    id: 'udacity-nanodegree',
    title: 'Udacity Cloud Developer Nanodegree',
    provider: 'Udacity',
    format: 'Project-based curriculum',
    level: 'Career switchers',
    duration: '4 months (10hrs/wk)',
    price: '$399/mo',
    description: 'Hands-on projects covering cloud-native APIs, observability, and deployment pipelines mapped to AWS Associate-level roles.',
    link: 'https://www.udacity.com/course/cloud-developer-nanodegree--nd9990',
    outcomes: ['Deployed capstone', 'Code reviews', 'Career services'],
    bonuses: ['1:1 mentor calls', 'GitHub portfolio audit', 'Hiring partner webinars'],
  },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState<Array<{ month: string; progress: number; tasksCompleted: number; hoursSpent: number }>>([]);
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; hours: number; tasks: number }>>([]);
  const [skillsData, setSkillsData] = useState<Array<{ skill: string; current: number; target: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isCertificationDialogOpen, setIsCertificationDialogOpen] = useState(false);
  const [isCommunityDialogOpen, setIsCommunityDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [isRecommendationDialogOpen, setIsRecommendationDialogOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
    loadRecommendations();
    fetchAnalytics();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.getTasks();

      if (response.success && response.data) {
        const tasksWithId = response.data.tasks.map(task => ({
          ...task,
          id: task._id || '',
          completed: task.completed ?? false,
          percentage: task.percentage ?? 0,
        }));
        setTasks(tasksWithId);
      } else {
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Using local fallback.",
        variant: "destructive",
      });
      // Fallback to generated tasks
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      const generatedTasks = generateTasks(onboardingData);
      setTasks(generatedTasks);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await api.getRecommendations({ dismissed: false });
      if (response.success && response.data) {
        const recsWithId = response.data.recommendations.map(rec => ({
          ...rec,
          id: rec._id || rec.title,
        }));
        setRecommendations(recsWithId);
      } else {
        // Fallback to localStorage
        const storedRecs = localStorage.getItem('userRecommendations');
        if (storedRecs) {
          setRecommendations(JSON.parse(storedRecs));
        } else {
          const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
          const generatedRecs = generateRecommendations(onboardingData);
          setRecommendations(generatedRecs);
          localStorage.setItem('userRecommendations', JSON.stringify(generatedRecs));
        }
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      // Fallback to localStorage
      const storedRecs = localStorage.getItem('userRecommendations');
      if (storedRecs) {
        setRecommendations(JSON.parse(storedRecs));
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.getAnalytics();
      if (response.success && response.data) {
        setProgressData(response.data.progressData);
        setWeeklyData(response.data.weeklyActivity);
        setSkillsData(response.data.skillsData);
        setCategoryData(response.data.categoryData);
        setCurrentStreak(response.data.overview.currentStreak);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Silently fail - analytics not critical for app functionality
    }
  };

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

  const toggleTask = async (taskId: string) => {
    try {
      const response = await api.toggleTaskCompletion(taskId);
      if (response.success && response.data) {
        const updatedTask = {
          ...response.data.task,
          id: response.data.task._id || taskId,
          completed: response.data.task.completed ?? false,
          percentage: response.data.task.percentage ?? 0,
        };
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
        toast({
          title: updatedTask.completed ? "Task Completed!" : "Task Uncompleted",
          description: updatedTask.title,
        });
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const updateTaskPercentage = async (taskId: string, percentage: number) => {
    try {
      const response = await api.updateTaskProgress(taskId, percentage);
      if (response.success && response.data) {
        const updatedTask = {
          ...response.data.task,
          id: response.data.task._id || taskId,
          completed: response.data.task.completed ?? false,
          percentage: response.data.task.percentage ?? 0,
        };
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      }
    } catch (error) {
      console.error('Error updating task progress:', error);
      toast({
        title: "Error",
        description: "Failed to update task progress",
        variant: "destructive",
      });
    }
  };

  const toggleSubtask = async (taskId: string, subtaskIndex: number) => {
    try {
      const response = await api.toggleSubtaskCompletion(taskId, subtaskIndex);
      if (response.success && response.data) {
        const updatedTask = {
          ...response.data.task,
          id: response.data.task._id || taskId,
          completed: response.data.task.completed ?? false,
          percentage: response.data.task.percentage ?? 0,
          subtasks: response.data.task.subtasks || [],
        };
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));

        // Refresh analytics to show updated progress
        fetchAnalytics();

        // Show toast only when all subtasks are completed
        if (updatedTask.completed && updatedTask.percentage === 100) {
          toast({
            title: "Task Completed!",
            description: `All subtasks for "${updatedTask.title}" are done!`,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
      toast({
        title: "Error",
        description: "Failed to update subtask",
        variant: "destructive",
      });
    }
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

  const handleRecommendationClick = async (rec: Recommendation) => {
    // Track click
    if (rec._id || rec.id) {
      try {
        await api.clickRecommendation(rec._id || rec.id!);
      } catch (error) {
        console.error('Error tracking recommendation click:', error);
      }
    }

    // If the recommendation has a link and detailed metadata, show the dynamic modal
    if (rec.link && rec.platform) {
      setSelectedRecommendation(rec);
      setIsRecommendationDialogOpen(true);
    } else {
      // Fallback to old hardcoded modals for legacy recommendations
      if (rec.title === 'AWS Solutions Architect Certification') {
        setIsCertificationDialogOpen(true);
      } else if (rec.title === 'Join Tech Communities') {
        setIsCommunityDialogOpen(true);
      } else if (rec.title === 'Advanced System Design Course') {
        setIsCourseDialogOpen(true);
      } else if (rec.link) {
        // If it has a link but no platform, just open it
        window.open(rec.link, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleDismissRecommendation = async (recId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    try {
      const response = await api.dismissRecommendation(recId);
      if (response.success) {
        setRecommendations(recommendations.filter(rec => (rec._id || rec.id) !== recId));
        toast({
          title: "Recommendation dismissed",
          description: "You can view dismissed items in your settings",
        });
      }
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      // Fallback: remove locally
      setRecommendations(recommendations.filter(rec => (rec._id || rec.id) !== recId));
      toast({
        title: "Recommendation dismissed",
        description: "Removed from your feed",
      });
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
                  <Button variant="outline" size="sm" onClick={() => {
                    logout();
                    navigate('/login');
                  }} className="gap-1 sm:gap-2">
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

            <Card className="border-2 bg-gradient-to-br from-accent/10 to-primary/10 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/edit-profile')}>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/20 rounded-xl">
                    <User className="h-8 w-8 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      Edit Profile
                      <Badge variant="secondary" className="text-xs">Update & Regenerate</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Update your details and regenerate your plan
                    </p>
                  </div>
                  <Brain className="h-5 w-5 text-accent opacity-50" />
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

          {/* Analytics Section */}
          <Card className="border-2 shadow-xl mt-4">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-lg sm:text-2xl flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <span className="truncate">Detailed Analytics</span>
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Track your progress and performance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="overview" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Progress</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Activity</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="gap-2">
                    <Brain className="h-4 w-4" />
                    <span className="hidden sm:inline">Skills</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-4">
                    {/* Progress Over Time */}
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Progress Trend
                        </CardTitle>
                        <CardDescription>Your journey over the last 6 months</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={progressData}>
                            <defs>
                              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis
                              dataKey="month"
                              stroke="currentColor"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis
                              stroke="currentColor"
                              style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                color: '#000'
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="progress"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorProgress)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Category Distribution */}
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-primary" />
                          Task Distribution
                        </CardTitle>
                        <CardDescription>Tasks by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RePieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={90}
                              fill="#8884d8"
                              dataKey="value"
                              stroke="#fff"
                              strokeWidth={2}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                color: '#000'
                              }}
                            />
                            <Legend />
                          </RePieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="progress" className="space-y-4">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Completion Rate & Hours
                      </CardTitle>
                      <CardDescription>Tasks completed and hours invested monthly</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={progressData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                          <XAxis
                            dataKey="month"
                            stroke="currentColor"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis
                            yAxisId="left"
                            stroke="currentColor"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="currentColor"
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              color: '#000'
                            }}
                          />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="tasksCompleted"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            name="Tasks Completed"
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="hoursSpent"
                            stroke="#10b981"
                            strokeWidth={3}
                            name="Hours Invested"
                            dot={{ fill: '#10b981', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Weekly Activity
                      </CardTitle>
                      <CardDescription>Your engagement this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                          <XAxis
                            dataKey="day"
                            stroke="currentColor"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis
                            stroke="currentColor"
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              color: '#000'
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="hours"
                            fill="#3b82f6"
                            name="Hours Spent"
                            radius={[8, 8, 0, 0]}
                          />
                          <Bar
                            dataKey="tasks"
                            fill="#10b981"
                            name="Tasks Completed"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="skills" className="space-y-4">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Skills Development
                      </CardTitle>
                      <CardDescription>Current level vs. target competency</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={skillsData}>
                          <PolarGrid stroke="rgba(128, 128, 128, 0.2)" />
                          <PolarAngleAxis
                            dataKey="skill"
                            stroke="currentColor"
                            style={{ fontSize: '12px' }}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            stroke="currentColor"
                            style={{ fontSize: '10px' }}
                          />
                          <Radar
                            name="Current Level"
                            dataKey="current"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.5}
                            strokeWidth={2}
                          />
                          <Radar
                            name="Target Level"
                            dataKey="target"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Legend />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              color: '#000'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card className="border-2 shadow-xl animate-slide-in-right mt-8">
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

                        {/* Progress Bar and Subtasks */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                            <span className="text-muted-foreground font-medium truncate">Progress</span>
                            <span className="font-bold text-foreground flex-shrink-0">{task.percentage}%</span>
                          </div>
                          <Progress value={task.percentage} className="h-2" />

                          {/* Subtasks */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-3 space-y-2 pl-2 border-l-2 border-primary/20">
                              {task.subtasks.map((subtask, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 group hover:bg-muted/30 p-1.5 rounded transition-colors"
                                >
                                  <Checkbox
                                    checked={subtask.completed}
                                    onCheckedChange={() => toggleSubtask(task.id, idx)}
                                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                                  />
                                  <span
                                    className={`text-xs sm:text-sm flex-1 ${
                                      subtask.completed
                                        ? 'text-muted-foreground line-through'
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {subtask.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
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
                    className="group p-3 sm:p-5 rounded-lg sm:rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 relative"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDismissRecommendation(rec._id || rec.id!, e)}
                    >
                      <span className="text-xs">✕</span>
                    </Button>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="text-2xl sm:text-3xl">{getTypeIcon(rec.type)}</span>
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-lg text-foreground group-hover:text-primary transition-colors break-words">
                          {rec.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words line-clamp-2">
                          {rec.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Badge variant="outline" className="capitalize text-xs">
                            {rec.type}
                          </Badge>
                          {rec.platform && (
                            <Badge variant="secondary" className="text-xs">
                              {rec.platform}
                            </Badge>
                          )}
                          {rec.price && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400">
                              {rec.price}
                            </Badge>
                          )}
                          {rec.level && (
                            <Badge variant="outline" className="text-xs bg-primary/5 border-primary/30">
                              {rec.level}
                            </Badge>
                          )}
                        </div>
                        {rec.link && (
                          <p className="text-xs text-primary flex items-center gap-1 mt-1">
                            <ExternalLink className="h-3 w-3" />
                            Click to view details
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interview Preparation Section */}
          <InterviewPreparation />

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

          {/* Footer */}
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

      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-left text-xl sm:text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              System Design Learning Paths
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Compare curated courses and enroll directly in the track that matches your schedule, budget, and preferred learning style.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {courseCatalog.map((course) => (
                <Card key={course.id} className="border-2 bg-card/95 flex flex-col h-full">
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base sm:text-lg text-foreground flex-1">
                        {course.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {course.provider}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs bg-primary/5 border-primary/30">
                        {course.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.duration}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-muted/60">
                        {course.format}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Key outcomes
                      </p>
                      <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-4">
                        {course.outcomes.map((outcome) => (
                          <li key={`${course.id}-${outcome}`}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Extras
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {course.bonuses.map((bonus) => (
                          <Badge
                            key={`${course.id}-${bonus}`}
                            variant="outline"
                            className="text-xs bg-accent/10 border-accent/30"
                          >
                            {bonus}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                      <span className="text-sm font-semibold text-primary">{course.price}</span>
                      <Button asChild variant="secondary" className="gap-2 text-sm">
                        <a href={course.link} target="_blank" rel="noreferrer" className="flex items-center">
                          Enroll now
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-dashed border-primary/40 bg-primary/5">
              <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center py-4">
                <div className="p-3 bg-background rounded-2xl">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    Stack your learning sprints
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Pair an interactive course with weekly mock design sessions in your community dialog to apply concepts immediately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCommunityDialogOpen} onOpenChange={setIsCommunityDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-left text-xl sm:text-2xl">
              <div className="p-2 bg-accent/10 rounded-lg">
                <MessageCircle className="h-5 w-5 text-accent" />
              </div>
              Community Launchpad
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Plug into real-time study buddies, architecture critiques, and in-person meetups tailored for AWS & open-source builders.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {communityHubs.map((community) => (
                <Card key={community.id} className="border-2 bg-card/95 flex flex-col h-full">
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base sm:text-lg text-foreground flex-1">
                        {community.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {community.platform}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs bg-accent/5 border-accent/30">
                        {community.format}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {community.audience}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {community.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {community.highlights.map((highlight) => (
                        <Badge
                          key={`${community.id}-${highlight}`}
                          variant="outline"
                          className="text-xs bg-primary/5 border-primary/30"
                        >
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild variant="outline" className="mt-auto gap-2 text-sm">
                      <a
                        href={community.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full"
                      >
                        Visit community
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-dashed border-accent/40 bg-accent/5">
              <CardContent className="flex flex-col gap-3 sm:gap-4 py-4 sm:flex-row sm:items-center">
                <div className="p-3 bg-background rounded-2xl">
                  <Globe2 className="h-6 w-6 text-accent" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    Blend async + live touchpoints
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Pair an always-on space (Reddit or Dev.to) with one live community (Discord or Slack) to keep support flowing 24/7.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dynamic Recommendation Detail Dialog */}
      <Dialog open={isRecommendationDialogOpen} onOpenChange={setIsRecommendationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2">
          {selectedRecommendation && (
            <>
              <DialogHeader className="space-y-2">
                <DialogTitle className="flex items-center gap-2 text-left text-xl sm:text-2xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-2xl">{getTypeIcon(selectedRecommendation.type)}</span>
                  </div>
                  {selectedRecommendation.title}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  {selectedRecommendation.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Resource Details Card */}
                <Card className="border-2 bg-card/95">
                  <CardContent className="pt-6 space-y-4">
                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-2">
                      {selectedRecommendation.platform && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedRecommendation.platform}
                        </Badge>
                      )}
                      {selectedRecommendation.level && (
                        <Badge variant="outline" className="text-xs bg-primary/5 border-primary/30">
                          {selectedRecommendation.level}
                        </Badge>
                      )}
                      {selectedRecommendation.duration && (
                        <Badge variant="outline" className="text-xs">
                          {selectedRecommendation.duration}
                        </Badge>
                      )}
                      {selectedRecommendation.format && (
                        <Badge variant="outline" className="text-xs bg-muted/60">
                          {selectedRecommendation.format}
                        </Badge>
                      )}
                      {selectedRecommendation.price && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400">
                          {selectedRecommendation.price}
                        </Badge>
                      )}
                    </div>

                    {/* Provider */}
                    {selectedRecommendation.provider && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Provider
                        </p>
                        <p className="text-sm text-foreground">{selectedRecommendation.provider}</p>
                      </div>
                    )}

                    {/* Audience */}
                    {selectedRecommendation.audience && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Best for
                        </p>
                        <p className="text-sm text-foreground">{selectedRecommendation.audience}</p>
                      </div>
                    )}

                    {/* Relevance */}
                    {selectedRecommendation.relevance && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Why this matches your goals
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">{selectedRecommendation.relevance}</p>
                      </div>
                    )}

                    {/* Outcomes */}
                    {selectedRecommendation.outcomes && selectedRecommendation.outcomes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          What you'll learn
                        </p>
                        <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-4">
                          {selectedRecommendation.outcomes.map((outcome, index) => (
                            <li key={index}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Focus Areas */}
                    {selectedRecommendation.focusAreas && selectedRecommendation.focusAreas.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Focus areas
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedRecommendation.focusAreas.map((area, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-accent/10 border-accent/30"
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Highlights */}
                    {selectedRecommendation.highlights && selectedRecommendation.highlights.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Community highlights
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedRecommendation.highlights.map((highlight, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-primary/5 border-primary/30"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bonuses */}
                    {selectedRecommendation.bonuses && selectedRecommendation.bonuses.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Bonus features
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedRecommendation.bonuses.map((bonus, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-accent/10 border-accent/30"
                            >
                              {bonus}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {selectedRecommendation.link && (
                      <Button asChild className="w-full gap-2 mt-4">
                        <a
                          href={selectedRecommendation.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center"
                        >
                          {selectedRecommendation.type === 'course' && 'Enroll now'}
                          {selectedRecommendation.type === 'certification' && 'View certification'}
                          {selectedRecommendation.type === 'network' && 'Join community'}
                          {selectedRecommendation.type === 'project' && 'Start building'}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Tips Card */}
                <Card className="border border-dashed border-primary/40 bg-primary/5">
                  <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center py-4">
                    <div className="p-3 bg-background rounded-2xl">
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm sm:text-base font-semibold text-foreground">
                        Pro tip
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Track your progress on this resource right in your GoalFlow dashboard by creating a task for it.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
