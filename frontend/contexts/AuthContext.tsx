import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, CurrentUser, UserPermission } from '../services/authService';

interface AuthContextType {
  user: CurrentUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (moduleId: string, subModuleId: string | null, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  // Listen for 401 events from axiosClient
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logout]);

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      authService.getCurrentUser()
        .then(setUser)
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, logout]);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem('authToken', response.token);
    setToken(response.token);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const hasPermission = useCallback((moduleId: string, subModuleId: string | null, action: string): boolean => {
    if (!user) return false;
    // Admin role bypasses all checks
    if (user.roles.includes('Admin')) return true;
    
    return user.permissions.some((p: UserPermission) =>
      p.moduleId === moduleId &&
      (subModuleId === null || p.subModuleId === subModuleId) &&
      p.action === action
    );
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      logout,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
