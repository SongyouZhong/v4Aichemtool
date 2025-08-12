import { apiClient } from './apiClient';
import type { Activity, ActivityCreate, ActivityUpdate } from '@/types/activity';

export const activityApi = {
  // 创建活性数据
  create: async (data: ActivityCreate): Promise<Activity> => {
    const response = await apiClient.post('/activities/', data);
    return response.data as Activity;
  },

  // 获取活性数据列表
  getList: async (params: {
    page?: number;
    size?: number;
    compound_id?: string;
    project_id?: string;
    assay_id?: string;
    activity_type?: string;
    activity_relation?: string;
  } = {}): Promise<any> => {
    const response = await apiClient.get('/activities/', { params });
    return response.data;
  },

  // 根据ID获取活性数据
  getById: async (id: string): Promise<Activity> => {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data as Activity;
  },

  // 根据化合物ID获取活性数据
  getByCompound: async (compoundId: string, params: {
    page?: number;
    size?: number;
  } = {}): Promise<any> => {
    const response = await apiClient.get(`/activities/compound/${compoundId}`, { params });
    return response.data;
  },

  // 根据项目ID获取活性数据
  getByProject: async (projectId: string, params: {
    page?: number;
    size?: number;
  } = {}): Promise<any> => {
    const response = await apiClient.get(`/activities/project/${projectId}`, { params });
    return response.data;
  },

  // 根据检测方法ID获取活性数据
  getByAssay: async (assayId: string, params: {
    page?: number;
    size?: number;
  } = {}): Promise<any> => {
    const response = await apiClient.get(`/activities/assay/${assayId}`, { params });
    return response.data;
  },

  // 更新活性数据
  update: async (id: string, data: ActivityUpdate): Promise<Activity> => {
    const response = await apiClient.put(`/activities/${id}`, data);
    return response.data as Activity;
  },

  // 删除活性数据
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/activities/${id}`);
  }
};
