// 用户管理相关类型定义

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED', 
  INACTIVE = 'INACTIVE'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

export interface User {
  id: string
  name: string
  phone: string
  department: string
  role: UserRole
  role_id?: string  // 新增角色ID字段
  status: UserStatus
  create_time: string
  update_time: string
}

export interface UserRegister {
  name: string
  phone: string
  department: string
  password: string
}

export interface UserCreate {
  name: string
  phone: string
  department: string
  password: string
  role?: UserRole
  status?: UserStatus
}

export interface UserUpdate {
  name?: string
  phone?: string
  department?: string
  role?: UserRole
}

export interface UserApproval {
  status: UserStatus
  role: UserRole
}

export interface UserProjectsUpdate {
  project_ids: string[]
}

export interface UserListQuery {
  page?: number
  size?: number
  department?: string
  status?: string
  role?: string
  keyword?: string
}

// 部门选项
export interface DepartmentOption {
  label: string
  value: string
}

// 用户表格列配置
export interface UserTableColumn {
  field: string
  header: string
  sortable?: boolean
  style?: object
}
