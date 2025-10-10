import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

const Header = () => {
    return (
        <header className="border-b border-border bg-card">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    <span className="text-xl font-semibold text-foreground">GoalFlow</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login">
                        <Button variant="ghost">Log in</Button>
                    </Link>
                    <Link to="/signup">
                        <Button>Sign up</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
