'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/index';
import { useAuth } from '../../../context/AuthContext';
import { PermissionMatrix } from '../../../components/permission/PermissionMatrix';
import { useRolePermissions } from '../../../hooks/useRolePermissions';
import { Shield, Settings, User, Bell, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { rolePermissions, isLoading } = useRolePermissions();
  
  const [activeTab, setActiveTab] = useState('profile');
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Paramètres</h1>
          <p className="text-stone-600 mt-1">
            Gérer vos préférences et voir les permissions système
          </p>
        </div>
        
        {/* User Role Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full">
          <Shield className="w-4 h-4 text-stone-600" />
          <span className="text-sm font-medium text-stone-700 capitalize">
            {user?.role?.replace('_', ' ') || 'Utilisateur'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-white border-t border-x border-stone-200 text-amber-600'
                : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <User className="w-4 h-4" />
            Profil
          </button>
          
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'preferences'
                ? 'bg-white border-t border-x border-stone-200 text-amber-600'
                : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            Préférences
          </button>
          
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'permissions'
                  ? 'bg-white border-t border-x border-stone-200 text-amber-600'
                  : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Lock className="w-4 h-4" />
              Permissions
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'system'
                ? 'bg-white border-t border-x border-stone-200 text-amber-600'
                : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Système
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profil Utilisateur
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Votre nom complet"
                    defaultValue={user?.full_name || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="votre@email.com"
                    defaultValue={user?.email || ''}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Rôle
                  </label>
                  <div className="px-4 py-3 border border-stone-300 rounded-xl bg-stone-50">
                    <span className="text-stone-800 capitalize">
                      {user?.role?.replace('_', ' ') || 'Non défini'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Le rôle ne peut être modifié que par un Super Admin
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Préférences de Notification
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="font-medium text-stone-800">Notifications email</div>
                    <div className="text-sm text-stone-600">
                      Recevoir des notifications par email
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="font-medium text-stone-800">Notifications push</div>
                    <div className="text-sm text-stone-600">
                      Recevoir des notifications dans le navigateur
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                  <div>
                    <div className="font-medium text-stone-800">Mode sombre</div>
                    <div className="text-sm text-stone-600">
                      Activer le thème sombre automatiquement
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'permissions' && isSuperAdmin && (
          <div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                <p className="text-stone-600 mt-4">Chargement des permissions...</p>
              </div>
            ) : (
              <PermissionMatrix 
                rolePermissions={rolePermissions}
                currentUserRole={user?.role || ''}
              />
            )}
          </div>
        )}

        {activeTab === 'system' && isSuperAdmin && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres Système
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Nom du système
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Nour Distribution"
                    defaultValue="Nour Distribution"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Email de support
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="support@nourdistribution.com"
                    defaultValue="support@nourdistribution.com"
                  />
                </div>
                
                <div className="pt-4 border-t border-stone-200">
                  <h3 className="font-medium text-stone-800 mb-3">Options avancées</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500"
                        defaultChecked
                      />
                      <span className="text-sm text-stone-700">
                        Activer la journalisation détaillée
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-sm text-stone-700">
                        Forcer la double authentification
                      </span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500"
                        defaultChecked
                      />
                      <span className="text-sm text-stone-700">
                        Sauvegardes automatiques quotidiennes
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'system' && !isSuperAdmin && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-800 mb-2">
              Accès restreint
            </h3>
            <p className="text-stone-600 max-w-md mx-auto">
              Seul le Super Admin peut accéder aux paramètres système.
              Contactez votre administrateur pour plus d'informations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}