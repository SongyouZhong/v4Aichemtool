import { apiClient } from './apiClient';
import type { Assay, AssayCreate } from '@/types/activity';

export const assayApi = {
  // 创建检测方法
  create: async (data: AssayCreate): Promise<Assay> => {
    const response = await apiClient.post('/assays/', data);
    return response.data as Assay;
  },

  // 获取检测方法列表
  getList: async (params: {
    page?: number;
    size?: number;
  } = {}): Promise<any> => {
    const response = await apiClient.get('/assays/', { params });
    return response.data;
  },

  // 获取所有检测方法(用于下拉选项)
  getAll: async (): Promise<Assay[]> => {
    const response = await apiClient.get('/assays/all');
    return response.data as Assay[];
  },

  // 根据ID获取检测方法
  getById: async (id: string): Promise<Assay> => {
    const response = await apiClient.get(`/assays/${id}`);
    return response.data as Assay;
  },

  // 更新检测方法
  update: async (id: string, data: Partial<Assay>): Promise<Assay> => {
    const response = await apiClient.put(`/assays/${id}`, data);
    return response.data as Assay;
  },

  // 删除检测方法
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/assays/${id}`);
  }
};
