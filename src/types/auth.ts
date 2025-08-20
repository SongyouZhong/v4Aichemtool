export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  department: string;
  role: string;
  status: string;
}

export interface LoginForm {
  phone: string;
  password: string;
  remember: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
