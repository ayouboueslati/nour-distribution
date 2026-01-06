'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Mail, Circle, Settings } from 'lucide-react';
import { GlobalPermissionModal } from '../../components/permission/GlobalPermissionModal';
import { NotificationProvider } from "../../lib/notifications";
import NotificationCenter from '../../components/ui/NotificationCenter';


const navigation = [
  { name: 'Tableau de Bord', href: '/admin/dashboard', icon: '📊' },
  { name: 'Utilisateurs', href: '/admin/users', icon: '👥', adminOnly: true },
  { name: 'Commandes', href: '/admin/orders', icon: '📋' },
  { name: 'Devis', href: '/admin/sales/devis', icon: '📄' },
  { name: 'Factures', href: '/admin/sales/factures', icon: '🧾' },
  { name: 'Avoirs', href: '/admin/sales/avoirs', icon: '💳' },
  { name: 'Clients', href: '/admin/clients', icon: '👥' },
  { name: 'Produits', href: '/admin/products', icon: '📦' },
  { name: 'Fournisseurs', href: '/admin/suppliers', icon: '🏭' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { name: 'Charges', href: '/admin/analytics/charges', icon: '💸' },
  { name: 'Mon Profil', href: '/admin/profile', icon: '👤' },
];

// Role badge colors
const roleColors = {
  super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
  admin: 'bg-red-100 text-red-800 border-red-200',
  manager: 'bg-blue-100 text-blue-800 border-blue-200',
  staff: 'bg-green-100 text-green-800 border-green-200',
};

// Role display names
const roleNames = {
  super_admin: 'Super Admin',
  admin: 'Administrateur',
  manager: 'Manager',
  staff: 'Staff',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // 🔓 Check if current route is the login page
  const isLoginPage = pathname === '/admin/login';

  // 🔒 SECURITY: Redirect if not authenticated (but allow login page)
  useEffect(() => {
    if (isLoading) return;

    if (isLoginPage) {
      if (isAuthenticated) {
        router.push('/admin/dashboard');
      }
      return;
    }

    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, pathname, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-stone-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // 🔓 If on login page, render it WITHOUT the admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 🔒 SECURITY: Don't render layout if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-stone-600">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-stone-200`}>
        <div className="flex flex-col h-full">
          {/* Enhanced Logo & User Info */}
          <div className="px-4 py-6 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
            <div className="text-center mb-6 animate-fade-in-down">
              <h1 className="text-2xl font-light text-stone-800 mb-1">Nour</h1>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Distribution</h2>
            </div>

            {/* Enhanced User Card */}
            <div className="glass bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up">
              <div className="flex items-start gap-3">
                {/* User Avatar with Status */}
                <div className="relative">
                  <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-stone-800 text-sm truncate">
                      {user?.full_name}
                    </h3>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-1 mb-2">
                    <Mail className="w-3 h-3 text-stone-400" />
                    <p className="text-xs text-stone-600 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Role Badge */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${roleColors[user?.role as keyof typeof roleColors] || roleColors.staff}`}>
                    <Circle className="w-2 h-2 mr-1 fill-current" />
                    {roleNames[user?.role as keyof typeof roleNames] || user?.role}
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-200/50">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-stone-500">En ligne</span>
                </div>
                <span className="text-xs text-stone-400">
                  {new Date().toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-105'
                    : 'text-stone-600 hover:bg-amber-50 hover:text-amber-700 hover:shadow-md'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={`mr-3 text-lg transition-transform duration-200 ${isActive ? 'transform scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer with Logout */}
          <div className="p-4 border-t border-stone-200 bg-white/50">
            <div className="space-y-2">
              {/* Settings Link */}
              <Link
                href="/admin/settings"
                className="flex items-center px-3 py-2 text-stone-600 hover:bg-stone-100 hover:text-stone-800 rounded-lg transition-all duration-200"
              >
                <Settings className="w-4 h-4 mr-3" />
                <span className="text-sm">Paramètres</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center w-full px-3 py-2 text-stone-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
              >
                <LogOut className="w-4 h-4 mr-3 transform group-hover:rotate-180 transition-transform duration-200" />
                <span className="text-sm">Déconnexion</span>
              </button>
            </div>

            {/* Footer Text */}
            <div className="mt-4 pt-4 border-t border-stone-200/50">
              <p className="text-xs text-center text-stone-400">
                Connecté en tant que<br />
                <span className="font-medium text-stone-600">{user?.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Fixed Notification Center - Top Right */}
        <div className="fixed top-4 right-4 z-[999] hidden lg:block">
          <NotificationCenter />
        </div>
        {/* Enhanced Mobile header */}
        <header className="bg-white shadow-sm border-b border-stone-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
            >
              <span className="text-xl">☰</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Notification Center */}
              <NotificationCenter />

              <div className="text-right">
                <p className="text-sm font-medium text-stone-800">{user?.full_name}</p>
                <p className="text-xs text-stone-500">{user?.email}</p>
              </div>
              <div className="w-8 h-8 bg-linear-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-stone-50">
          {children}
        </main>
      </div>
    </div>
  );
}