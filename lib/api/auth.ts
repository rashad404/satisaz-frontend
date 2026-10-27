import apiClient from './client';

export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  telegram_chat_id?: string;
  whatsapp_number?: string;
  slack_webhook?: string;
  push_token?: string;
  available_notification_channels?: string[];
  email_verified_at?: string;
  phone_verified_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  return_url?: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  password_confirmation: string;
  locale?: string;
  timezone?: string;
}

export interface AuthResponse {
  status: string;
  message?: string;
  data?: {
    user: User;
    token: string;
    return_url?: string;
  };
}

class AuthService {
  // Email/Password Authentication
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.data?.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.data?.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  // OAuth Authentication
  redirectToOAuth(provider: 'google' | 'facebook', returnUrl?: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8007/api';
    const params = returnUrl ? `?return_url=${encodeURIComponent(returnUrl)}` : '';
    window.location.href = `${baseUrl}/auth/${provider}${params}`;
  }

  // User Management
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/user');
      return response.data.data;
    } catch (error) {
      return null;
    }
  }

  async updateProfile(data: Partial<User>): Promise<AuthResponse> {
    const response = await apiClient.put('/user', data);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore errors
    }
    this.clearToken();
  }

  // Token Management
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('auth_time', Date.now().toString());
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_time');
      localStorage.removeItem('user');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Store return URL for after authentication
  setReturnUrl(url: string) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('return_url', url);
    }
  }

  getReturnUrl(): string | null {
    if (typeof window !== 'undefined') {
      const url = sessionStorage.getItem('return_url');
      sessionStorage.removeItem('return_url');
      return url;
    }
    return null;
  }
}

export default new AuthService();