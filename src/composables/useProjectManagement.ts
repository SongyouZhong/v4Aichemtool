// 项目管理相关的组合式函数

import { ref, computed } from 'vue'
import type { MainParameterOption, ProjectData, InputFormData, Project } from '@/types'
import { ProjectService, FormDataService } from '@/services/dataService'
import { ProjectApiService } from '@/services/projectApi'

export function useProjectManagement() {
  // 响应式数据
  const mainParameterOptions = ref<MainParameterOption[]>([])
  const projectTableData = ref<ProjectData[][]>([])
  const showProjectDialog = ref(false)
  const loading = ref(false)
  const projects = ref<Project[]>([])
  const selectedProject = ref<Project | null>(null)

  // 计算属性：将项目数据转换为表格格式
  const projectTable = computed(() => {
    if (projects.value.length === 0) return []
    
    // 将项目数据转换为2x2表格格式
    const table: ProjectData[][] = []
    for (let i = 0; i < projects.value.length; i += 2) {
      const row: ProjectData[] = []
      
      // 第一个项目
      const project1 = projects.value[i]
      row.push(
        { label: '项目名称', value: project1.name },
        { label: '项目描述', value: project1.description || '无描述' }
      )
      
      // 第二个项目（如果存在）
      if (i + 1 < projects.value.length) {
        const project2 = projects.value[i + 1]
        row.push(
          { label: '项目名称', value: project2.name },
          { label: '项目描述', value: project2.description || '无描述' }
        )
      } else {
        // 如果只有一个项目，填充空数据
        row.push(
          { label: '项目名称', value: '' },
          { label: '项目描述', value: '' }
        )
      }
      
      table.push(row)
    }
    
    return table
  })

  // 加载主参数选项
  const loadMainParameterOptions = async (): Promise<void> => {
    try {
      mainParameterOptions.value = await ProjectService.getMainParameterOptions()
    } catch (error) {
      console.error('Failed to load main parameter options:', error)
    }
  }

  // 加载项目表格数据（保留原有方法兼容性）
  const loadProjectTableData = async (): Promise<void> => {
    try {
      await loadProjects()
      projectTableData.value = projectTable.value
    } catch (error) {
      console.error('Failed to load project table data:', error)
    }
  }

  // 加载项目列表（新方法，直接从API获取）
  const loadProjects = async (): Promise<void> => {
    loading.value = true
    try {
      const projectList = await ProjectApiService.getAllProjects()
      projects.value = projectList
      console.log('Projects loaded:', projectList.length)
    } catch (error) {
      console.error('Failed to load projects:', error)
      // 如果API失败，显示错误提示
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  // 创建新项目
  const createProject = async (projectData: { name: string; description?: string }): Promise<Project | null> => {
    loading.value = true
    try {
      const newProject = await ProjectApiService.createProject(projectData)
      projects.value.push(newProject)
      console.log('Project created:', newProject)
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新项目
  const updateProject = async (id: string, projectData: { name?: string; description?: string }): Promise<Project | null> => {
    loading.value = true
    try {
      const updatedProject = await ProjectApiService.updateProject(id, projectData)
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      console.log('Project updated:', updatedProject)
      return updatedProject
    } catch (error) {
      console.error('Failed to update project:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 删除项目
  const deleteProject = async (id: string): Promise<boolean> => {
    loading.value = true
    try {
      await ProjectApiService.deleteProject(id)
      projects.value = projects.value.filter(p => p.id !== id)
      console.log('Project deleted:', id)
      return true
    } catch (error) {
      console.error('Failed to delete project:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 显示项目管理对话框
  const handleProjectManagement = async (): Promise<void> => {
    showProjectDialog.value = true
    // 打开对话框时自动加载最新的项目数据
    await loadProjects()
  }

  // 关闭项目对话框
  const closeProjectDialog = (): void => {
    showProjectDialog.value = false
    selectedProject.value = null
  }

  // 编辑项目
  const editProject = (project?: Project): void => {
    if (project) {
      selectedProject.value = project
      console.log('Edit project:', project)
      // 这里可以打开编辑对话框或导航到编辑页面
    } else {
      console.log('Edit project clicked')
      alert('请选择要编辑的项目')
    }
  }

  // 刷新项目列表
  const refreshProjects = async (): Promise<void> => {
    await loadProjects()
  }

  // 更新项目数据（保留原有方法兼容性）
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
    projects,
    selectedProject,
    projectTable,

    // 方法
    loadMainParameterOptions,
    loadProjectTableData,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    handleProjectManagement,
    closeProjectDialog,
    editProject,
    updateProjectData,
    refreshProjects
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
