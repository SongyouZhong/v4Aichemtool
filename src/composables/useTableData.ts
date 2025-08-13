// 表格相关的组合式函数
// 封装表格数据操作的逻辑

import { ref, computed } from 'vue'
import type { TableRow, ImageDialogData, Compound } from '@/types'
import { CompoundApiService } from '@/services/compoundApi'
import { SmilesApiService } from '@/services/smilesApi'

export function useTableData() {
  // 响应式数据
  const tableData = ref<TableRow[]>([])
  const rows = ref(15)
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

  // 计算属性
  const scrollable = computed(() => rows.value > 15)
  const scrollHeight = computed(() => rows.value > 15 ? '400px' : undefined)

  // 将Compound转换为TableRow
  const compoundToTableRow = (compound: Compound): TableRow => {
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
      create_time: compound.create_time,
      creator_id: compound.creator_id,
      project_id: compound.project_id, // 添加项目ID
      attachments: [], // 暂时为空数组
      has_synthesis: compound.has_synthesis || false, // 映射是否已合成字段
      quantity_summary: compound.quantity_summary || '-', // 映射数量汇总字段
      synthesis_count: compound.synthesis_count || 0, // 映射合成记录数字段
      has_activity: compound.has_activity || false, // 映射是否有活性数据字段
      activity_summary: compound.activity_summary || '-', // 映射活性数据汇总字段
      activity_count: compound.activity_count || 0 // 映射活性记录数字段
    }
  }

  // 加载表格数据（从数据库）
  const loadTableData = async (page = 1, size = 10, projectId?: string): Promise<void> => {
    loading.value = true
    try {
      const response = await CompoundApiService.getCompounds({
        page,
        size,
        ...(projectId && { project_id: projectId })
      })
      
      tableData.value = response.items.map(compoundToTableRow)
      total.value = response.total
      currentPage.value = response.page
      pageSize.value = response.size
      
      console.log('Table data loaded from database:', tableData.value.length, 'items', projectId ? `for project: ${projectId}` : '(all projects)')
    } catch (error) {
      console.error('Failed to load table data from database:', error)
      // 如果数据库查询失败，显示空数据
      tableData.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  // 加载示例数据（从数据库加载所有数据作为示例）
  const loadSampleData = async (projectId?: string): Promise<void> => {
    loading.value = true
    try {
      // 加载更多数据作为示例显示
      const response = await CompoundApiService.getCompounds({
        page: 1,
        size: 50, // 加载更多数据
        ...(projectId && { project_id: projectId })
      })
      
      tableData.value = response.items.map(compoundToTableRow)
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
      const newRow = compoundToTableRow(newCompound)
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
        
        const updatedRow = compoundToTableRow(updatedCompound)
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
    rows,
    loading,
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
    validateSmilesImage
  }
}
