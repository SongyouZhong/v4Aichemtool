import { defineStore } from 'pinia'
import { userApi } from '@/services/userApi'
import type { AuthUser, AuthState } from '@/types'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    async login(phone: string, password: string): Promise<boolean> {
      this.isLoading = true
      
      try {
        // 调用后端API进行用户认证
        const authResult = await userApi.authenticateUser(phone, password)
        
        if (authResult && authResult.user_id) {
          // 获取完整的用户信息
          const user = await userApi.getUserById(authResult.user_id)
          
          const userData: AuthUser = {
            id: user.id,
            name: user.name,
            phone: user.phone,
            department: user.department,
            role: user.role,
            status: user.status
          }
          
          this.user = userData
          this.isAuthenticated = true
          
          // 保存到localStorage
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('isAuthenticated', 'true')
          
          return true
        }
        
        return false
      } catch (error: any) {
        console.error('Login failed:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      
      // 清除localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
    },

    async checkAuth() {
      this.isLoading = true
      
      try {
        const userData = localStorage.getItem('user')
        const isAuthenticated = localStorage.getItem('isAuthenticated')
        
        if (userData && isAuthenticated === 'true') {
          this.user = JSON.parse(userData)
          this.isAuthenticated = true
        } else {
          // 自动登录访客用户，无需输入凭据
          await this.autoLogin()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // 即使检查失败，也进行自动登录
        await this.autoLogin()
      } finally {
        this.isLoading = false
      }
    },

    async autoLogin() {
      try {
        const guestUser: AuthUser = {
          id: 'guest-' + Date.now(),
          name: '访客用户',
          phone: '',
          department: '访客',
          role: 'guest',
          status: 'ACTIVE'
        }
        
        this.user = guestUser
        this.isAuthenticated = true
        
        // 保存到localStorage
        localStorage.setItem('user', JSON.stringify(guestUser))
        localStorage.setItem('isAuthenticated', 'true')
        
        console.log('访客用户自动登录成功')
      } catch (error) {
        console.error('自动登录失败:', error)
      }
    }
  }
})
