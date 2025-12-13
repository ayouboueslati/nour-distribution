'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../lib/api';
import { notificationService } from '../lib/notifications';
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    console.log('🔐 AuthProvider mounted - starting auth check');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔄 Starting authentication check...');

    // Client-side only
    if (typeof window === 'undefined') {
      console.log('🚫 Server-side rendering, skipping auth check');
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    console.log('📝 Token from localStorage:', token ? 'Found' : 'Not found');

    if (!token) {
      console.log('❌ No token found, user is not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🌐 Making API call to verify token...');
      const userData = await apiService.getCurrentUser({ skipGlobalErrorHandler: true });
      console.log('✅ User authenticated:', userData.email);
      setUser(userData);
    } catch (error) {
      console.error('💥 Auth check failed:', error);
      localStorage.removeItem('access_token');
    } finally {
      console.log('🏁 Auth check completed');
      setIsLoading(false);
    }
  };

  // Update your AuthContext login method
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Login attempt for:', email);

    try {
      const data = await apiService.login(email, password);
      console.log('✅ Login successful, token received');
      localStorage.setItem('access_token', data.access_token);

      // Get user data
      const userData = await apiService.getCurrentUser();
      console.log('👤 User data retrieved:', userData.email);
      setUser(userData);

      // Show success notification
      notificationService.success(
        'Connexion réussie',
        `Bienvenue ${userData.full_name || userData.email}!`
      );
      return true;
    } catch (error: any) {
      console.error('💥 Login failed:', error);

      // Show error notification
      if (error.message.includes('401')) {
        notificationService.error(
          'Échec de connexion',
          'Email ou mot de passe incorrect'
        );
      } else {
        notificationService.error(
          'Erreur de connexion',
          error.message || 'Impossible de se connecter'
        );
      }
      return false;
    }
  };

  // And logout method
  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('access_token');
    setUser(null);

    // Show notification
    notificationService.info(
      'Déconnexion',
      'Vous avez été déconnecté avec succès'
    );

    router.push('/admin/login');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  console.log('🎯 AuthProvider value:', {
    user: user?.email,
    isLoading,
    isAuthenticated: !!user
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}