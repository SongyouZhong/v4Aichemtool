// 数据相关的类型定义

// 表格行数据类型（基于Compound模型）
export interface TableRow {
  id: string;
  name: string;
  batch: number | null;
  smiles: string;
  smilesImage?: string; // 可选，暂时为空
  description: string;
  patent_issue?: string;
  patent_comment?: string;
  synthetic_priority?: number;
  create_time: string;
  creator_id?: string;
  project_id?: string; // 添加项目ID
  attachments?: string[]; // 保留以兼容现有代码
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
  synthetic_priority?: number;
  create_time: string;
  creator_id?: string;
  project_id?: string; // 添加项目ID
}

// 创建化合物请求类型
export interface CompoundCreate {
  name?: string;
  batch?: number;
  smiles?: string;
  description?: string;
  patent_issue?: string;
  patent_comment?: string;
  synthetic_priority?: number;
  creator_id?: string;
  project_id?: string; // 添加项目ID
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
  syntheticPriority: number | null;
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

// 合成记录相关类型
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
  creator_id: string;
}

export interface SyntheticRecordUpdate {
  batch?: number;
  description?: string;
  mass?: number;
}
