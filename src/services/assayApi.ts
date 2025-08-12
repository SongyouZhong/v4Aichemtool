import { apiClient } from './apiClient';
import type { Assay, AssayCreate } from '@/types/activity';

export const assayApi = {
  // 创建检测方法
  create: async (data: AssayCreate): Promise<Assay> => {
    const response = await apiClient.post('/api/v1/assays/', data);
    return response.data as Assay;
  },

  // 获取检测方法列表
  getList: async (params: {
    page?: number;
    size?: number;
  } = {}): Promise<any> => {
    const response = await apiClient.get('/api/v1/assays/', { params });
    return response.data;
  },

  // 根据ID获取检测方法
  getById: async (id: string): Promise<Assay> => {
    const response = await apiClient.get(`/api/v1/assays/${id}`);
    return response.data as Assay;
  },

  // 更新检测方法
  update: async (id: string, data: Partial<Assay>): Promise<Assay> => {
    const response = await apiClient.put(`/api/v1/assays/${id}`, data);
    return response.data as Assay;
  },

  // 删除检测方法
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/assays/${id}`);
  }
};
