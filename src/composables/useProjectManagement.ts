// 项目管理相关的组合式函数

import { ref, computed } from 'vue'
import type { MainParameterOption, ProjectData, InputFormData, Project, ProjectUpdate } from '@/types'
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
      
      // 为每个项目获取附件信息
      const projectsWithAttachments = await Promise.all(
        projectList.map(async (project) => {
          try {
            const attachments = await ProjectApiService.getProjectAttachments(project.id)
            return {
              ...project,
              attachments: attachments
            }
          } catch (error) {
            console.error(`Failed to load attachments for project ${project.id}:`, error)
            return project
          }
        })
      )
      
      projects.value = projectsWithAttachments
      
      // 如果当前没有选中项目且项目列表不为空，自动选中第一个项目
      if (!selectedProject.value && projectsWithAttachments.length > 0) {
        selectedProject.value = projectsWithAttachments[0]
        console.log('Auto-selected first project:', projectsWithAttachments[0])
      }
      
      console.log('Projects loaded with attachments:', projectsWithAttachments.length)
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
      
      // 如果这是第一个项目，自动选中它
      if (projects.value.length === 1) {
        selectedProject.value = newProject
        console.log('Auto-selected newly created first project:', newProject)
      }
      
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
  const updateProject = async (id: string, projectData: ProjectUpdate): Promise<Project | null> => {
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
      
      // 如果删除的是当前选中的项目，需要重新选择
      const wasSelected = selectedProject.value?.id === id
      
      projects.value = projects.value.filter(p => p.id !== id)
      
      // 如果删除的是选中的项目，自动选中第一个剩余项目
      if (wasSelected) {
        selectedProject.value = projects.value.length > 0 ? projects.value[0] : null
        if (selectedProject.value) {
          console.log('Auto-selected project after deletion:', selectedProject.value)
        }
      }
      
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
    // 不要重置 selectedProject，保持用户的选择
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
