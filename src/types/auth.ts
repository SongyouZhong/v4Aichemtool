export interface User {
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
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
