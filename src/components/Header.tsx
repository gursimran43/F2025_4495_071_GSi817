import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="border-b border-border bg-card">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    <span className="text-xl font-semibold text-foreground">GoalFlow</span>
                </Link>
                <div className="flex items-center gap-3">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{user.name || user.email}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/dashboard">Dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/resume-builder">Resume Builder</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost">Log in</Button>
                            </Link>
                            <Link to="/signup">
                                <Button>Sign up</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
