import { Target, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-border bg-card">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Target className="h-6 w-6 text-primary" />
                            <span className="text-xl font-semibold text-foreground">GoalFlow</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Transform your ambitions into achievements with AI-powered goal planning and tracking.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="h-9 w-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-9 w-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-9 w-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                                <Github className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">GDPR</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2025 GoalFlow. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">Status</a>
                        <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
