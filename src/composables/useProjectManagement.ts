// 项目管理相关的组合式函数

import { ref } from 'vue'
import type { MainParameterOption, ProjectData, InputFormData } from '@/types'
import { ProjectService, FormDataService } from '@/services/dataService'

export function useProjectManagement() {
  // 响应式数据
  const mainParameterOptions = ref<MainParameterOption[]>([])
  const projectTableData = ref<ProjectData[][]>([])
  const showProjectDialog = ref(false)
  const loading = ref(false)

  // 加载主参数选项
  const loadMainParameterOptions = async (): Promise<void> => {
    try {
      mainParameterOptions.value = await ProjectService.getMainParameterOptions()
    } catch (error) {
      console.error('Failed to load main parameter options:', error)
    }
  }

  // 加载项目表格数据
  const loadProjectTableData = async (): Promise<void> => {
    try {
      projectTableData.value = await ProjectService.getProjectTableData()
    } catch (error) {
      console.error('Failed to load project table data:', error)
    }
  }

  // 显示项目管理对话框
  const handleProjectManagement = (): void => {
    showProjectDialog.value = true
  }

  // 关闭项目对话框
  const closeProjectDialog = (): void => {
    showProjectDialog.value = false
  }

  // 编辑项目
  const editProject = (): void => {
    console.log('Edit project clicked')
    // 这里可以添加编辑项目的逻辑
    alert('编辑项目功能待实现')
  }

  // 更新项目数据
  const updateProjectData = async (data: ProjectData[][]): Promise<void> => {
    loading.value = true
    try {
      await ProjectService.updateProjectData(data)
      projectTableData.value = data
      console.log('Project data updated')
    } catch (error) {
      console.error('Failed to update project data:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    // 响应式数据
    mainParameterOptions,
    projectTableData,
    showProjectDialog,
    loading,

    // 方法
    loadMainParameterOptions,
    loadProjectTableData,
    handleProjectManagement,
    closeProjectDialog,
    editProject,
    updateProjectData
  }
}

export function useFormData() {
  // 响应式数据
  const inputs = ref<InputFormData>(FormDataService.getDefaultFormData())
  const errors = ref<string[]>([])
  const loading = ref(false)

  // 重置表单
  const resetForm = (): void => {
    inputs.value = FormDataService.getDefaultFormData()
    errors.value = []
    console.log('Form reset')
  }

  // 加载示例数据
  const loadSampleData = (): void => {
    inputs.value = FormDataService.getSampleFormData()
    errors.value = []
    console.log('Sample form data loaded')
  }

  // 验证表单
  const validateForm = (): boolean => {
    errors.value = FormDataService.validateFormData(inputs.value)
    return errors.value.length === 0
  }

  // 保存表单数据
  const saveFormData = async (): Promise<boolean> => {
    if (!validateForm()) {
      console.warn('Form validation failed:', errors.value)
      return false
    }

    loading.value = true
    try {
      await FormDataService.saveFormData(inputs.value)
      console.log('Form data saved successfully')
      return true
    } catch (error) {
      console.error('Failed to save form data:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // 响应式数据
    inputs,
    errors,
    loading,

    // 方法
    resetForm,
    loadSampleData,
    validateForm,
    saveFormData
  }
}
