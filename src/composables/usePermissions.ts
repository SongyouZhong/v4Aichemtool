import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { Permission } from '@/types/permission'

/**
 * 权限控制Hook
 */
export const usePermissions = () => {
  const authStore = useAuthStore()

  /**
   * 检查用户是否有指定权限
   * @param permissionCode 权限代码
   * @returns 是否有权限
   */
  const hasPermission = (permissionCode: string): boolean => {
    if (!authStore.user) return false
    
    // 管理员拥有所有权限
    if (authStore.user.role === 'admin') return true
    
    // 检查用户角色是否包含指定权限
    const userRole = authStore.userRole
    if (!userRole || !userRole.permissions) return false
    
    return userRole.permissions.some((permission: Permission) => 
      permission.code === permissionCode && permission.is_active
    )
  }

  /**
   * 检查用户是否有任意一个权限
   * @param permissionCodes 权限代码数组
   * @returns 是否有权限
   */
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => hasPermission(code))
  }

  /**
   * 检查用户是否有所有权限
   * @param permissionCodes 权限代码数组
   * @returns 是否有权限
   */
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    return permissionCodes.every(code => hasPermission(code))
  }

  /**
   * 获取用户权限列表
   */
  const userPermissions = computed(() => {
    if (!authStore.user || !authStore.userRole) return []
    
    // 管理员拥有所有权限
    if (authStore.user.role === 'admin') {
      return ['*'] // 特殊标识表示所有权限
    }
    
    return authStore.userRole.permissions?.map((p: Permission) => p.code) || []
  })

  /**
   * 检查是否可以访问指定模块
   * @param permissionCode 权限代码
   * @returns 是否可以访问
   */
  const canAccess = (permissionCode: string): boolean => {
    return hasPermission(permissionCode)
  }

  /**
   * 各模块的权限代码常量
   */
  const PERMISSIONS = {
    COMPOUND_INPUT: 'compound_input',
    SYNTHETIC_INPUT: 'synthetic_input',
    ACTIVITY_INPUT: 'activity_input',
    ASSAY_MANAGEMENT: 'assay_management',
    USER_MANAGEMENT: 'user_management',
    ROLE_MANAGEMENT: 'role_management',
    PERMISSION_MANAGEMENT: 'permission_management'
  } as const

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
    canAccess,
    PERMISSIONS
  }
}
