// 数据相关的类型定义

// 分子描述符类型定义
export interface MolecularDescriptors {
  // 分子结构描述符
  maximum_graph_length?: number;
  number_of_rings?: number;
  number_of_aromatic_rings?: number;
  number_of_aliphatic_rings?: number;
  number_atoms_in_largest_ring?: number;
  // Lipinski规则相关描述符
  hba_lipinski?: number;
  hbd_lipinski?: number;
  mol_weight?: number;
  lipinski_violations?: number;
  lipinski_compliant?: boolean;
  // 分子柔性和极性描述符
  number_of_rotatable_bonds?: number;
  slog_p?: number;
  tpsa?: number;
  // 立体化学描述符
  number_of_stereo_centers?: number;
  // 药物性质评价描述符
  sa?: number;
  qed?: number;
}

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
  project_name?: string; // 添加项目名称
  attachments?: AttachmentInfo[]; // 附件信息列表
  synthesis_status?: number; // 合成状态: -1未合成, 0合成中, 1已合成
  synthesis_status_text?: string; // 合成状态文本
  quantity_summary?: string; // 数量汇总
  synthesis_count?: number; // 合成记录数
  has_activity?: boolean; // 是否有活性数据
  activity_summary?: string; // 活性数据汇总
  activity_count?: number; // 活性记录数
  descriptors?: MolecularDescriptors; // 添加分子描述符
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
// 附件信息接口
export interface AttachmentInfo {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  attachment?: string;
  attachments?: AttachmentInfo[];
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
  synthesis_status?: number; // 合成状态：-1未合成，0合成中，1已合成
  create_time: string;
  creator_id?: string;
  project_id?: string; // 添加项目ID
  quantity_summary?: string; // 数量汇总
  synthesis_count?: number; // 合成记录数
  has_activity?: boolean; // 是否有活性数据
  activity_summary?: string; // 活性数据汇总
  activity_count?: number; // 活性记录数
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
  synthesis_status?: number; // 合成状态：-1未合成，0合成中，1已合成
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
  unit: string;  // 添加单位字段
  creator_id: string;
}

export interface SyntheticRecordUpdate {
  batch?: number;
  description?: string;
  mass?: number;
  unit?: string;  // 添加单位字段
}
