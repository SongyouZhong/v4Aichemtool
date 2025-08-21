// 用户管理API服务

import { ApiClient } from './apiClient'
import type { PaginatedResponse } from './apiClient'
import type { User, UserRegister, UserCreate, UserUpdate, UserListQuery, UserApproval, UserProjectsUpdate } from '@/types/user'
import type { Project } from '@/types/data'

class UserApiService {
  private apiClient: ApiClient

  constructor() {
    this.apiClient = new ApiClient()
  }

  /**
   * 获取用户列表
   */
  async getUsers(params: UserListQuery = {}): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams()
    
    if (params.page !== undefined) queryParams.append('skip', String((params.page - 1) * (params.size || 10)))
    if (params.size !== undefined) queryParams.append('limit', String(params.size))
    if (params.department) queryParams.append('department', params.department)
    if (params.status) queryParams.append('status', params.status)
    if (params.role) queryParams.append('role', params.role)

    const response = await this.apiClient.get<User[]>(`/users/?${queryParams}`)
    
    // 由于后端返回的是数组，我们需要构造分页响应
    return {
      items: response.data,
      total: response.data.length,
      page: params.page || 1,
      size: params.size || 10,
      pages: Math.ceil(response.data.length / (params.size || 10))
    }
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: string): Promise<User> {
    const response = await this.apiClient.get<User>(`/users/${id}`)
    return response.data
  }

  /**
   * 根据手机号获取用户
   */
  async getUserByPhone(phone: string): Promise<User> {
    const response = await this.apiClient.get<User>(`/users/phone/${phone}`)
    return response.data
  }

  /**
   * 用户注册
   */
  async registerUser(userData: UserRegister): Promise<User> {
    const response = await this.apiClient.post<User>('/users/register', userData)
    return response.data
  }

  /**
   * 创建用户
   */
  async createUser(userData: UserCreate): Promise<User> {
    const response = await this.apiClient.post<User>('/users/', userData)
    return response.data
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, userData: UserUpdate): Promise<User> {
    const response = await this.apiClient.put<User>(`/users/${id}`, userData)
    return response.data
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<void> {
    await this.apiClient.delete(`/users/${id}`)
  }

  /**
   * 获取待审批用户列表
   */
  async getPendingUsers(params: UserListQuery = {}): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams()
    
    if (params.page !== undefined) queryParams.append('skip', String((params.page - 1) * (params.size || 10)))
    if (params.size !== undefined) queryParams.append('limit', String(params.size))

    const response = await this.apiClient.get<User[]>(`/users/pending?${queryParams}`)
    
    return {
      items: response.data,
      total: response.data.length,
      page: params.page || 1,
      size: params.size || 10,
      pages: Math.ceil(response.data.length / (params.size || 10))
    }
  }

  /**
   * 审批用户
   */
  async approveUser(userId: string, approvalData: UserApproval): Promise<User> {
    const response = await this.apiClient.post<User>(`/users/${userId}/approve`, approvalData)
    return response.data
  }

  /**
   * 重置用户密码
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    await this.apiClient.post(`/users/${userId}/reset-password`, { new_password: newPassword })
  }

  /**
   * 重置用户密码为随机8位密码
   */
  async resetUserPasswordRandom(userId: string): Promise<{ message: string; new_password: string }> {
    const response = await this.apiClient.post<{ message: string; new_password: string }>(`/users/${userId}/reset-password-random`)
    return response.data
  }

  /**
   * 用户身份验证
   */
  async authenticateUser(phone: string, password: string): Promise<any> {
    const response = await this.apiClient.post('/users/authenticate', { phone, password })
    return response.data
  }

  /**
   * 检查手机号是否已存在
   */
  async checkPhoneExists(phone: string): Promise<boolean> {
    try {
      await this.getUserByPhone(phone)
      return true
    } catch (error: any) {
      if (error.status === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * 获取用户参与的项目列表
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    const response = await this.apiClient.get<Project[]>(`/users/${userId}/projects`)
    return response.data
  }

  /**
   * 更新用户的项目关联
   */
  async updateUserProjects(userId: string, projectIds: string[]): Promise<Project[]> {
    const response = await this.apiClient.put<Project[]>(`/users/${userId}/projects`, { project_ids: projectIds })
    return response.data
  }

  /**
   * 将用户添加到项目
   */
  async addUserToProject(userId: string, projectId: string): Promise<void> {
    await this.apiClient.post(`/users/${userId}/projects`, { project_id: projectId })
  }

  /**
   * 将用户从项目中移除
   */
  async removeUserFromProject(userId: string, projectId: string): Promise<void> {
    await this.apiClient.delete(`/users/${userId}/projects/${projectId}`)
  }
}

// 导出单例实例
export const userApi = new UserApiService()
export default userApi
