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

export interface AuthResponse {
  message: string;
  user_id: string;
  role: string;
  role_id: string;
  access_token: string;
  token_type: string;
}

export interface AuthState {
  user: AuthUser | null;
  userRole: any | null; // 用户角色信息，包含权限
  isAuthenticated: boolean;
  isLoading: boolean;
}
