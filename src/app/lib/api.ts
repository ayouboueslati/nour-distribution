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

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // User methods
  async getCurrentUser() {
    return this.request('/users/me');
  }

  // Product methods
  async getProducts() {
    return this.request('/products');
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // Order methods
  async getOrders() {
    return this.request('/orders');
  }

  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getUsers(page: number = 1, limit: number = 10, role?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(role && { role })
  });
  return this.request(`/admin/users?${params}`);
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

// Profile management methods
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
}

export const apiService = new ApiService();