// 项目API服务
// 提供项目相关的API调用方法

import { apiClient, type PaginatedResponse } from './apiClient'
import { API_ENDPOINTS, PAGINATION_CONFIG } from './apiConfig'
import type { Project, ProjectCreate, ProjectUpdate } from '@/types/data'

export class ProjectApiService {
  // 获取项目列表
  static async getProjects(params: {
    page?: number
    size?: number
    name?: string
  } = {}): Promise<PaginatedResponse<Project>> {
    const queryParams = {
      page: params.page || PAGINATION_CONFIG.DEFAULT_PAGE,
      size: params.size || PAGINATION_CONFIG.DEFAULT_SIZE,
      ...(params.name && { name: params.name })
    }

    const response = await apiClient.get<PaginatedResponse<Project>>(
      API_ENDPOINTS.PROJECTS.LIST,
      queryParams
    )
    
    return response.data
  }

  // 根据ID获取项目
  static async getProject(id: string): Promise<Project> {
    const response = await apiClient.get<Project>(
      API_ENDPOINTS.PROJECTS.GET(id)
    )
    
    return response.data
  }

  // 创建新项目
  static async createProject(projectData: ProjectCreate): Promise<Project> {
    const response = await apiClient.post<Project>(
      API_ENDPOINTS.PROJECTS.CREATE,
      projectData
    )
    
    return response.data
  }

  // 更新项目
  static async updateProject(id: string, projectData: ProjectUpdate): Promise<Project> {
    const response = await apiClient.put<Project>(
      API_ENDPOINTS.PROJECTS.UPDATE(id),
      projectData
    )
    
    return response.data
  }

  // 删除项目
  static async deleteProject(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.PROJECTS.DELETE(id)
    )
    
    return response.data
  }

  // 搜索项目（根据名称）
  static async searchProjects(name: string, page = 1, size = 10): Promise<PaginatedResponse<Project>> {
    return this.getProjects({ page, size, name })
  }

  // 获取所有项目（不分页，用于下拉选择等场景）
  static async getAllProjects(): Promise<Project[]> {
    const response = await this.getProjects({ 
      page: 1, 
      size: PAGINATION_CONFIG.MAX_SIZE 
    })
    
    return response.items
  }
}

// 创建兼容的导出，便于其他地方使用
export const projectApi = {
  getList: ProjectApiService.getProjects,
  getById: ProjectApiService.getProject,
  create: ProjectApiService.createProject,
  update: ProjectApiService.updateProject,
  delete: ProjectApiService.deleteProject,
  getAll: ProjectApiService.getAllProjects
}
