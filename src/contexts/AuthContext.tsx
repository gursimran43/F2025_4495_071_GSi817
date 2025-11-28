import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  onboardingComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  setAuthData: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.getMe();
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const { user: userData, token } = response.data;
      setUser(userData);
      localStorage.setItem('token', token);

      toast({
        title: 'Welcome back!',
        description: response.message || 'Login successful',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      const response = await api.signup(email, password, name);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Signup failed');
      }

      const { user: userData, token } = response.data;
      setUser(userData);
      localStorage.setItem('token', token);

      toast({
        title: 'Account created!',
        description: response.message || 'User registered successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      toast({
        title: 'Signup failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await api.updateProfile(userData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Update failed');
      }

      setUser(response.data.user);

      toast({
        title: 'Profile updated',
        description: response.message || 'Profile updated successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      toast({
        title: 'Update failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const setAuthData = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export type { User };