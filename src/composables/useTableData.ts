// 表格相关的组合式函数
// 封装表格数据操作的逻辑

import { ref, computed } from 'vue'
import type { TableRow, ImageDialogData, Compound, MolecularDescriptors } from '@/types'
import { CompoundApiService } from '@/services/compoundApi'
import { SmilesApiService } from '@/services/smilesApi'
import { DescriptorApiService } from '@/services/descriptorApi'
import { ProjectApiService } from '@/services/projectApi'
import { useCompoundAggregation, type AggregatedCompound } from '@/composables/useCompoundAggregation'

export function useTableData() {
  // 响应式数据
  const tableData = ref<TableRow[]>([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  
  // 图片对话框
  const showImageDialog = ref(false)
  const selectedImage = ref<ImageDialogData>({
    src: '',
    name: '',
    smiles: '',
    description: ''
  })

  // 使用聚合功能
  const { aggregateCompoundsInfo, loading: aggregationLoading } = useCompoundAggregation()

  // 获取项目名称映射
  const getProjectNameMap = async (): Promise<Map<string, string>> => {
    try {
      // 使用 getAllProjects 方法而不是直接使用大的 size 值
      const projects = await ProjectApiService.getAllProjects()
      const projectMap = new Map<string, string>()
      projects.forEach(project => {
        projectMap.set(project.id, project.name)
      })
      return projectMap
    } catch (error) {
      console.error('Failed to load project names:', error)
      return new Map()
    }
  }

  // 计算属性
  const scrollable = computed(() => pageSize.value > 15)
  const scrollHeight = computed(() => pageSize.value > 15 ? '400px' : undefined)

  // 批量获取分子描述符
  const aggregateDescriptors = async (compounds: AggregatedCompound[]): Promise<AggregatedCompound[]> => {
    try {
      // 提取所有有效的SMILES
      const smilesData = compounds
        .filter(compound => compound.smiles && compound.smiles.trim())
        .map(compound => ({ 
          id: compound.id, 
          smiles: compound.smiles!.trim() 
        }))

      if (smilesData.length === 0) {
        return compounds
      }

      // 批量获取描述符
      const smilesList = smilesData.map(item => item.smiles)
      const descriptors = await DescriptorApiService.getBatchDescriptors(smilesList)

      // 创建SMILES到描述符的映射
      const descriptorMap = new Map<string, MolecularDescriptors>()
      descriptors.forEach(desc => {
        if (desc.smiles) {
          descriptorMap.set(desc.smiles, {
            // 分子结构描述符
            maximum_graph_length: desc.maximum_graph_length,
            number_of_rings: desc.number_of_rings,
            number_of_aromatic_rings: desc.number_of_aromatic_rings,
            number_of_aliphatic_rings: desc.number_of_aliphatic_rings,
            number_atoms_in_largest_ring: desc.number_atoms_in_largest_ring,
            // Lipinski规则相关描述符
            hba_lipinski: desc.hba_lipinski,
            hbd_lipinski: desc.hbd_lipinski,
            mol_weight: desc.mol_weight,
            lipinski_violations: desc.lipinski_violations,
            lipinski_compliant: desc.lipinski_compliant,
            // 分子柔性和极性描述符
            number_of_rotatable_bonds: desc.number_of_rotatable_bonds,
            slog_p: desc.slog_p,
            tpsa: desc.tpsa,
            // 立体化学描述符
            number_of_stereo_centers: desc.number_of_stereo_centers,
            // 药物性质评价描述符
            sa: desc.sa,
            qed: desc.qed
          })
        }
      })

      // 将描述符附加到化合物数据
      const result = compounds.map(compound => ({
        ...compound,
        descriptors: compound.smiles ? descriptorMap.get(compound.smiles.trim()) : undefined
      }))

      console.log(`Successfully aggregated descriptors for ${descriptors.length} compounds`)
      return result

    } catch (error) {
      console.error('Failed to aggregate descriptors:', error)
      // 如果描述符聚合失败，返回原始数据
      return compounds
    }
  }

  // 将AggregatedCompound转换为TableRow（增强版，包含描述符）
  const aggregatedCompoundToTableRow = (compound: AggregatedCompound & { descriptors?: MolecularDescriptors }, projectNameMap?: Map<string, string>): TableRow => {
    return {
      id: compound.id,
      name: compound.name || '',
      batch: compound.batch || null,
      smiles: compound.smiles || '',
      smilesImage: compound.smiles ? SmilesApiService.getSmilesImageUrl(compound.smiles) : '', // 使用SMILES API生成图片URL
      description: compound.description || '',
      patent_issue: compound.patent_issue,
      patent_comment: compound.patent_comment,
      synthetic_priority: compound.synthetic_priority,
      synthesis_status: compound.synthesis_status, // 添加合成状态字段
      create_time: compound.create_time,
      creator_id: compound.creator_id,
      project_id: compound.project_id, // 添加项目ID
      project_name: projectNameMap && compound.project_id ? projectNameMap.get(compound.project_id) : undefined, // 添加项目名称
      attachments: [], // 暂时为空数组
      quantity_summary: compound.quantity_summary, // 使用聚合后的数量汇总
      synthesis_count: compound.synthesis_count, // 使用聚合后的合成记录数
      has_activity: compound.has_activity, // 使用聚合后的活性信息
      activity_summary: compound.activity_summary, // 使用聚合后的活性汇总
      activity_count: compound.activity_count, // 使用聚合后的活性记录数
      descriptors: compound.descriptors // 添加分子描述符
    }
  }

  // 将普通Compound转换为TableRow（用于基础信息显示）
  const compoundToTableRow = (compound: Compound, projectNameMap?: Map<string, string>): TableRow => {
    return {
      id: compound.id,
      name: compound.name || '',
      batch: compound.batch || null,
      smiles: compound.smiles || '',
      smilesImage: compound.smiles ? SmilesApiService.getSmilesImageUrl(compound.smiles) : '', // 使用SMILES API生成图片URL
      description: compound.description || '',
      patent_issue: compound.patent_issue,
      patent_comment: compound.patent_comment,
      synthetic_priority: compound.synthetic_priority,
      synthesis_status: compound.synthesis_status, // 添加合成状态字段
      create_time: compound.create_time,
      creator_id: compound.creator_id,
      project_id: compound.project_id, // 添加项目ID
      project_name: projectNameMap && compound.project_id ? projectNameMap.get(compound.project_id) : undefined, // 添加项目名称
      attachments: [], // 暂时为空数组
      quantity_summary: '-', // 默认值，等待聚合
      synthesis_count: 0, // 默认值，等待聚合
      has_activity: false, // 默认值，等待聚合
      activity_summary: '-', // 默认值，等待聚合
      activity_count: 0 // 默认值，等待聚合
    }
  }

  // 加载表格数据（从数据库）
  const loadTableData = async (page = 1, size = 10, projectId?: string, includeNoSynthesis = true): Promise<void> => {
    loading.value = true
    try {
      // 1. 首先获取基础化合物数据
      const response = await CompoundApiService.getCompounds({
        page,
        size,
        include_no_synthesis: includeNoSynthesis,
        ...(projectId && { project_id: projectId })
      })
      
      // 2. 获取项目名称映射
      const projectNameMap = await getProjectNameMap()
      
      // 3. 聚合合成和活性信息
      const aggregatedCompounds = await aggregateCompoundsInfo(response.items)
      
      // 4. 聚合分子描述符信息
      const compoundsWithDescriptors = await aggregateDescriptors(aggregatedCompounds)
      
      // 5. 转换为TableRow格式
      tableData.value = compoundsWithDescriptors.map(compound => 
        aggregatedCompoundToTableRow(compound, projectNameMap)
      )
      total.value = response.total
      currentPage.value = response.page
      pageSize.value = response.size
      
      console.log('Table data loaded with full aggregation (synthesis, activity, descriptors):', tableData.value.length, 'items', projectId ? `for project: ${projectId}` : '(all projects)')
    } catch (error) {
      console.error('Failed to load table data:', error)
      // 如果聚合失败，尝试只加载基础数据
      try {
        const response = await CompoundApiService.getCompounds({
          page,
          size,
          include_no_synthesis: includeNoSynthesis,
          ...(projectId && { project_id: projectId })
        })
        
        const projectNameMap = await getProjectNameMap()
        tableData.value = response.items.map(compound => compoundToTableRow(compound, projectNameMap))
        total.value = response.total
        currentPage.value = response.page
        pageSize.value = response.size
        
        console.warn('Loaded basic compound data without aggregation due to error')
      } catch (fallbackError) {
        console.error('Failed to load even basic compound data:', fallbackError)
        tableData.value = []
        total.value = 0
      }
    } finally {
      loading.value = false
    }
  }

  // 加载示例数据（从数据库加载所有数据作为示例）
  const loadSampleData = async (projectId?: string, includeNoSynthesis = true): Promise<void> => {
    loading.value = true
    try {
      // 加载更多数据作为示例显示
      const response = await CompoundApiService.getCompounds({
        page: 1,
        size: 50, // 加载更多数据
        include_no_synthesis: includeNoSynthesis,
        ...(projectId && { project_id: projectId })
      })
      
      const projectNameMap = await getProjectNameMap()
      tableData.value = response.items.map(compound => compoundToTableRow(compound, projectNameMap))
      total.value = response.total
      
      console.log('Sample data loaded from database:', tableData.value.length, 'items', projectId ? `for project: ${projectId}` : '(all projects)')
    } catch (error) {
      console.error('Failed to load sample data from database:', error)
      tableData.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  // 添加新行（创建新化合物）
  const addNewRow = async (projectId?: string): Promise<void> => {
    try {
      const newCompoundData = {
        name: 'New Compound',
        batch: 1,
        smiles: '',
        description: 'New compound created from table',
        creator_id: 'current_user',
        ...(projectId && { project_id: projectId })
      }
      
      const newCompound = await CompoundApiService.createCompound(newCompoundData)
      const projectNameMap = await getProjectNameMap()
      const newRow = compoundToTableRow(newCompound, projectNameMap)
      tableData.value.push(newRow)
      total.value += 1
      
      console.log('New compound added:', newCompound)
    } catch (error) {
      console.error('Failed to add new compound:', error)
      alert('添加化合物失败，请稍后重试。')
    }
  }

  // 编辑行（更新化合物）
  const editRow = async (row: TableRow): Promise<void> => {
    console.log('Editing compound:', row)
    // 这里可以打开编辑对话框或进入编辑模式
    // 目前使用简单的prompt演示
    const newName = prompt('Edit compound name:', row.name)
    if (newName !== null && newName !== row.name) {
      try {
        const updatedCompound = await CompoundApiService.updateCompound(row.id, { 
          name: newName 
        })
        
        const projectNameMap = await getProjectNameMap()
        const updatedRow = compoundToTableRow(updatedCompound, projectNameMap)
        const index = tableData.value.findIndex(r => r.id === row.id)
        if (index !== -1) {
          tableData.value[index] = updatedRow
        }
        console.log('Compound updated:', updatedCompound)
      } catch (error) {
        console.error('Failed to update compound:', error)
        alert('更新化合物失败，请稍后重试。')
      }
    }
  }

  // 删除行（删除化合物）
  const deleteRow = async (row: TableRow): Promise<void> => {
    if (!confirm(`Are you sure you want to delete compound "${row.name}"?`)) {
      return
    }

    try {
      await CompoundApiService.deleteCompound(row.id)
      
      const index = tableData.value.findIndex(r => r.id === row.id)
      if (index !== -1) {
        tableData.value.splice(index, 1)
        total.value -= 1
        console.log('Compound deleted:', row)
      }
    } catch (error) {
      console.error('Failed to delete compound:', error)
      alert('删除化合物失败，请稍后重试。')
    }
  }

  // 清空表格（注意：这将删除所有化合物数据）
  const clearTable = async (): Promise<void> => {
    if (!confirm('Are you sure you want to clear all compound data? This action cannot be undone!')) {
      return
    }

    try {
      // 由于这是危险操作，我们只清空前端显示的数据
      // 实际的数据库清空操作应该需要管理员权限
      tableData.value = []
      total.value = 0
      console.log('Table display cleared (database data preserved)')
      alert('表格显示已清空。如需删除数据库中的数据，请使用管理员权限。')
    } catch (error) {
      console.error('Failed to clear table:', error)
    }
  }

  // 显示图片模态框
  const showImageModal = (row: TableRow): void => {
    if (row.smilesImage) {
      selectedImage.value = {
        src: row.smilesImage,
        name: row.name,
        smiles: row.smiles,
        description: row.description
      }
      showImageDialog.value = true
    }
  }

  // 处理图片错误
  const handleImageError = (event: Event): void => {
    const img = event.target as HTMLImageElement
    console.warn('Failed to load SMILES image:', img.src)
    // 隐藏无法加载的图片，显示占位文本
    img.style.display = 'none'
    
    // 可选：在图片旁边显示错误提示
    const parent = img.parentElement
    if (parent && !parent.querySelector('.image-error-text')) {
      const errorText = document.createElement('div')
      errorText.className = 'image-error-text no-image'
      errorText.textContent = '图片加载失败'
      parent.appendChild(errorText)
    }
  }

  // 验证并刷新SMILES图片
  const validateSmilesImage = async (smiles: string): Promise<string> => {
    if (!smiles || smiles.trim() === '') {
      return ''
    }

    if (!SmilesApiService.isValidSmiles(smiles)) {
      console.warn('Invalid SMILES format:', smiles)
      return ''
    }

    const imageUrl = SmilesApiService.getSmilesImageUrl(smiles)
    const isValid = await SmilesApiService.preloadSmilesImage(smiles)
    
    return isValid ? imageUrl : ''
  }

  // 关闭图片对话框
  const closeImageDialog = (): void => {
    showImageDialog.value = false
    selectedImage.value = {
      src: '',
      name: '',
      smiles: '',
      description: ''
    }
  }

  // 下载图片
  const downloadImage = async (): Promise<void> => {
    if (!selectedImage.value.src) return
    
    try {
      const response = await fetch(selectedImage.value.src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedImage.value.name.replace(/\s+/g, '_')}_structure.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
      console.log('Image downloaded successfully')
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Failed to download image. Please try again.')
    }
  }

  return {
    // 响应式数据
    tableData,
    loading: computed(() => loading.value || aggregationLoading.value), // 合并加载状态
    showImageDialog,
    selectedImage,
    total,
    currentPage,
    pageSize,
    
    // 计算属性
    scrollable,
    scrollHeight,
    
    // 方法
    loadTableData,
    loadSampleData,
    addNewRow,
    editRow,
    deleteRow,
    clearTable,
    showImageModal,
    closeImageDialog,
    downloadImage,
    handleImageError,
    validateSmilesImage,
    
    // 新增：直接暴露聚合功能
    aggregateCompoundsInfo,
    aggregatedCompoundToTableRow
  }
}
