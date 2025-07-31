// 数据服务层
// 提供数据操作的统一接口，方便后续切换到真实API

import type { 
  TableRow, 
  MainParameterOption, 
  ProjectData, 
  InputFormData 
} from '@/types'
import { 
  sampleTableData, 
  mainParameterOptions, 
  projectTableData,
  defaultInputData,
  sampleInputData 
} from '@/data/mockData'

// 表格数据服务
export class TableDataService {
  // 获取表格数据
  static async getTableData(): Promise<TableRow[]> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...sampleTableData]
  }

  // 添加新行
  static async addTableRow(row: Omit<TableRow, 'id'>): Promise<TableRow> {
    await new Promise(resolve => setTimeout(resolve, 50))
    const newId = Math.max(...sampleTableData.map(r => r.id), 0) + 1
    const newRow: TableRow = { ...row, id: newId }
    sampleTableData.push(newRow)
    return newRow
  }

  // 更新行数据
  static async updateTableRow(id: number, updates: Partial<TableRow>): Promise<TableRow | null> {
    await new Promise(resolve => setTimeout(resolve, 50))
    const index = sampleTableData.findIndex(row => row.id === id)
    if (index === -1) return null
    
    sampleTableData[index] = { ...sampleTableData[index], ...updates }
    return sampleTableData[index]
  }

  // 删除行数据
  static async deleteTableRow(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 50))
    const index = sampleTableData.findIndex(row => row.id === id)
    if (index === -1) return false
    
    sampleTableData.splice(index, 1)
    return true
  }

  // 清空表格
  static async clearTable(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50))
    sampleTableData.length = 0
  }

  // 重新加载示例数据
  static async loadSampleData(): Promise<TableRow[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    sampleTableData.length = 0
    sampleTableData.push(...[
      {
        id: 1,
        name: 'Caffeine',
        batch: 'CHM-2024-001',
        smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
        smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CN1C%3DNC2%3DC1C(%3DO)N(C(%3DO)N2C)C/PNG',
        description: 'Central nervous system stimulant, commonly found in coffee and tea',
        attachments: ['caffeine_analysis.pdf', 'nmr_data.xlsx', 'purity_report.doc']
      },
      {
        id: 2,
        name: 'Aspirin',
        batch: 'PHM-2024-002',
        smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
        smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC(%3DO)OC1%3DCC%3DCC%3DC1C(%3DO)O/PNG',
        description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for pain relief',
        attachments: ['aspirin_synthesis.pdf', 'quality_control.xlsx']
      },
      {
        id: 3,
        name: 'Ethanol',
        batch: 'SOL-2024-006',
        smiles: 'CCO',
        smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CCO/PNG',
        description: 'Common alcohol used as solvent and in pharmaceutical preparations',
        attachments: ['ethanol_purity.pdf']
      }
    ])
    return [...sampleTableData]
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
    
    return errors
  }

  // 简单的SMILES格式验证
  private static isValidSmiles(smiles: string): boolean {
    // 基本的SMILES格式检查
    const smilesPattern = /^[A-Za-z0-9\[\]()=+\-#@%\/\\.*~]+$/
    return smilesPattern.test(smiles.trim())
  }
}
