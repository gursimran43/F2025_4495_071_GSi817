import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, CheckCircle2, Zap, Users, Award, Clock, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            AI-Powered Goal Achievement Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Achieve Your Goals with
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> AI-Powered Planning</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Transform your ambitions into actionable steps. Get personalized goal plans and track your progress with intelligent recommendations.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/signup">
              <Button size="lg" className="h-14 px-10 text-lg group">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-foreground">50K+</div>
              <div className="text-sm text-muted-foreground">Goals Achieved</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-foreground">98%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you achieve your goals faster and more efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-8 space-y-4 hover:shadow-lg transition-all hover:scale-105 hover:border-primary/50 animate-scale-in">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground">AI-Generated Plans</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get intelligent, personalized action plans tailored to your goals and timeline. Our AI analyzes your objectives and creates a step-by-step roadmap to success.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 space-y-4 hover:shadow-lg transition-all hover:scale-105 hover:border-primary/50 animate-scale-in [animation-delay:100ms]">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground">Track Progress</h3>
              <p className="text-muted-foreground leading-relaxed">
                Mark tasks as complete and visualize your journey with detailed progress tracking. See how far you've come and stay motivated every step of the way.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 space-y-4 hover:shadow-lg transition-all hover:scale-105 hover:border-primary/50 animate-scale-in [animation-delay:200ms]">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground">Smart Recommendations</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive future opportunities and next steps based on your progress and achievements. Our AI learns from your success patterns to suggest optimal paths forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              How GoalFlow Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start achieving your goals in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground">Define Your Goal</h3>
              <p className="text-muted-foreground">
                Tell us what you want to achieve and we'll help you break it down into manageable steps
              </p>
            </div>

            <div className="relative text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground">Get Your Plan</h3>
              <p className="text-muted-foreground">
                Receive a personalized AI-generated action plan with prioritized tasks and milestones
              </p>
            </div>

            <div className="relative text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground">Track & Achieve</h3>
              <p className="text-muted-foreground">
                Complete tasks, track your progress, and celebrate your achievements along the way
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Why Choose GoalFlow?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of achievers who trust GoalFlow to reach their goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-xl p-8 space-y-4">
              <Users className="h-12 w-12 text-primary" />
              <h3 className="text-2xl font-semibold text-card-foreground">Community Driven</h3>
              <p className="text-muted-foreground">
                Join a community of ambitious individuals all working towards their dreams. Share experiences, get inspired, and stay motivated together.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 space-y-4">
              <Shield className="h-12 w-12 text-primary" />
              <h3 className="text-2xl font-semibold text-card-foreground">Privacy First</h3>
              <p className="text-muted-foreground">
                Your goals and progress are yours alone. We prioritize your privacy with enterprise-grade security and never share your data.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 space-y-4">
              <Clock className="h-12 w-12 text-primary" />
              <h3 className="text-2xl font-semibold text-card-foreground">Save Time</h3>
              <p className="text-muted-foreground">
                Stop spending hours planning. Our AI creates comprehensive action plans in seconds, so you can focus on doing instead of planning.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 space-y-4">
              <Award className="h-12 w-12 text-primary" />
              <h3 className="text-2xl font-semibold text-card-foreground">Proven Results</h3>
              <p className="text-muted-foreground">
                98% of our users report significant progress within the first month. Join them and start seeing real results in your goal achievement journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about GoalFlow
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                How does the AI generate goal plans?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our AI analyzes your goal, timeline, and current situation to create a personalized action plan. It breaks down your goal into manageable tasks, prioritizes them based on importance, and suggests a realistic timeline for completion.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                Is GoalFlow free to use?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! GoalFlow offers a free plan with access to core features including AI-generated plans, progress tracking, and smart recommendations. Premium features and advanced analytics are available in our paid plans.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                Can I track multiple goals at once?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely! You can create and track as many goals as you want. Our dashboard makes it easy to see all your goals at a glance and monitor progress across different areas of your life.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                How do I get recommendations?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                As you complete tasks and make progress, our AI automatically generates personalized recommendations for next steps, learning resources, and opportunities that align with your goals and achievements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                Can I modify the AI-generated plans?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! While our AI creates comprehensive plans, you have full control to customize, add, remove, or reorder tasks to fit your unique situation and preferences.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/20 rounded-3xl p-12 md:p-16 text-center space-y-8 animate-scale-in">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Ready to Achieve Your Goals?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of achievers who are making their dreams a reality with AI-powered goal planning.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="h-14 px-10 text-lg group">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">No credit card required • Free forever plan available</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
