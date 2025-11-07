import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface AdminAuthState {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  isLoading: boolean;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    token: null,
    username: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const username = localStorage.getItem('admin_username');
    if (token && username) {
      setAuthState({
        isAuthenticated: true,
        token,
        username,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await apiRequest('POST', '/api/admin/login', { username, password });
      const response = await res.json();
      
      if (response.success && response.token) {
        localStorage.setItem('admin_token', response.token);
        localStorage.setItem('admin_username', response.username);
        setAuthState({
          isAuthenticated: true,
          token: response.token,
          username: response.username,
          isLoading: false,
        });
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate server-side session
      await apiRequest('POST', '/api/admin/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
      setAuthState({
        isAuthenticated: false,
        token: null,
        username: null,
        isLoading: false,
      });
    }
  };

  return {
    ...authState,
    login,
    logout,
  };
}
