// 数据服务层
// 提供数据操作的统一接口，方便后续切换到真实API

import type { 
  TableRow, 
  MainParameterOption, 
  ProjectData, 
  InputFormData 
} from '@/types'

// 默认输入数据定义
const defaultInputData: InputFormData = {
  mainParameter: null,
  compoundName: '',
  compoundBatch: '',
  compoundSmiles: '',
  compoundNote: '',
  syntheticPriority: null
}

// 示例输入数据定义
const sampleInputData: InputFormData = {
  mainParameter: 'project_alpha',
  compoundName: 'Sample Compound A',
  compoundBatch: 'BATCH-2024-001',
  compoundSmiles: 'CCO',
  compoundNote: 'Test compound for demonstration',
  syntheticPriority: 2
}

// 主参数选项定义
const mainParameterOptions: MainParameterOption[] = [
  { label: 'Project Alpha', value: 'project_alpha' },
  { label: 'Project Beta', value: 'project_beta' },
  { label: 'Project Gamma', value: 'project_gamma' }
]

// 项目表格数据定义
const projectTableData: ProjectData[][] = [
  [
    { label: 'Project Name', value: 'Project Alpha' },
    { label: 'Project Description', value: 'Research and development project for new compounds' }
  ],
  [
    { label: 'Project Name', value: 'Project Beta' },
    { label: 'Project Description', value: 'Production optimization and quality improvement' }
  ]
]

// 表格数据服务
export class TableDataService {
  // 获取表格数据 - 现在返回空数组，实际数据从API获取
  static async getTableData(): Promise<TableRow[]> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100))
    return []
  }

  // 添加新行 - 简化实现
  static async addTableRow(row: Omit<TableRow, 'id'>): Promise<TableRow> {
    await new Promise(resolve => setTimeout(resolve, 50))
    const newRow: TableRow = { ...row, id: `temp_${Date.now()}` }
    return newRow
  }

  // 更新行数据 - 简化实现
  static async updateTableRow(id: string, updates: Partial<TableRow>): Promise<TableRow | null> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return null // 实际实现中应该调用API
  }

  // 删除行数据 - 简化实现
  static async deleteTableRow(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return false // 实际实现中应该调用API
  }

  // 清空表格 - 简化实现
  static async clearTable(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50))
    // 实际实现中应该调用API
  }

  // 重新加载示例数据 - 现在返回空数组
  static async loadSampleData(): Promise<TableRow[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return []
  }
}

// 项目配置服务
export class ProjectService {
  // 获取主参数选项
  static async getMainParameterOptions(): Promise<MainParameterOption[]> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return [...mainParameterOptions]
  }

  // 获取项目表格数据
  static async getProjectTableData(): Promise<ProjectData[][]> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return projectTableData.map(row => [...row])
  }

  // 更新项目数据
  static async updateProjectData(data: ProjectData[][]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50))
    // 这里可以实现项目数据的更新逻辑
    console.log('Project data updated:', data)
  }
}

// 表单数据服务
export class FormDataService {
  // 获取默认表单数据
  static getDefaultFormData(): InputFormData {
    return { ...defaultInputData }
  }

  // 获取示例表单数据
  static getSampleFormData(): InputFormData {
    return { ...sampleInputData }
  }

  // 保存表单数据
  static async saveFormData(data: InputFormData): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('Form data saved:', data)
    // 这里可以实现真实的保存逻辑
  }

  // 验证表单数据
  static validateFormData(data: InputFormData): string[] {
    const errors: string[] = []
    
    if (!data.compoundName.trim()) {
      errors.push('Compound name is required')
    }
    
    if (!data.compoundBatch.trim()) {
      errors.push('Compound batch is required')
    }
    
    if (data.compoundSmiles && !this.isValidSmiles(data.compoundSmiles)) {
      errors.push('Invalid SMILES format')
    }
    
    if (data.syntheticPriority && (data.syntheticPriority < 1 || data.syntheticPriority > 3)) {
      errors.push('Synthetic priority must be between 1 and 3')
    }
    
    return errors
  }

  // 简单的SMILES格式验证
  private static isValidSmiles(smiles: string): boolean {
    // 基本的SMILES格式检查
    const smilesPattern = /^[A-Za-z0-9\[\]()=+\-#@%\/\\.*~]+$/
    return smilesPattern.test(smiles.trim())
  }
}
