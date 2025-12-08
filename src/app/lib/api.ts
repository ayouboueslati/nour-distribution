const API_BASE_URL = 'http://localhost:8000/api/v1';
import { notificationService } from "./notifications";

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    // Client-side check
    if (typeof window === 'undefined') {
      throw new Error('API calls can only be made from client-side');
    }

    const token = localStorage.getItem('access_token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API Call: ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      console.log(`📡 Response Status: ${response.status}`);

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token');
        
        notificationService.warning(
          'Session expirée',
          'Votre session a expiré. Veuillez vous reconnecter.'
        );
        
        window.location.href = '/admin/login';
        throw new Error('Authentication required');
      }

      if (response.status === 403) {
        const errorData = await response.json().catch(() => null);
        
        // Parse permission error
        if (errorData?.detail) {
          let errorMessage = errorData.detail;
          let requiredRoles = '';
          let userRole = '';
          
          // Extract roles from error message if present
          const roleMatch = errorMessage.match(/Rôles requis:\s*(.+?)\.\s*Votre rôle:\s*(.+)/);
          if (roleMatch) {
            requiredRoles = roleMatch[1];
            userRole = roleMatch[2];
            errorMessage = 'Permission insuffisante pour cette action';
          }
          
          // Show permission error with modal
          notificationService.permissionError(
            'Accès refusé',
            errorMessage,
            requiredRoles,
            userRole
          );
        } else {
          notificationService.error(
            'Accès refusé',
            'Vous n\'avez pas les permissions nécessaires'
          );
        }
        
        throw new Error('PERMISSION_DENIED');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`Api error details:`, errorData);

        // Handle 422 validation errors
        if (response.status === 422 && errorData?.detail) {
          const validationErrors = Array.isArray(errorData.detail)
            ? errorData.detail.map((err: any) => `${err.loc?.[1] || '$field'}: ${err.msg}`).join(', ')
            : errorData.detail;
            
          notificationService.error(
            'Erreur de validation',
            validationErrors
          );
          
          throw new Error(`Validation Error: ${validationErrors}`);
        }
        
        // Generic error
        const errorMessage = errorData?.detail || errorData?.message || `Erreur ${response.status}`;
        notificationService.error(
          'Erreur',
          errorMessage
        );
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`, data);
      return data;
    } catch (error: any) {
      // Don't show notification for permission denied (already shown above)
      if (error.message !== 'PERMISSION_DENIED') {
        // Only show generic error if not already handled
        if (!error.message?.startsWith('Validation Error:')) {
          console.error(`💥 API Error: ${endpoint}`, error);
        }
      }
      throw error;
    }
  }

  // ============ AUTHENTICATION METHODS ============
  async login(email: string, password: string) {
    try {
      const result = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      notificationService.success(
        'Connexion réussie',
        'Bienvenue sur votre espace d\'administration'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // ============ USER MANAGEMENT METHODS ============
  async getCurrentUser() {
    return this.request('/users/me');
  }

  async getUsers(page: number = 1, limit: number = 10, role?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(role && { role })
    });
    return this.request(`/admin/users?${params}`);
  }

  async getUser(userId: string) {
    console.log('🔍 ApiService: Getting user with ID:', userId);
    const result = await this.request(`/admin/users/${userId}`);
    console.log('🔍 ApiService: Got user result:', result);
    return result;
  }

  async createUser(userData: any) {
    try {
      const result = await this.request('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      notificationService.success(
        'Utilisateur créé',
        'L\'utilisateur a été créé avec succès'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: string, userData: any) {
    try {
      const result = await this.request(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      notificationService.success(
        'Utilisateur mis à jour',
        'Les modifications ont été enregistrées'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deactivateUser(userId: string) {
    try {
      const result = await this.request(`/admin/users/${userId}/deactivate`, {
        method: 'POST',
      });
      
      notificationService.success(
        'Utilisateur désactivé',
        'L\'utilisateur a été désactivé avec succès'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async activateUser(userId: string) {
    try {
      const result = await this.request(`/admin/users/${userId}/activate`, {
        method: 'POST',
      });
      
      notificationService.success(
        'Utilisateur activé',
        'L\'utilisateur a été activé avec succès'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const result = await this.request(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      notificationService.success(
        'Utilisateur supprimé',
        'L\'utilisateur a été supprimé définitivement'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async resetUserPassword(userId: string) {
    try {
      const result = await this.request(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
      
      notificationService.success(
        'Mot de passe réinitialisé',
        'Le nouveau mot de passe a été envoyé à l\'utilisateur'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async generatePassword() {
    return this.request('/admin/users/tools/generate-password');
  }

  // ============ PROFILE MANAGEMENT METHODS ============
  async getCurrentUserProfile() {
    return this.request('/profile/me');
  }

  async updateUserProfile(profileData: any) {
    try {
      const result = await this.request('/profile/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      notificationService.success(
        'Profil mis à jour',
        'Vos informations ont été mises à jour avec succès'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(passwordData: any) {
    try {
      const result = await this.request('/profile/me/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData),
      });
      
      notificationService.success(
        'Mot de passe modifié',
        'Votre mot de passe a été changé avec succès'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUserStats() {
    return this.request('/profile/me/stats');
  }

  // ============ CATEGORY MANAGEMENT METHODS ============
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(categoryData: any) {
    try {
      const result = await this.request('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
      
      notificationService.success(
        'Catégorie créée',
        'La catégorie a été créée avec succès'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(categoryId: string, categoryData: any) {
    try {
      const result = await this.request(`/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });
      
      notificationService.success(
        'Catégorie mise à jour',
        'Les modifications ont été enregistrées'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(categoryId: string) {
    try {
      const result = await this.request(`/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      notificationService.success(
        'Catégorie supprimée',
        'La catégorie a été supprimée avec succès'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // ============ PRODUCT MANAGEMENT METHODS ============
  async getProducts(params?: {
    skip?: number;
    limit?: number;
    category_id?: string;
    supplier_id?: string;
    is_active?: boolean;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request(`/products?${query}`);
  }

  async getProduct(productId: string) {
    return this.request(`/products/${productId}`);
  }

  async createProduct(productData: any) {
    try {
      const result = await this.request('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
      
      notificationService.success(
        'Produit créé',
        'Le produit a été ajouté au catalogue'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(productId: string, productData: any) {
    try {
      const result = await this.request(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
      
      notificationService.success(
        'Produit mis à jour',
        'Les modifications ont été enregistrées'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(productId: string) {
    try {
      const result = await this.request(`/products/${productId}`, {
        method: 'DELETE',
      });
      
      notificationService.success(
        'Produit supprimé',
        'Le produit a été retiré du catalogue'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateProductStock(productId: string, stockData: any) {
    try {
      const result = await this.request(`/products/${productId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify(stockData),
      });
      
      notificationService.success(
        'Stock mis à jour',
        'Le niveau de stock a été modifié'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getLowStockProducts() {
    return this.request('/products/analytics/low-stock');
  }

  async getFeaturedProducts() {
    return this.request('/products/analytics/featured');
  }

  async getBestSellers() {
    return this.request('/products/analytics/best-sellers');
  }

  // ============ SUPPLIER MANAGEMENT METHODS ============
  async getSuppliers(params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    is_preferred?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request(`/suppliers?${query}`);
  }

  async getSupplier(supplierId: string) {
    return this.request(`/suppliers/${supplierId}`);
  }

  async createSupplier(supplierData: any) {
    try {
      const result = await this.request('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplierData),
      });
      
      notificationService.success(
        'Fournisseur créé',
        'Le fournisseur a été ajouté avec succès'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateSupplier(supplierId: string, supplierData: any) {
    try {
      const result = await this.request(`/suppliers/${supplierId}`, {
        method: 'PUT',
        body: JSON.stringify(supplierData),
      });
      
      notificationService.success(
        'Fournisseur mis à jour',
        'Les informations ont été modifiées'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteSupplier(supplierId: string) {
    try {
      const result = await this.request(`/suppliers/${supplierId}`, {
        method: 'DELETE',
      });
      
      notificationService.success(
        'Fournisseur supprimé',
        'Le fournisseur a été retiré de la liste'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getSuppliersWithStats() {
    return this.request('/suppliers/analytics/with-stats');
  }

  // ============ INVENTORY MANAGEMENT METHODS ============
  async getInventoryMovements(params?: {
    product_id?: string;
    skip?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request(`/inventory/movements?${query}`);
  }

  async getStockLevelReport() {
    return this.request('/inventory/stock-level-report');
  }

  async getLowStockAlerts() {
    return this.request('/inventory/low-stock-alerts');
  }

  async getInventoryTurnover(days: number = 30) {
    return this.request(`/inventory/turnover-analysis?days=${days}`);
  }

  // ============ ORDER MANAGEMENT METHODS ============
  async getOrders() {
    return this.request('/orders');
  }

  async createOrder(orderData: any) {
    try {
      const result = await this.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      
      notificationService.success(
        'Commande créée',
        'La commande a été enregistrée avec succès'
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export const apiService = new ApiService();