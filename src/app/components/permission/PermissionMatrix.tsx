'use client';

import { Shield, Lock, Check, X, Crown, UserCheck, User, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface PermissionMatrixProps {
  rolePermissions: Record<string, string[]>;
  currentUserRole: string;
}

// Permission categories for better organization
const PERMISSION_CATEGORIES = {
  'Gestion des Utilisateurs': [
    'view_users',
    'create_users',
    'edit_users', 
    'delete_users',
    'manage_admins',
    'reset_passwords',
    'deactivate_users'
  ],
  'Gestion des Produits': [
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'import_products',
    'export_products'
  ],
  'Gestion des Catégories': [
    'view_categories',
    'manage_categories'
  ],
  'Gestion des Stocks': [
    'view_inventory',
    'manage_inventory',
    'adjust_stock',
    'view_inventory_movements'
  ],
  'Gestion des Fournisseurs': [
    'view_suppliers',
    'create_suppliers',
    'edit_suppliers',
    'delete_suppliers'
  ],
  'Gestion des Commandes': [
    'view_orders',
    'create_orders',
    'edit_orders',
    'delete_orders',
    'cancel_orders'
  ],
  'Gestion des Clients': [
    'view_clients',
    'manage_clients'
  ],
  'Analytique & Rapports': [
    'view_analytics',
    'view_reports',
    'export_reports',
    'view_financial_data'
  ],
  'Paramètres Système': [
    'view_settings',
    'edit_settings',
    'manage_system'
  ]
};

// Role display configuration
const ROLE_CONFIG = {
  super_admin: {
    label: 'Super Admin',
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    icon: Crown,
    description: 'Contrôle total du système'
  },
  admin: {
    label: 'Administrateur',
    color: 'bg-gradient-to-r from-red-500 to-red-600',
    icon: Shield,
    description: 'Gestion complète opérationnelle'
  },
  manager: {
    label: 'Manager',
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    icon: UserCheck,
    description: 'Gestion opérationnelle'
  },
  staff: {
    label: 'Staff',
    color: 'bg-gradient-to-r from-green-500 to-green-600',
    icon: User,
    description: 'Accès de base'
  }
};

// Permission descriptions
const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  // User Management
  'view_users': 'Voir la liste des utilisateurs',
  'create_users': 'Créer de nouveaux utilisateurs',
  'edit_users': 'Modifier les informations des utilisateurs',
  'delete_users': 'Supprimer définitivement des utilisateurs',
  'manage_admins': 'Gérer les autres administrateurs',
  'reset_passwords': 'Réinitialiser les mots de passe',
  'deactivate_users': 'Désactiver/reactiver des comptes',
  
  // Product Management
  'view_products': 'Voir la liste des produits',
  'create_products': 'Ajouter de nouveaux produits',
  'edit_products': 'Modifier les produits existants',
  'delete_products': 'Supprimer définitivement des produits',
  'import_products': 'Importer des produits en masse',
  'export_products': 'Exporter la liste des produits',
  
  // Category Management
  'view_categories': 'Voir les catégories',
  'manage_categories': 'Gérer les catégories (créer/modifier/supprimer)',
  
  // Inventory Management
  'view_inventory': 'Voir les niveaux de stock',
  'manage_inventory': 'Gérer les mouvements de stock',
  'adjust_stock': 'Ajuster manuellement les stocks',
  'view_inventory_movements': 'Voir l\'historique des mouvements',
  
  // Supplier Management
  'view_suppliers': 'Voir la liste des fournisseurs',
  'create_suppliers': 'Ajouter de nouveaux fournisseurs',
  'edit_suppliers': 'Modifier les fournisseurs',
  'delete_suppliers': 'Supprimer des fournisseurs',
  
  // Order Management
  'view_orders': 'Voir toutes les commandes',
  'create_orders': 'Créer de nouvelles commandes',
  'edit_orders': 'Modifier les commandes existantes',
  'delete_orders': 'Supprimer définitivement des commandes',
  'cancel_orders': 'Annuler des commandes',
  
  // Client Management
  'view_clients': 'Voir la liste des clients',
  'manage_clients': 'Gérer les informations clients',
  
  // Analytics & Reports
  'view_analytics': 'Voir les tableaux de bord',
  'view_reports': 'Voir les rapports',
  'export_reports': 'Exporter des rapports',
  'view_financial_data': 'Voir les données financières',
  
  // System Settings
  'view_settings': 'Voir les paramètres système',
  'edit_settings': 'Modifier les paramètres système',
  'manage_system': 'Gestion complète du système'
};

export function PermissionMatrix({ rolePermissions, currentUserRole }: PermissionMatrixProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Gestion des Utilisateurs']);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Get all unique permissions from all roles
  const allPermissions = Array.from(
    new Set(Object.values(rolePermissions).flat())
  );

  // Group permissions by category
  const permissionsByCategory = Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) => ({
    category,
    permissions: perms.filter(perm => allPermissions.includes(perm))
  })).filter(cat => cat.permissions.length > 0);

  // Role order for display
  const roleOrder = ['super_admin', 'admin', 'manager', 'staff'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            Matrice des Permissions
          </h2>
          <p className="text-stone-600">
            Vue d'ensemble des permissions par rôle
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Shield className="w-4 h-4" />
          <span>Utilisateur actuel: <strong className="text-stone-800">{ROLE_CONFIG[currentUserRole as keyof typeof ROLE_CONFIG]?.label || currentUserRole}</strong></span>
        </div>
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {roleOrder.map(role => {
          const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
          if (!config) return null;
          
          const Icon = config.icon;
          
          return (
            <div
              key={role}
              className={`${config.color} text-white rounded-xl p-4 flex items-center gap-3 shadow-lg`}
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">{config.label}</div>
                <div className="text-white/90 text-xs">{config.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="bg-linear-to-r from-stone-50 to-stone-100 border-b border-stone-200 px-6 py-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5 font-semibold text-stone-700">Permission</div>
            {roleOrder.map(role => (
              <div key={role} className="text-center font-semibold text-stone-700">
                {ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]?.label}
              </div>
            ))}
          </div>
        </div>

        {/* Permissions by Category */}
        <div className="divide-y divide-stone-100">
          {permissionsByCategory.map(({ category, permissions }) => {
            const isExpanded = expandedCategories.includes(category);
            
            return (
              <div key={category} className="hover:bg-stone-50/50 transition-colors">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-stone-800">{category}</h3>
                      <p className="text-sm text-stone-500">
                        {permissions.length} permission{permissions.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {roleOrder.map(role => {
                      const hasAllPermissions = permissions.every(perm => 
                        rolePermissions[role]?.includes(perm)
                      );
                      
                      return (
                        <div key={role} className="w-6 text-center">
                          {hasAllPermissions ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          ) : permissions.some(perm => 
                            rolePermissions[role]?.includes(perm)
                          ) ? (
                            <div className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full">
                              <div className="text-xs">Partiel</div>
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 bg-stone-100 text-stone-400 rounded-full">
                              <X className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </button>

                {/* Permissions List (Expanded) */}
                {isExpanded && (
                  <div className="px-6 pb-4 space-y-2">
                    {permissions.map(permission => (
                      <div key={permission} className="grid grid-cols-12 gap-4 py-3 border-t border-stone-100 first:border-t-0">
                        <div className="col-span-5 flex items-start gap-3">
                          <Lock className="w-4 h-4 text-stone-400 mt-1 shrink-0" />
                          <div>
                            <div className="font-medium text-stone-800">
                              {permission.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </div>
                            <div className="text-sm text-stone-600 mt-1">
                              {PERMISSION_DESCRIPTIONS[permission] || 'Permission non décrite'}
                            </div>
                          </div>
                        </div>
                        
                        {roleOrder.map(role => (
                          <div key={role} className="text-center">
                            {rolePermissions[role]?.includes(permission) ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-lg">
                                <Check className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-stone-100 text-stone-400 rounded-lg">
                                <X className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-linear-to-r from-amber-50 to-amber-100 border-t border-amber-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-800">
              Total des permissions: <strong>{allPermissions.length}</strong> permissions uniques
            </div>
            <div className="text-xs text-amber-600 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Seul le Super Admin peut modifier cette matrice
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Comment utiliser cette matrice
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div className="space-y-2">
            <div className="font-medium">✅ Cases vertes</div>
            <p>Le rôle a cette permission complètement</p>
          </div>
          <div className="space-y-2">
            <div className="font-medium">🔵 Cases bleues</div>
            <p>Le rôle a certaines permissions dans cette catégorie</p>
          </div>
          <div className="space-y-2">
            <div className="font-medium">⚪ Cases grises</div>
            <p>Le rôle n'a aucune permission dans cette catégorie</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import Info icon at the top
import { Info } from 'lucide-react';