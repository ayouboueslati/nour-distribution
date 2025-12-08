'use client';

import { useEffect, useState } from 'react';

// This should match your backend Permission enum
export type Permission = 
  // User Management
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  | 'manage_admins'
  | 'reset_passwords'
  | 'deactivate_users'
  
  // Product Management
  | 'view_products'
  | 'create_products'
  | 'edit_products'
  | 'delete_products'
  | 'import_products'
  | 'export_products'
  
  // Category Management
  | 'view_categories'
  | 'manage_categories'
  
  // Inventory Management
  | 'view_inventory'
  | 'manage_inventory'
  | 'adjust_stock'
  | 'view_inventory_movements'
  
  // Supplier Management
  | 'view_suppliers'
  | 'create_suppliers'
  | 'edit_suppliers'
  | 'delete_suppliers'
  
  // Order Management
  | 'view_orders'
  | 'create_orders'
  | 'edit_orders'
  | 'delete_orders'
  | 'cancel_orders'
  
  // Client Management
  | 'view_clients'
  | 'manage_clients'
  
  // Analytics & Reports
  | 'view_analytics'
  | 'view_reports'
  | 'export_reports'
  | 'view_financial_data'
  
  // System Settings
  | 'view_settings'
  | 'edit_settings'
  | 'manage_system';

// Define role permissions (this should match your backend exactly)
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [
    // All permissions - Super Admin has everything
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'manage_admins',
    'reset_passwords',
    'deactivate_users',
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'import_products',
    'export_products',
    'view_categories',
    'manage_categories',
    'view_inventory',
    'manage_inventory',
    'adjust_stock',
    'view_inventory_movements',
    'view_suppliers',
    'create_suppliers',
    'edit_suppliers',
    'delete_suppliers',
    'view_orders',
    'create_orders',
    'edit_orders',
    'delete_orders',
    'cancel_orders',
    'view_clients',
    'manage_clients',
    'view_analytics',
    'view_reports',
    'export_reports',
    'view_financial_data',
    'view_settings',
    'edit_settings',
    'manage_system'
  ],
  
  admin: [
    // User Management
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'reset_passwords',
    'deactivate_users',
    
    // Product Management
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'import_products',
    'export_products',
    
    // Category Management
    'view_categories',
    'manage_categories',
    
    // Inventory Management
    'view_inventory',
    'manage_inventory',
    'adjust_stock',
    'view_inventory_movements',
    
    // Supplier Management
    'view_suppliers',
    'create_suppliers',
    'edit_suppliers',
    'delete_suppliers',
    
    // Order Management
    'view_orders',
    'create_orders',
    'edit_orders',
    'delete_orders',
    'cancel_orders',
    
    // Client Management
    'view_clients',
    'manage_clients',
    
    // Analytics & Reports
    'view_analytics',
    'view_reports',
    'export_reports',
    'view_financial_data',
    
    // Settings
    'view_settings',
  ],
  
  manager: [
    // User Management
    'view_users',
    
    // Product Management
    'view_products',
    'create_products',
    'edit_products',
    'export_products',
    
    // Category Management
    'view_categories',
    
    // Inventory Management
    'view_inventory',
    'manage_inventory',
    'adjust_stock',
    'view_inventory_movements',
    
    // Supplier Management
    'view_suppliers',
    'create_suppliers',
    
    // Order Management
    'view_orders',
    'create_orders',
    'edit_orders',
    'cancel_orders',
    
    // Client Management
    'view_clients',
    'manage_clients',
    
    // Analytics & Reports
    'view_analytics',
    'view_reports',
  ],
  
  staff: [
    // Product Management
    'view_products',
    
    // Category Management
    'view_categories',
    
    // Inventory Management
    'view_inventory',
    'view_inventory_movements',
    
    // Supplier Management
    'view_suppliers',
    
    // Order Management
    'view_orders',
    'create_orders',
    
    // Client Management
    'view_clients',
  ],
};

export function useRolePermissions() {
  const [isLoading, setIsLoading] = useState(false);
  
  // In a real app, you might fetch this from an API
  const getRolePermissions = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return ROLE_PERMISSIONS;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    rolePermissions: ROLE_PERMISSIONS,
    isLoading,
    getRolePermissions,
  };
}