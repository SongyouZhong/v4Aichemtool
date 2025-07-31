// 表格相关的组合式函数
// 封装表格数据操作的逻辑

import { ref, computed } from 'vue'
import type { TableRow, ImageDialogData } from '@/types'
import { TableDataService } from '@/services/dataService'

export function useTableData() {
  // 响应式数据
  const tableData = ref<TableRow[]>([])
  const rows = ref(15)
  const loading = ref(false)
  
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

  // 加载表格数据
  const loadTableData = async (): Promise<void> => {
    loading.value = true
    try {
      tableData.value = await TableDataService.getTableData()
      console.log('Table data loaded:', tableData.value.length, 'items')
    } catch (error) {
      console.error('Failed to load table data:', error)
    } finally {
      loading.value = false
    }
  }

  // 加载示例数据
  const loadSampleData = async (): Promise<void> => {
    loading.value = true
    try {
      tableData.value = await TableDataService.loadSampleData()
      console.log('Sample data loaded:', tableData.value.length, 'items')
    } catch (error) {
      console.error('Failed to load sample data:', error)
    } finally {
      loading.value = false
    }
  }

  // 添加新行
  const addNewRow = async (): Promise<void> => {
    try {
      const newRow = await TableDataService.addTableRow({
        name: 'New Compound',
        batch: '',
        smiles: '',
        smilesImage: '',
        description: '',
        attachments: []
      })
      tableData.value.push(newRow)
      console.log('New row added:', newRow)
    } catch (error) {
      console.error('Failed to add new row:', error)
    }
  }

  // 编辑行
  const editRow = async (row: TableRow): Promise<void> => {
    console.log('Editing row:', row)
    // 这里可以打开编辑对话框或进入编辑模式
    // 目前使用简单的prompt演示
    const newName = prompt('Edit name:', row.name)
    if (newName !== null && newName !== row.name) {
      try {
        const updatedRow = await TableDataService.updateTableRow(row.id, { name: newName })
        if (updatedRow) {
          const index = tableData.value.findIndex(r => r.id === row.id)
          if (index !== -1) {
            tableData.value[index] = updatedRow
          }
        }
      } catch (error) {
        console.error('Failed to update row:', error)
      }
    }
  }

  // 删除行
  const deleteRow = async (row: TableRow): Promise<void> => {
    if (!confirm(`Are you sure you want to delete "${row.name}"?`)) {
      return
    }

    try {
      const success = await TableDataService.deleteTableRow(row.id)
      if (success) {
        const index = tableData.value.findIndex(r => r.id === row.id)
        if (index !== -1) {
          tableData.value.splice(index, 1)
          console.log('Row deleted:', row)
        }
      }
    } catch (error) {
      console.error('Failed to delete row:', error)
    }
  }

  // 清空表格
  const clearTable = async (): Promise<void> => {
    if (!confirm('Are you sure you want to clear all table data?')) {
      return
    }

    try {
      await TableDataService.clearTable()
      tableData.value = []
      console.log('Table cleared')
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

  // 处理图片错误
  const handleImageError = (event: Event): void => {
    const img = event.target as HTMLImageElement
    console.warn('Failed to load SMILES image:', img.src)
    img.style.display = 'none'
  }

  return {
    // 响应式数据
    tableData,
    rows,
    loading,
    showImageDialog,
    selectedImage,
    
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
    handleImageError
  }
}
