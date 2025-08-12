// 化合物API服务
// 提供化合物相关的API调用方法

import { apiClient, type PaginatedResponse } from './apiClient'
import { API_ENDPOINTS, PAGINATION_CONFIG } from './apiConfig'
import type { Compound, CompoundCreate } from '@/types/data'

export class CompoundApiService {
  // 获取化合物列表
  static async getCompounds(params: {
    page?: number
    size?: number
    name?: string
    project_id?: string
  } = {}): Promise<PaginatedResponse<Compound>> {
    const queryParams = {
      page: params.page || PAGINATION_CONFIG.DEFAULT_PAGE,
      size: params.size || PAGINATION_CONFIG.DEFAULT_SIZE,
      ...(params.name && { name: params.name }),
      ...(params.project_id && { project_id: params.project_id })
    }

    const response = await apiClient.get<PaginatedResponse<Compound>>(
      API_ENDPOINTS.COMPOUNDS.LIST,
      queryParams
    )
    
    return response.data
  }

  // 根据ID获取化合物
  static async getCompound(id: string): Promise<Compound> {
    const response = await apiClient.get<Compound>(
      API_ENDPOINTS.COMPOUNDS.GET(id)
    )
    
    return response.data
  }

  // 创建新化合物
  static async createCompound(compoundData: CompoundCreate): Promise<Compound> {
    const response = await apiClient.post<Compound>(
      API_ENDPOINTS.COMPOUNDS.CREATE,
      compoundData
    )
    
    return response.data
  }

  // 更新化合物
  static async updateCompound(id: string, compoundData: Partial<CompoundCreate>): Promise<Compound> {
    const response = await apiClient.put<Compound>(
      API_ENDPOINTS.COMPOUNDS.UPDATE(id),
      compoundData
    )
    
    return response.data
  }

  // 删除化合物
  static async deleteCompound(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.COMPOUNDS.DELETE(id)
    )
    
    return response.data
  }

  // 批量创建化合物
  static async createCompounds(compoundsData: CompoundCreate[]): Promise<Compound[]> {
    const response = await apiClient.post<Compound[]>(
      API_ENDPOINTS.COMPOUNDS.CREATE + '/batch',
      { compounds: compoundsData }
    )
    
    return response.data
  }

  // SMILES相似性搜索
  static async searchSimilarCompounds(params: {
    target_smiles: string
    similarity_threshold: number
    project_id?: string
  }): Promise<{
    message: string
    target_smiles: string
    similarity_threshold: number
    project_id?: string
    total_searched: number
    total_found: number
    results: Array<Compound & { similarity: number }>
  }> {
    const queryParams = {
      target_smiles: params.target_smiles,
      similarity_threshold: params.similarity_threshold,
      ...(params.project_id && { project_id: params.project_id })
    }

    const response = await apiClient.get<{
      message: string
      target_smiles: string
      similarity_threshold: number
      project_id?: string
      total_searched: number
      total_found: number
      results: Array<Compound & { similarity: number }>
    }>(
      API_ENDPOINTS.COMPOUNDS.LIST + '/similarity-search',
      queryParams
    )
    
    return response.data
  }

  // 精确SMILES搜索
  static async searchBySmiles(params: {
    smiles: string
    project_id?: string
    page?: number
    size?: number
  }): Promise<PaginatedResponse<Compound>> {
    const queryParams = {
      page: params.page || PAGINATION_CONFIG.DEFAULT_PAGE,
      size: params.size || PAGINATION_CONFIG.DEFAULT_SIZE,
      smiles: params.smiles,
      ...(params.project_id && { project_id: params.project_id })
    }

    const response = await apiClient.get<PaginatedResponse<Compound>>(
      API_ENDPOINTS.COMPOUNDS.LIST,
      queryParams
    )
    
    return response.data
  }
}

// 创建兼容的导出，便于其他地方使用
export const compoundApi = {
  getList: CompoundApiService.getCompounds,
  getById: CompoundApiService.getCompound,
  create: CompoundApiService.createCompound,
  update: CompoundApiService.updateCompound,
  delete: CompoundApiService.deleteCompound
}
