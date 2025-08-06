// SMILES API服务
// 处理SMILES相关的API调用

import { API_CONFIG, API_ENDPOINTS } from './apiConfig'

export class SmilesApiService {
  /**
   * 将SMILES字符串转换为图片URL
   * @param smiles SMILES字符串
   * @returns 图片URL字符串
   */
  static getSmilesImageUrl(smiles: string): string {
    if (!smiles || smiles.trim() === '') {
      return ''
    }
    
    // 编码SMILES字符串以确保URL安全
    const encodedSmiles = encodeURIComponent(smiles.trim())
    
    // 构建完整的图片URL
    const imageUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SMILES.TO_IMAGE}?smiles=${encodedSmiles}`
    
    return imageUrl
  }

  /**
   * 预加载SMILES图片，检查是否能够成功加载
   * @param smiles SMILES字符串
   * @returns Promise<boolean> 是否成功加载
   */
  static async preloadSmilesImage(smiles: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!smiles || smiles.trim() === '') {
        resolve(false)
        return
      }

      const img = new Image()
      const imageUrl = this.getSmilesImageUrl(smiles)
      
      img.onload = () => {
        resolve(true)
      }
      
      img.onerror = () => {
        resolve(false)
      }
      
      // 设置超时
      setTimeout(() => {
        resolve(false)
      }, API_CONFIG.TIMEOUT)
      
      img.src = imageUrl
    })
  }

  /**
   * 批量获取SMILES图片URL
   * @param smilesArray SMILES字符串数组
   * @returns SMILES图片URL数组
   */
  static getSmilesImageUrls(smilesArray: string[]): string[] {
    return smilesArray.map(smiles => this.getSmilesImageUrl(smiles))
  }

  /**
   * 验证SMILES字符串格式（简单验证）
   * @param smiles SMILES字符串
   * @returns 是否为有效的SMILES字符串
   */
  static isValidSmiles(smiles: string): boolean {
    if (!smiles || smiles.trim() === '') {
      return false
    }
    
    // 简单的SMILES验证：检查是否包含基本的有机化学字符
    const smilesPattern = /^[A-Za-z0-9\[\]()=#+\-@/:\.\\]+$/
    return smilesPattern.test(smiles.trim())
  }
}
