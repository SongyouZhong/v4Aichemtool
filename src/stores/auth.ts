import { defineStore } from 'pinia'
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
    async login(username: string, password: string): Promise<boolean> {
      this.isLoading = true
      
      try {
        // 模拟登录API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 简单的验证逻辑（实际项目中应该调用真实API）
        if (username && password) {
          const userData: AuthUser = {
            username,
            email: `${username}@example.com`,
            id: Math.random().toString(36).substr(2, 9)
          }
          
          this.user = userData
          this.isAuthenticated = true
          
          // 保存到localStorage
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('isAuthenticated', 'true')
          
          return true
        }
        
        return false
      } catch (error) {
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
          username: 'Guest User',
          email: 'guest@aichemtool.com',
          id: 'guest-' + Date.now()
        }
        
        this.user = guestUser
        this.isAuthenticated = true
        
        // 保存到localStorage
        localStorage.setItem('user', JSON.stringify(guestUser))
        localStorage.setItem('isAuthenticated', 'true')
        
        console.log('Auto-login successful for guest user')
      } catch (error) {
        console.error('Auto-login failed:', error)
      }
    }
  }
})
