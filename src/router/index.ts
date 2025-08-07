import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'

// 路由组件懒加载
const HomePage = () => import('@/views/HomePage.vue')
const LoginPage = () => import('@/views/LoginPage.vue')
const SmallMoleculePage = () => import('@/views/platforms/SmallMoleculePage.vue')
const ProteinPage = () => import('@/views/platforms/ProteinPage.vue')
const DataInputPage = () => import('@/views/platforms/MolInputPage.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/platforms/small-molecule',
    name: 'SmallMolecule',
    component: SmallMoleculePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/platforms/protein',
    name: 'Protein',
    component: ProteinPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/platforms/data-input',
    name: 'DataInput',
    component: DataInputPage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 如果需要认证但用户未认证，先尝试自动认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    try {
      await authStore.checkAuth()
      // 认证成功后继续导航
      if (authStore.isAuthenticated) {
        next()
      } else {
        // 自动认证失败，跳转到登录页面
        next({ name: 'Login' })
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      next({ name: 'Login' })
    }
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
