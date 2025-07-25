import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const user = computed(() => authStore.currentUser)
  const isAuthenticated = computed(() => authStore.isLoggedIn)
  const isLoading = computed(() => authStore.isLoading)

  const login = async (username: string, password: string) => {
    const success = await authStore.login(username, password)
    if (success) {
      router.push({ name: 'Home' })
    }
    return success
  }

  const logout = () => {
    authStore.logout()
    router.push({ name: 'Login' })
  }

  const checkAuth = () => {
    return authStore.checkAuth()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  }
}
