const API_BASE_URL = 'http://localhost:8000/api/v1';

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
        window.location.href = '/admin/login';
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`Àpi error details:`, errorData);

        //FOR 422 errors
        if (response.status == 422 && errorData?.detail){
          const validationErrors = Array.isArray(errorData.detail)
          ? errorData.detail.map((err: any) => `${err.loc?.[1] || '$field'}: ${err.msg}`).join(', ')
          :errorData.detail;
            throw new Error(`Validation Error: ${validationErrors}`);
        }
              throw new Error(errorData?.detail || `Request failed with status ${response.status}`);

      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`💥 API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // ============ AUTHENTICATION METHODS ============
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
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
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deactivateUser(userId: string) {
    return this.request(`/admin/users/${userId}/deactivate`, {
      method: 'POST',
    });
  }

  async activateUser(userId: string) {
    return this.request(`/admin/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(userId: string) {
    return this.request(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
    });
  }

  async generatePassword() {
    return this.request('/admin/users/tools/generate-password');
  }

  // ============ PROFILE MANAGEMENT METHODS ============
  async getCurrentUserProfile() {
    return this.request('/profile/me');
  }

  async updateUserProfile(profileData: any) {
    return this.request('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: any) {
    return this.request('/profile/me/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async getUserStats() {
    return this.request('/profile/me/stats');
  }

  // ============ CATEGORY MANAGEMENT METHODS ============
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(categoryData: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(categoryId: string, categoryData: any) {
    return this.request(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(categoryId: string) {
    return this.request(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
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
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, productData: any) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async updateProductStock(productId: string, stockData: any) {
    return this.request(`/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(stockData),
    });
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
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplier(supplierId: string, supplierData: any) {
    return this.request(`/suppliers/${supplierId}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  }

  async deleteSupplier(supplierId: string) {
    return this.request(`/suppliers/${supplierId}`, {
      method: 'DELETE',
    });
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
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}

export const apiService = new ApiService();