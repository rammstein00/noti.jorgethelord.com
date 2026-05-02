export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  impersonatedUser?: User | null;
  impersonateUser?: (user: User) => void;
  clearImpersonation?: () => void;
}
