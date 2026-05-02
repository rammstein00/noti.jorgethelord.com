import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved token and user on load
    const savedToken = localStorage.getItem('noti_token');
    const savedUser = localStorage.getItem('noti_user');
    const savedImpersona = localStorage.getItem('noti_impersonated');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('noti_token');
        localStorage.removeItem('noti_user');
      }
    }
    
    if (savedImpersona) {
      try {
        setImpersonatedUser(JSON.parse(savedImpersona));
      } catch (e) {
        localStorage.removeItem('noti_impersonated');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('noti_token', newToken);
    localStorage.setItem('noti_user', JSON.stringify(newUser));
  };

  const impersonateUser = (targetUser: User) => {
    setImpersonatedUser(targetUser);
    localStorage.setItem('noti_impersonated', JSON.stringify(targetUser));
  };

  const clearImpersonation = () => {
    setImpersonatedUser(null);
    localStorage.removeItem('noti_impersonated');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearImpersonation();
    localStorage.removeItem('noti_token');
    localStorage.removeItem('noti_user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
    impersonatedUser,
    impersonateUser,
    clearImpersonation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
