'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, X, Crown, UserCheck, User } from 'lucide-react';

interface PermissionModalData {
  title: string;
  message: string;
  requiredRoles: string;
  userRole: string;
}

export function GlobalPermissionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState<PermissionModalData | null>(null);

  useEffect(() => {
    const handlePermissionEvent = (event: CustomEvent<PermissionModalData>) => {
      setModalData(event.detail);
      setIsOpen(true);
    };

    // Listen for permission error events
    const handler = (e: Event) => {
      handlePermissionEvent(e as CustomEvent<PermissionModalData>);
    };

    window.addEventListener('show-permission-error', handler);
    
    return () => {
      window.removeEventListener('show-permission-error', handler);
    };
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setModalData(null);
  };

  // Map role names to display names and colors
  const getRoleConfig = (role: string) => {
    const roleConfigs: Record<string, { label: string; color: string; icon: any; description: string }> = {
      'super_admin': {
        label: 'Super Admin',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: Crown,
        description: 'Contrôle total'
      },
      'admin': {
        label: 'Administrateur',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: Shield,
        description: 'Gestion complète'
      },
      'manager': {
        label: 'Manager',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: UserCheck,
        description: 'Gestion opérationnelle'
      },
      'staff': {
        label: 'Staff',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: User,
        description: 'Accès limité'
      },
      'super_admin, admin, manager': {
        label: 'Manager ou supérieur',
        color: 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-300',
        icon: UserCheck,
        description: 'Gestionnaire minimum'
      },
      'admin, manager': {
        label: 'Manager minimum',
        color: 'bg-gradient-to-r from-blue-100 to-red-100 text-red-800 border-red-300',
        icon: UserCheck,
        description: 'Niveau gestion'
      },
    };

    return roleConfigs[role] || {
      label: role,
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: Lock,
      description: 'Rôle spécifique'
    };
  };

  if (!isOpen || !modalData) return null;

  const userRoleConfig = getRoleConfig(modalData.userRole);
  const requiredRoleConfig = getRoleConfig(modalData.requiredRoles);
  const UserRoleIcon = userRoleConfig.icon;
  const RequiredRoleIcon = requiredRoleConfig.icon;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeModal}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-linear-to-r from-red-500 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{modalData.title}</h2>
                <p className="text-red-100 text-sm opacity-90">Accès restreint</p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">
                {modalData.message}
              </p>
            </div>
          </div>
          
          {/* Role Comparison */}
          <div className="bg-linear-to-br from-stone-50 to-stone-100 border border-stone-200 rounded-xl p-5">
            <h3 className="text-stone-800 font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Niveau d'accès requis
            </h3>
            
            <div className="space-y-4">
              {/* Required Role */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${requiredRoleConfig.color.split(' ')[0]}`}>
                    <RequiredRoleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-stone-600">Rôle requis</div>
                    <div className="text-lg font-semibold text-stone-800">
                      {requiredRoleConfig.label}
                    </div>
                    <div className="text-xs text-stone-500">
                      {requiredRoleConfig.description}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                  Nécessaire
                </div>
              </div>
              
              {/* Current Role */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${userRoleConfig.color.split(' ')[0]}`}>
                    <UserRoleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-stone-600">Votre rôle</div>
                    <div className="text-lg font-semibold text-stone-800">
                      {userRoleConfig.label}
                    </div>
                    <div className="text-xs text-stone-500">
                      {userRoleConfig.description}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm font-semibold">
                  Actuel
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={closeModal}
              className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 rounded-xl font-semibold hover:bg-stone-50 transition-all duration-200"
            >
              Compris
            </button>
            <button
              onClick={() => window.location.href = '/admin/dashboard'}
              className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Retour au Dashboard
            </button>
          </div>
          
          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-stone-500">
              Contactez votre administrateur pour demander des permissions supplémentaires
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add these CSS animations to your global styles
const style = `
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}
`;