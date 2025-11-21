'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }

    if (!isLoading && isAuthenticated && requiredRole && user) {
      const hasRequiredRole = requiredRole.includes(user.role);
      if (!hasRequiredRole) {
        router.push('/admin/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router, requiredRole, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            Accès refusé
          </h2>
          <p className="text-stone-600">
            Vous n'avez pas les permissions nécessaires.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}