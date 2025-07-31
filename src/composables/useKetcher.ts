// Ketcher化学编辑器相关的组合式函数

import { ref, onMounted, onUnmounted } from 'vue'
import { ketcherService } from '@/services/ketcherService'

export function useKetcher() {
  // 响应式数据
  const ketcherFrame = ref<HTMLIFrameElement | null>(null)
  const currentSmiles = ref('')
  const ketcherReady = ref(false)
  const loading = ref(false)

  // Ketcher加载完成回调
  const onKetcherLoad = (): void => {
    console.log('Ketcher iframe loaded')
    // 等待一段时间确保Ketcher完全初始化
    setTimeout(() => {
      ketcherService.markReady()
      ketcherReady.value = true
      console.log('Ketcher ready for interaction')
      
      // 测试Ketcher实例是否可用
      const availableMethods = ketcherService.getAvailableMethods()
      if (availableMethods.length > 0) {
        console.log('Available Ketcher methods:', availableMethods)
      } else {
        console.warn('No Ketcher methods found')
      }
    }, 3000)
  }

  // 获取SMILES
  const getSmiles = async (): Promise<string> => {
    if (!ketcherReady.value) {
      console.warn('Ketcher not ready')
      return ''
    }

    loading.value = true
    try {
      const smiles = await ketcherService.getSmiles()
      currentSmiles.value = smiles
      return smiles
    } catch (error) {
      console.error('Failed to get SMILES:', error)
      alert('Failed to get SMILES. Please ensure Ketcher is loaded properly.')
      return ''
    } finally {
      loading.value = false
    }
  }

  // 设置分子
  const setMolecule = async (smiles: string): Promise<boolean> => {
    if (!ketcherReady.value) {
      console.warn('Ketcher not ready')
      return false
    }

    if (!smiles.trim()) {
      console.warn('Empty SMILES provided')
      return false
    }

    loading.value = true
    try {
      await ketcherService.setMolecule(smiles)
      currentSmiles.value = smiles
      return true
    } catch (error) {
      console.error('Failed to set molecule:', error)
      alert(`Failed to set molecule. Please ensure Ketcher is loaded properly. SMILES: ${smiles}`)
      return false
    } finally {
      loading.value = false
    }
  }

  // 清空分子编辑器
  const clearMolecule = async (): Promise<boolean> => {
    if (!ketcherReady.value) {
      console.warn('Ketcher not ready')
      return false
    }

    loading.value = true
    try {
      await ketcherService.clearMolecule()
      currentSmiles.value = ''
      return true
    } catch (error) {
      console.error('Failed to clear molecule:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 设置示例分子
  const setSampleMolecule = async (): Promise<boolean> => {
    if (!ketcherReady.value) {
      console.warn('Ketcher not ready')
      return false
    }

    loading.value = true
    try {
      await ketcherService.setSampleMolecule()
      currentSmiles.value = 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' // 咖啡因
      return true
    } catch (error) {
      console.error('Failed to set sample molecule:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 等待Ketcher准备就绪
  const waitForReady = async (): Promise<void> => {
    await ketcherService.waitForReady()
    ketcherReady.value = true
  }

  // 设置Ketcher iframe引用
  const setKetcherFrame = (frame: HTMLIFrameElement | null): void => {
    ketcherFrame.value = frame
    ketcherService.setKetcherFrame(frame)
  }

  // 生命周期钩子
  onMounted(() => {
    // 可以在这里添加一些初始化逻辑
  })

  onUnmounted(() => {
    // 清理资源
    ketcherService.setKetcherFrame(null)
  })

  return {
    // 响应式数据
    ketcherFrame,
    currentSmiles,
    ketcherReady,
    loading,

    // 方法
    onKetcherLoad,
    getSmiles,
    setMolecule,
    clearMolecule,
    setSampleMolecule,
    waitForReady,
    setKetcherFrame
  }
}
