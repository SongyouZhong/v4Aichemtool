import { apiClient } from './apiClient'
import type { Permission, PermissionCreate, PermissionUpdate, PermissionList } from '@/types/permission'

export class PermissionApiService {
  /**
   * 创建权限
   */
  static async createPermission(data: PermissionCreate): Promise<Permission> {
    const response = await apiClient.post('/permissions/', data)
    return response.data as Permission
  }

  /**
   * 获取权限列表
   */
  static async getPermissions(params?: {
    keyword?: string
    module?: string
    is_active?: boolean
    page?: number
    size?: number
  }): Promise<PermissionList> {
    const response = await apiClient.get('/permissions/', { params })
    return response.data as PermissionList
  }

  /**
   * 获取启用的权限列表
   */
  static async getActivePermissions(): Promise<Permission[]> {
    const response = await apiClient.get('/permissions/active')
    return response.data as Permission[]
  }

  /**
   * 获取权限模块列表
   */
  static async getPermissionModules(): Promise<string[]> {
    const response = await apiClient.get('/permissions/modules')
    return response.data as string[]
  }

  /**
   * 获取权限详情
   */
  static async getPermission(id: string): Promise<Permission> {
    const response = await apiClient.get(`/permissions/${id}`)
    return response.data as Permission
  }

  /**
   * 更新权限
   */
  static async updatePermission(id: string, data: PermissionUpdate): Promise<Permission> {
    const response = await apiClient.put(`/permissions/${id}`, data)
    return response.data as Permission
  }

  /**
   * 删除权限
   */
  static async deletePermission(id: string): Promise<void> {
    await apiClient.delete(`/permissions/${id}`)
  }
}

export const permissionApi = PermissionApiService
