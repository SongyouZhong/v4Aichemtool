import { apiClient } from './apiClient'
import type { Role, RoleCreate, RoleUpdate, RoleList, RoleSimple } from '@/types/role'
import type { Permission } from '@/types/permission'

export class RoleApiService {
  /**
   * 创建角色
   */
  static async createRole(data: RoleCreate): Promise<Role> {
    const response = await apiClient.post('/roles/', data)
    return response.data as Role
  }

  /**
   * 获取角色列表
   */
  static async getRoles(params?: {
    keyword?: string
    is_active?: boolean
    is_system?: boolean
    page?: number
    size?: number
  }): Promise<RoleList> {
    const response = await apiClient.get('/roles/', { params })
    return response.data as RoleList
  }

  /**
   * 获取用户可选择的角色列表
   */
  static async getUserRoles(): Promise<RoleSimple[]> {
    const response = await apiClient.get('/roles/user-roles')
    return response.data as RoleSimple[]
  }

  /**
   * 获取启用的角色列表
   */
  static async getActiveRoles(): Promise<Role[]> {
    const response = await apiClient.get('/roles/active')
    return response.data as Role[]
  }

  /**
   * 获取角色详情
   */
  static async getRole(id: string): Promise<Role> {
    const response = await apiClient.get(`/roles/${id}`)
    return response.data as Role
  }

  /**
   * 获取角色的权限列表
   */
  static async getRolePermissions(id: string): Promise<Permission[]> {
    const response = await apiClient.get(`/roles/${id}/permissions`)
    return response.data as Permission[]
  }

  /**
   * 更新角色
   */
  static async updateRole(id: string, data: RoleUpdate): Promise<Role> {
    const response = await apiClient.put(`/roles/${id}`, data)
    return response.data as Role
  }

  /**
   * 删除角色
   */
  static async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`)
  }
}

export const roleApi = RoleApiService
