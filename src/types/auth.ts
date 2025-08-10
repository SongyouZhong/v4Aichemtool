export interface AuthUser {
  username: string;
  email?: string;
  id?: string;
}

export interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
