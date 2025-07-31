// Ketcher化学编辑器服务
// 封装与Ketcher编辑器的交互逻辑

import type { KetcherMessage, KetcherResponse } from '@/types'

export class KetcherService {
  private ketcherFrame: HTMLIFrameElement | null = null
  private isReady = false
  private readyPromise: Promise<void>
  private readyResolver?: () => void

  constructor() {
    this.readyPromise = new Promise(resolve => {
      this.readyResolver = resolve
    })
  }

  // 设置Ketcher iframe引用
  setKetcherFrame(frame: HTMLIFrameElement | null): void {
    this.ketcherFrame = frame
  }

  // 标记Ketcher已准备就绪
  markReady(): void {
    this.isReady = true
    if (this.readyResolver) {
      this.readyResolver()
    }
  }

  // 等待Ketcher准备就绪
  async waitForReady(): Promise<void> {
    if (this.isReady) return
    await this.readyPromise
  }

  // 检查Ketcher是否准备就绪
  isKetcherReady(): boolean {
    return this.isReady
  }

  // 获取Ketcher实例
  private getKetcherInstance(): any {
    if (!this.ketcherFrame) return null
    
    try {
      if ('contentDocument' in this.ketcherFrame) {
        return (this.ketcherFrame.contentWindow as any)?.ketcher
      } else {
        return (window.frames as any)['idKetcher']?.ketcher
      }
    } catch (error) {
      console.error('Error accessing Ketcher instance:', error)
      return null
    }
  }

  // 使用PostMessage API与Ketcher通信
  private sendKetcherMessage(action: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ketcherFrame?.contentWindow) {
        reject(new Error('Ketcher frame not available'))
        return
      }
      
      const messageId = Date.now() + Math.random()
      
      const handleResponse = (event: MessageEvent) => {
        if (event.data.action === action + 'Response') {
          window.removeEventListener('message', handleResponse)
          if (event.data.success) {
            resolve(event.data.data)
          } else {
            reject(new Error(event.data.error))
          }
        }
      }
      
      window.addEventListener('message', handleResponse)
      
      // 设置超时
      setTimeout(() => {
        window.removeEventListener('message', handleResponse)
        reject(new Error('Ketcher operation timeout'))
      }, 5000)
      
      this.ketcherFrame.contentWindow.postMessage({ action, data, messageId }, '*')
    })
  }

  // 获取SMILES字符串
  async getSmiles(): Promise<string> {
    if (!this.isReady) {
      throw new Error('Ketcher not ready')
    }

    console.log('Attempting to get SMILES from editor...')
    
    // 首先尝试直接访问Ketcher实例
    try {
      const ketcher = this.getKetcherInstance()
      if (ketcher && ketcher.getSmiles) {
        const smiles = await ketcher.getSmiles()
        console.log('SMILES retrieved successfully with direct API:', smiles)
        return smiles || ''
      }
    } catch (error) {
      console.warn('Direct Ketcher API failed, trying PostMessage:', error)
    }
    
    // 如果直接API失败，尝试PostMessage
    try {
      const smiles = await this.sendKetcherMessage('getSmiles')
      console.log('SMILES retrieved successfully with PostMessage:', smiles)
      return smiles || ''
    } catch (error) {
      console.error('Both direct API and PostMessage failed:', error)
      throw new Error('Failed to get SMILES from Ketcher')
    }
  }

  // 设置分子结构
  async setMolecule(smiles: string): Promise<void> {
    console.log('KetcherService.setMolecule called with SMILES:', smiles);
    console.log('Ketcher ready status:', this.isReady);
    console.log('Ketcher frame available:', !!this.ketcherFrame);
    console.log('Ketcher frame contentWindow:', !!this.ketcherFrame?.contentWindow);
    
    if (!this.isReady) {
      throw new Error('Ketcher not ready')
    }

    if (!this.ketcherFrame) {
      throw new Error('Ketcher frame not set')
    }

    console.log('Attempting to set SMILES:', smiles)
    
    // 首先尝试直接访问Ketcher实例
    try {
      const ketcher = this.getKetcherInstance()
      if (ketcher && ketcher.setMolecule) {
        await ketcher.setMolecule(smiles)
        console.log('Molecule set successfully with direct API. SMILES:', smiles)
        return
      }
    } catch (error) {
      console.warn('Direct Ketcher API failed, trying PostMessage:', error)
    }
    
    // 如果直接API失败，尝试PostMessage
    try {
      await this.sendKetcherMessage('setMolecule', smiles)
      console.log('Molecule set successfully with PostMessage. SMILES:', smiles)
    } catch (error) {
      console.error('Both direct API and PostMessage failed:', error)
      throw new Error(`Failed to set molecule in Ketcher: ${smiles}`)
    }
  }

  // 清空分子编辑器
  async clearMolecule(): Promise<void> {
    if (!this.isReady) {
      throw new Error('Ketcher not ready')
    }

    try {
      await this.sendKetcherMessage('clear')
      console.log('Molecule cleared')
    } catch (error) {
      console.error('Error clearing molecule:', error)
      // 回退到直接访问方法
      try {
        const ketcher = this.getKetcherInstance()
        if (ketcher) {
          await ketcher.setMolecule('')
        }
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError)
        throw new Error('Failed to clear molecule')
      }
    }
  }

  // 设置示例分子（咖啡因）
  async setSampleMolecule(): Promise<void> {
    const caffeine = 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C'
    await this.setMolecule(caffeine)
  }

  // 调试：获取可用方法列表
  getAvailableMethods(): string[] {
    const ketcher = this.getKetcherInstance()
    if (ketcher) {
      return Object.keys(ketcher).filter(key => typeof ketcher[key] === 'function')
    }
    return []
  }
}

// 创建单例实例
export const ketcherService = new KetcherService()
