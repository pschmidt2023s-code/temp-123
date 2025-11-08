import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface AdminAuthState {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    username: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check session validity by making a request to protected endpoint
    const checkSession = async () => {
      try {
        await apiRequest('GET', '/api/admin/check-session');
        setAuthState({
          isAuthenticated: true,
          username: 'admin',
          isLoading: false,
        });
      } catch {
        setAuthState({
          isAuthenticated: false,
          username: null,
          isLoading: false,
        });
      }
    };
    
    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest<{ success: boolean; username?: string }>('POST', '/api/admin/login', { username, password });
      
      if (response.success) {
        setAuthState({
          isAuthenticated: true,
          username: response.username || username,
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
      await apiRequest('POST', '/api/admin/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        isAuthenticated: false,
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
