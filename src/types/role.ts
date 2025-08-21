// 角色相关类型定义
import type { Permission } from './permission'

export interface Role {
  id: string
  name: string
  description?: string
  is_active: boolean
  is_system: boolean
  create_time: string
  update_time: string
  permissions: Permission[]
}

export interface RoleCreate {
  name: string
  description?: string
  is_active?: boolean
  permission_ids: string[]
}

export interface RoleUpdate {
  name?: string
  description?: string
  is_active?: boolean
  permission_ids?: string[]
}

export interface RoleList {
  items: Role[]
  total: number
  page: number
  size: number
}

export interface RoleSimple {
  id: string
  name: string
  description?: string
}
