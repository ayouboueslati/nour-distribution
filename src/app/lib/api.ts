// API Configuration from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const STATIC_BASE_URL = process.env.NEXT_PUBLIC_STATIC_URL || 'http://localhost:8000/static/';

export function getProductImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '/images/products/placeholder.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/images/')) return imagePath; // Local assets
  return `${STATIC_BASE_URL}${imagePath}`;
}

import { notificationService } from "./notifications";

class ApiService {
  private async request(endpoint: string, options: RequestInit & { skipGlobalErrorHandler?: boolean } = {}) {
    // Client-side check
    if (typeof window === 'undefined') {
      throw new Error('API calls can only be made from client-side');
    }

    const token = localStorage.getItem('access_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    };

    // If body is FormData, let browser set Content-Type with boundary
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log(`🌐 API Call: ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      console.log(`📡 Response Status: ${response.status}`);

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token');

        if (!options.skipGlobalErrorHandler) {
          notificationService.warning(
            'Session expirée',
            'Votre session a expiré. Veuillez vous reconnecter.'
          );

          window.location.href = '/admin/login';
        }
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

          if (!options.skipGlobalErrorHandler) {
            // Show permission error with modal
            notificationService.permissionError(
              'Accès refusé',
              errorMessage,
              requiredRoles,
              userRole
            );
          }
        } else {
          if (!options.skipGlobalErrorHandler) {
            notificationService.error(
              'Accès refusé',
              'Vous n\'avez pas les permissions nécessaires'
            );
          }
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

          if (!options.skipGlobalErrorHandler) {
            notificationService.error(
              'Erreur de validation',
              validationErrors
            );
          }

          throw new Error(`Validation Error: ${validationErrors}`);
        }

        // Generic error
        const errorMessage = errorData?.detail || errorData?.message || `Erreur ${response.status}`;

        if (!options.skipGlobalErrorHandler) {
          notificationService.error(
            'Erreur',
            errorMessage
          );
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`, data);
      return data;
    } catch (error: any) {
      // Don't show notification for permission denied (already shown above)
      if (error.message !== 'PERMISSION_DENIED' && !options.skipGlobalErrorHandler) {
        // Only show generic error if not already handled
        if (!error.message?.startsWith('Validation Error:') && error.message !== 'Authentication required') {
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
  async getCurrentUser(options?: { skipGlobalErrorHandler?: boolean }) {
    return this.request('/users/me', options);
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

  async getProductAdmin(productId: string) {
    return this.request(`/products/admin/${productId}`);
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

  async uploadMainImage(productId: string, file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await this.request(`/products/${productId}/upload-main-image`, {
        method: 'POST',
        body: formData,
        // Content-Type header is not set manually for FormData, browser sets it with boundary
      });

      return result;
    } catch (error) {
      console.error('Error uploading main image:', error);
      throw error;
    }
  }

  async uploadAdditionalImages(productId: string, files: File[]) {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const result = await this.request(`/products/${productId}/upload-additional-images`, {
        method: 'POST',
        body: formData,
      });

      return result;
    } catch (error) {
      console.error('Error uploading additional images:', error);
      throw error;
    }
  }

  async deleteProductImage(productId: string, imagePath: string) {
    try {
      // Pass image_path as a query parameter
      const result = await this.request(`/products/${productId}/images?image_path=${encodeURIComponent(imagePath)}`, {
        method: 'DELETE',
      });

      return result;
    } catch (error) {
      console.error('Error deleting product image:', error);
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

  async adjustStock(payload: { product_id: string; real_quantity: number; reason: string; note?: string }) {
    try {
      const result = await this.request('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      notificationService.success(
        'Stock ajusté',
        'L\'ajustement de stock a été enregistré'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  // ============ INVENTORY ANALYTICS (NEW) ============
  async getStockAnalyticsOverview() {
    return this.request('/inventory/analytics/overview');
  }

  async getStockMovementTrends(params?: { days?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.days) queryParams.append('days', params.days.toString());
    const query = queryParams.toString();
    return this.request(`/inventory/analytics/trends?${query}`);
  }

  async getStockTurnoverAnalysis(params?: { days?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.days) queryParams.append('days', params.days.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString();
    return this.request(`/inventory/analytics/turnover?${query}`);
  }

  async getStockAgingReport() {
    return this.request('/inventory/analytics/aging');
  }

  // ============ ORDER MANAGEMENT METHODS ============
  async getOrders(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    client_id?: string;
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
    return this.request(`/orders?${query}`);
  }

  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  async getDevisByOrderId(orderId: string) {
    return this.request(`/documents/devis/by-order/${orderId}`);
  }

  async getInvoicesByOrderId(orderId: string) {
    return this.request(`/documents/factures/by-order/${orderId}`);
  }

  // ============ DEVIS TRACKING (NEW) ============
  async getOrderDevisList(orderId: string, params?: {
    include_versions?: boolean;
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
    return this.request(`/documents/orders/${orderId}/devis?${query}`);
  }

  async getFactureSourceDevis(factureId: string) {
    return this.request(`/documents/factures/${factureId}/source-devis`, {
      skipGlobalErrorHandler: true // Handle 404 gracefully for factures without source devis
    });
  }

  async getOrderDevisTimeline(orderId: string) {
    return this.request(`/documents/orders/${orderId}/devis/timeline`);
  }

  // ============ DELIVERY TRACKING (NEW) ============
  async getDeliveries(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    order_id?: string;
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
    return this.request(`/deliveries?${query}`);
  }

  async createDelivery(payload: any) {
    try {
      const result = await this.request('/deliveries', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      notificationService.success(
        'Livraison créée',
        'Le bon de livraison a été créé avec succès'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getDeliveriesByOrder(orderId: string) {
    return this.request(`/deliveries/by-order/${orderId}`);
  }

  async updateDeliveryStatus(deliveryId: string, status: string) {
    try {
      const result = await this.request(`/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      notificationService.success(
        'Statut mis à jour',
        `Le statut de la livraison a été mis à jour: ${status}`
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  // ============ ANALYTICS ============
  async getAnalyticsDashboard() {
    return this.request('/analytics/dashboard');
  }

  async getAnalyticsSales(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    return this.request(`/analytics/sales?period=${period}`);
  }

  async getAnalyticsStock() {
    return this.request('/analytics/stock');
  }

  async getFinancialAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    return this.request(`/analytics/financials?period=${period}`);
  }

  async getExpenseBreakdown() {
    return this.request('/analytics/expenses/breakdown');
  }

  async getComparisonData() {
    return this.request('/analytics/comparison');
  }

  async getSmartInsights() {
    return this.request('/analytics/insights');
  }

  // ============ CHARGES ============
  async getCharges() {
    return this.request('/charges/');
  }

  async getCharge(id: string) {
    return this.request(`/charges/${id}`);
  }

  async createCharge(data: any) {
    return this.request('/charges/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCharge(id: string, data: any) {
    return this.request(`/charges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCharge(id: string) {
    return this.request(`/charges/${id}`, {
      method: 'DELETE'
    });
  }

  async getAnalyticsVisualizations() {
    return this.request('/analytics/visualizations');
  }

  async createOrder(orderData: any) {
    try {
      const result = await this.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      notificationService.success(
        'Commande créée',
        'La commande a été créée avec succès'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateOrderPricing(orderId: string, pricingData: any) {
    try {
      const result = await this.request(`/orders/${orderId}/pricing`, {
        method: 'PUT',
        body: JSON.stringify(pricingData),
      });

      notificationService.success(
        'Prix mis à jour',
        'Les prix de la commande ont été définis'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async confirmOrder(orderId: string) {
    try {
      const result = await this.request(`/orders/${orderId}/confirm`, {
        method: 'POST',
      });

      notificationService.success(
        'Commande confirmée',
        'La commande a été confirmée avec succès'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(orderId: string, reason: string) {
    try {
      const result = await this.request(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      notificationService.success(
        'Commande annulée',
        'La commande a été annulée'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  // ============ ORDER ITEM MANAGEMENT ============
  async addOrderItem(orderId: string, itemData: { product_id: string; quantity: number; unit_price?: number }) {
    try {
      const result = await this.request(`/orders/${orderId}/items`, {
        method: 'POST',
        body: JSON.stringify(itemData),
      });

      notificationService.success(
        'Produit ajouté',
        'Le produit a été ajouté à la commande'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateOrderItem(orderId: string, itemId: string, data: { quantity?: number; unit_price?: number; discount_percent?: number }) {
    try {
      const result = await this.request(`/orders/${orderId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async removeOrderItem(orderId: string, itemId: string) {
    try {
      const result = await this.request(`/orders/${orderId}/items/${itemId}`, {
        method: 'DELETE',
      });

      notificationService.success(
        'Produit retiré',
        'Le produit a été retiré de la commande'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  // ============ ORDER STATUS ACTIONS ============
  async acceptOrder(orderId: string, notes?: string) {
    try {
      const result = await this.request(`/orders/${orderId}/accept`, {
        method: 'POST',
        body: JSON.stringify({ notes: notes || '' }),
      });

      notificationService.success(
        'Commande acceptée',
        'La commande a été acceptée'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async rejectOrder(orderId: string, reason: string, notes?: string) {
    try {
      const result = await this.request(`/orders/${orderId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason, notes: notes || '' }),
      });

      notificationService.success(
        'Commande rejetée',
        'La commande a été rejetée avec succès'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  // ============ DEVIS ============
  async getDevis(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    client_id?: string;
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
    return this.request(`/documents/devis?${query}`);
  }

  async getDevisById(devisId: string) {
    return this.request(`/documents/devis/${devisId}`);
  }

  async createDevisFromOrder(orderData: any) {
    try {
      const result = await this.request('/documents/devis/from-order', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      notificationService.success(
        'Devis créé',
        'Le devis a été généré avec succès'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateDevis(devisId: string, devisData: any) {
    try {
      const result = await this.request(`/documents/devis/${devisId}`, {
        method: 'PUT',
        body: JSON.stringify(devisData),
      });

      notificationService.success(
        'Devis mis à jour',
        'Le devis a été modifié'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async acceptDevis(devisId: string) {
    try {
      const result = await this.request(`/documents/devis/${devisId}/accept`, {
        method: 'POST',
      });

      notificationService.success(
        'Devis accepté',
        'Le devis a été accepté'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async convertDevisToFacture(devisId: string, data: any = {}) {
    try {
      const result = await this.request(`/documents/devis/${devisId}/convert-to-facture`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      notificationService.success(
        'Facture créée',
        'Le devis a été converti en facture'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getDevisVersions(devisId: string) {
    return this.request(`/documents/devis/${devisId}/versions`);
  }

  // ============ FACTURES ============
  async getFactures(params?: {
    skip?: number;
    limit?: number;
    payment_status?: string;
    client_id?: string;
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
    return this.request(`/documents/factures?${query}`);
  }

  async getFactureById(factureId: string) {
    return this.request(`/documents/factures/${factureId}`);
  }

  async createFacture(factureData: any) {
    try {
      const result = await this.request('/documents/factures', {
        method: 'POST',
        body: JSON.stringify(factureData),
      });

      notificationService.success(
        'Facture créée',
        'La facture a été générée'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateFacture(factureId: string, factureData: any) {
    try {
      const result = await this.request(`/documents/factures/${factureId}`, {
        method: 'PUT',
        body: JSON.stringify(factureData),
      });

      notificationService.success(
        'Facture mise à jour',
        'La facture a été modifiée'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async addPaymentToFacture(factureId: string, paymentData: any) {
    try {
      const result = await this.request(`/documents/factures/${factureId}/payments`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      notificationService.success(
        'Paiement enregistré',
        'Le paiement a été ajouté à la facture'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  // ============ AVOIRS ============
  async getAvoirs(params?: {
    skip?: number;
    limit?: number;
    client_id?: string;
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
    return this.request(`/documents/avoirs?${query}`);
  }

  async getAvoirById(avoirId: string) {
    return this.request(`/documents/avoirs/${avoirId}`);
  }

  async createAvoirFromFacture(factureId: string, avoirData: any) {
    try {
      const result = await this.request('/documents/avoirs/from-facture', {
        method: 'POST',
        body: JSON.stringify({
          ...avoirData,
          facture_id: factureId
        }),
      });

      notificationService.success(
        'Avoir créé',
        'L\'avoir a été généré'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  // ============ CLIENTS ============
  async getClients(params?: {
    skip?: number;
    limit?: number;
    type?: string;
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
    return this.request(`/clients?${query}`);
  }

  async getClient(clientId: string) {
    return this.request(`/clients/${clientId}`);
  }

  async createClient(clientData: any) {
    try {
      const result = await this.request('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      });

      notificationService.success(
        'Client créé',
        'Le client a été ajouté'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateClient(clientId: string, clientData: any) {
    try {
      const result = await this.request(`/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(clientData),
      });

      notificationService.success(
        'Client mis à jour',
        'Les informations ont été modifiées'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteClient(clientId: string) {
    try {
      const result = await this.request(`/clients/${clientId}`, {
        method: 'DELETE',
      });

      notificationService.success(
        'Client supprimé',
        'Le client a été retiré'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getClientStats(clientId: string) {
    return this.request(`/clients/${clientId}/stats`);
  }

  // ============ CART (GUEST) ============
  async getGuestCart(guestSessionId: string) {
    return this.request(`/carts/guest/${guestSessionId}`);
  }

  async addItemToGuestCart(guestSessionId: string, itemData: any) {
    console.log('📦 Sending cart item data:', itemData);
    try {
      const result = await this.request(`/carts/guest/${guestSessionId}/items`, {
        method: 'POST',
        body: JSON.stringify(itemData),
      });

      notificationService.success(
        'Ajouté au panier',
        'Le produit a été ajouté'
      );

      return result;
    } catch (error: any) {
      console.error('❌ Cart error details:', error.message);
      throw error;
    }
  }

  async updateGuestCartItem(guestSessionId: string, itemId: string, updateData: any) {
    try {
      const result = await this.request(`/carts/guest/${guestSessionId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async removeGuestCartItem(guestSessionId: string, itemId: string) {
    try {
      const result = await this.request(`/carts/guest/${guestSessionId}/items/${itemId}`, {
        method: 'DELETE',
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async clearGuestCart(clientId: string) {
    try {
      const result = await this.request(`/carts/guest/${clientId}/clear`, {
        method: 'DELETE',
      });

      notificationService.success(
        'Panier vidé',
        'Le panier a été vidé'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async guestCheckout(guestSessionId: string, checkoutData: any) {
    try {
      console.log('📤 Checkout payload:', JSON.stringify(checkoutData, null, 2));
      const result = await this.request(`/carts/guest/${guestSessionId}/checkout`, {
        method: 'POST',
        body: JSON.stringify(checkoutData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      notificationService.success(
        'Commande créée',
        'Votre commande a été enregistrée avec succès'
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  // ============ PUBLIC TRACKING ============
  async trackOrder(orderNumber: string) {
    return this.request(`/public/track/${orderNumber}`);
  }

  async getAvoirById(avoirId: string) {
    return this.request(`/documents/avoirs/${avoirId}`);
  }

  // ============ PDF DOWNLOAD ============
  async downloadPdf(p0: string, type: 'facture' | 'devis' | 'avoir') {
    let endpoint = '';
    switch (type) {
      case 'facture':
        endpoint = `/documents/factures/${p0}/pdf`;
        break;
      case 'devis':
        endpoint = `/documents/devis/${p0}/pdf`;
        break;
      case 'avoir':
        endpoint = `/documents/avoirs/${p0}/pdf`;
        break;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du PDF');
      }

      return await response.blob();
    } catch (error) {
      throw error;
    }
  }

  async verifyOrderAccess(orderNumber: string, verificationCode: string) {
    return this.request(
      `/public/verify-order?order_number=${orderNumber}&verification_code=${verificationCode}`,
      { method: 'POST' }
    );
  }

  async getPublicOrderDetails(orderId: string, verification: string) {
    return this.request(`/public/orders/${orderId}?verification=${verification}`);
  }

  async verifyDocumentAccess(documentNumber: string, verificationCode: string) {
    return this.request(
      `/public/verify-document?document_number=${documentNumber}&verification_code=${verificationCode}`,
      { method: 'POST' }
    );
  }

  async getPublicDocumentDetails(documentId: string, verification: string) {
    return this.request(`/public/documents/${documentId}?verification=${verification}`);
  }

  async downloadDocumentPdf(documentId: string, verification: string) {
    // Special handling for PDF download
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/public/documents/${documentId}/pdf?verification=${verification}`;

    window.open(url, '_blank');
  }

}

export const apiService = new ApiService();