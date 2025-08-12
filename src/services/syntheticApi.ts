// 合成记录API服务
import { apiClient } from './apiClient';
import type { PaginatedResponse } from '@/types/data';

export interface SyntheticRecord {
  id: string;
  compound_id: string;
  batch: number;
  description?: string;
  mass?: number;
  unit: string;
  quantity: number;
  create_time: string;
  creator_id: string;
  creator_name: string;
}

export interface SyntheticRecordCreate {
  compound_id: string;
  batch: number;
  description?: string;
  mass: number;
  unit: string;  // 添加单位字段
  creator_id: string;
}

export interface SyntheticRecordUpdate {
  batch?: number;
  description?: string;
  mass?: number;
  unit?: string;  // 添加单位字段
}

export class SyntheticApiService {
  private static baseUrl = '/synthetics';

  /**
   * 根据化合物ID获取合成记录列表
   */
  static async getSyntheticsByCompound(
    compoundId: string,
    page = 1,
    size = 10
  ): Promise<PaginatedResponse<SyntheticRecord>> {
    const response = await apiClient.get(`${this.baseUrl}/compound/${compoundId}`, {
      params: { page, size }
    });
    return response.data as PaginatedResponse<SyntheticRecord>;
  }

  /**
   * 创建新的合成记录
   */
  static async createSynthetic(data: SyntheticRecordCreate): Promise<SyntheticRecord> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data as SyntheticRecord;
  }

  /**
   * 更新合成记录
   */
  static async updateSynthetic(id: string, data: SyntheticRecordUpdate): Promise<SyntheticRecord> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data as SyntheticRecord;
  }

  /**
   * 删除合成记录
   */
  static async deleteSynthetic(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data as { message: string };
  }

  /**
   * 根据ID获取单个合成记录
   */
  static async getSynthetic(id: string): Promise<SyntheticRecord> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data as SyntheticRecord;
  }
}

// 创建兼容的导出，便于其他地方使用
export const syntheticApi = {
  getByCompound: (compoundId: string, params: { size?: number } = {}) => 
    SyntheticApiService.getSyntheticsByCompound(compoundId, 1, params.size || 100),
  getById: SyntheticApiService.getSynthetic,
  create: SyntheticApiService.createSynthetic,
  update: SyntheticApiService.updateSynthetic,
  delete: SyntheticApiService.deleteSynthetic
}
