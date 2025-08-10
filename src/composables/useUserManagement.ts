// 用户管理组合式函数

import { ref, reactive, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import userApi from '@/services/userApi'
import type { User, UserCreate, UserUpdate, UserListQuery, DepartmentOption } from '@/types/user'

export function useUserManagement() {
  const toast = useToast()
  
  // 响应式数据
  const users = ref<User[]>([])
  const loading = ref(false)
  const totalRecords = ref(0)
  const selectedUsers = ref<User[]>([])
  
  // 查询参数
  const queryParams = reactive<UserListQuery>({
    page: 1,
    size: 10,
    department: undefined
  })

  // 部门选项
  const departmentOptions: DepartmentOption[] = [
    { label: '全部部门', value: '' },
    { label: '技术部', value: '技术部' },
    { label: '研发部', value: '研发部' },
    { label: '市场部', value: '市场部' },
    { label: '销售部', value: '销售部' },
    { label: '人事部', value: '人事部' },
    { label: '财务部', value: '财务部' },
    { label: '运营部', value: '运营部' },
    { label: '客服部', value: '客服部' }
  ]

  // 计算属性
  const hasSelectedUsers = computed(() => selectedUsers.value.length > 0)
  const selectedUserCount = computed(() => selectedUsers.value.length)

  /**
   * 获取用户列表
   */
  const fetchUsers = async () => {
    try {
      loading.value = true
      const response = await userApi.getUsers(queryParams)
      users.value = response.items
      totalRecords.value = response.total
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: `获取用户列表失败: ${error.message}`,
        life: 3000
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建用户
   */
  const createUser = async (userData: UserCreate): Promise<boolean> => {
    try {
      loading.value = true
      await userApi.createUser(userData)
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '用户创建成功',
        life: 3000
      })
      await fetchUsers() // 刷新列表
      return true
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: `创建用户失败: ${error.message}`,
        life: 3000
      })
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新用户
   */
  const updateUser = async (id: string, userData: UserUpdate): Promise<boolean> => {
    try {
      loading.value = true
      await userApi.updateUser(id, userData)
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '用户信息更新成功',
        life: 3000
      })
      await fetchUsers() // 刷新列表
      return true
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: `更新用户失败: ${error.message}`,
        life: 3000
      })
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除用户
   */
  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      loading.value = true
      await userApi.deleteUser(id)
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '用户删除成功',
        life: 3000
      })
      await fetchUsers() // 刷新列表
      return true
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: `删除用户失败: ${error.message}`,
        life: 3000
      })
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除用户
   */
  const deleteSelectedUsers = async (): Promise<boolean> => {
    try {
      loading.value = true
      await Promise.all(
        selectedUsers.value.map(user => userApi.deleteUser(user.id))
      )
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: `已删除 ${selectedUsers.value.length} 个用户`,
        life: 3000
      })
      selectedUsers.value = []
      await fetchUsers() // 刷新列表
      return true
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: `批量删除失败: ${error.message}`,
        life: 3000
      })
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 检查手机号是否已存在
   */
  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    try {
      return await userApi.checkPhoneExists(phone)
    } catch (error) {
      return false
    }
  }

  /**
   * 重置查询参数
   */
  const resetQuery = () => {
    queryParams.page = 1
    queryParams.size = 10
    queryParams.department = undefined
  }

  /**
   * 分页变化处理
   */
  const onPageChange = (event: any) => {
    queryParams.page = event.page + 1
    queryParams.size = event.rows
    fetchUsers()
  }

  /**
   * 部门筛选变化处理
   */
  const onDepartmentChange = () => {
    queryParams.page = 1
    fetchUsers()
  }

  return {
    // 响应式数据
    users,
    loading,
    totalRecords,
    selectedUsers,
    queryParams,
    departmentOptions,
    
    // 计算属性
    hasSelectedUsers,
    selectedUserCount,
    
    // 方法
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    deleteSelectedUsers,
    checkPhoneExists,
    resetQuery,
    onPageChange,
    onDepartmentChange
  }
}
