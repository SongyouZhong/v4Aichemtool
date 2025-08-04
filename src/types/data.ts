// 数据相关的类型定义

// 表格行数据类型
export interface TableRow {
  id: number;
  name: string;
  batch: string;
  smiles: string;
  smilesImage: string;
  description: string;
  attachments: string[];
}

// 主参数选项类型
export interface MainParameterOption {
  label: string;
  value: string;
}

// 项目数据类型
export interface ProjectData {
  label: string;
  value: string;
}

// 后端API项目类型
export interface Project {
  id: string;
  name: string;
  description?: string;
  attachment?: string;
}

// 创建项目请求类型
export interface ProjectCreate {
  name: string;
  description?: string;
  attachment?: string;
}

// 更新项目请求类型
export interface ProjectUpdate {
  name?: string;
  description?: string;
  attachment?: string;
}

// 后端API化合物类型
export interface Compound {
  id: string;
  name?: string;
  batch?: number;
  smiles?: string;
  description?: string;
  patent_issue?: string;
  patent_comment?: string;
  synthetic_priority?: string;
  create_time: string;
  creator_id?: string;
}

// 创建化合物请求类型
export interface CompoundCreate {
  name?: string;
  batch?: number;
  smiles?: string;
  description?: string;
  patent_issue?: string;
  patent_comment?: string;
  synthetic_priority?: string;
  creator_id?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// 输入表单数据类型
export interface InputFormData {
  mainParameter: string | null;
  compoundName: string;
  compoundBatch: string;
  compoundSmiles: string;
  compoundNote: string;
}

// 图片对话框数据类型
export interface ImageDialogData {
  src: string;
  name: string;
  smiles: string;
  description: string;
}

// Ketcher 相关类型
export interface KetcherMessage {
  action: string;
  data?: any;
  messageId: number;
}

export interface KetcherResponse {
  action: string;
  success: boolean;
  data?: any;
  error?: string;
}
