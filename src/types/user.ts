// 用户管理相关类型定义

export interface User {
  id: string
  name: string
  phone: string
  department: string
  create_time: string
  update_time: string
}

export interface UserCreate {
  name: string
  phone: string
  department: string
}

export interface UserUpdate {
  name?: string
  phone?: string
  department?: string
}

export interface UserListQuery {
  page?: number
  size?: number
  department?: string
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
