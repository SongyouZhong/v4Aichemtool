// 权限相关类型定义

export interface Permission {
  id: string
  name: string
  code: string
  module: string
  description?: string
  is_active: boolean
  create_time: string
  update_time: string
}

export interface PermissionCreate {
  name: string
  code: string
  module: string
  description?: string
  is_active?: boolean
}

export interface PermissionUpdate {
  name?: string
  code?: string
  module?: string
  description?: string
  is_active?: boolean
}

export interface PermissionList {
  items: Permission[]
  total: number
  page: number
  size: number
}
