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
