import { apiClient } from './apiClient'
import type { AttachmentResponse, AttachmentFilter } from '../types/attachment'

export class FileApiService {
  /**
   * 上传单个文件
   */
  static async uploadFile(
    file: File,
    moduleType: string,
    moduleId: string,
    uploadedBy: string
  ): Promise<AttachmentResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('module_type', moduleType)
      formData.append('module_id', moduleId)
      formData.append('uploaded_by', uploadedBy)

      // 使用原生fetch进行文件上传，因为apiClient可能不支持FormData
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/v1/attachments/upload`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      return result as AttachmentResponse
    } catch (error) {
      console.error('File upload failed:', error)
      throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 批量上传文件
   */
  static async uploadMultipleFiles(
    files: File[],
    moduleType: string,
    moduleId: string,
    uploadedBy: string
  ): Promise<AttachmentResponse[]> {
    try {
      const formData = new FormData()
      
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('module_type', moduleType)
      formData.append('module_id', moduleId)
      formData.append('uploaded_by', uploadedBy)

      // 使用原生fetch进行文件上传
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/v1/attachments/upload-multiple`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      return result as AttachmentResponse[]
    } catch (error) {
      console.error('Multiple files upload failed:', error)
      throw new Error(`批量文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 获取附件列表
   */
  static async getAttachments(params: AttachmentFilter = {}): Promise<any> {
    try {
      const response = await apiClient.get('/attachments', params)
      return response.data
    } catch (error) {
      console.error('Get attachments failed:', error)
      throw new Error(`获取附件列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 获取附件详情
   */
  static async getAttachment(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/attachments/${id}`)
      return response.data
    } catch (error) {
      console.error('Get attachment failed:', error)
      throw new Error(`获取附件详情失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 删除附件
   */
  static async deleteAttachment(id: string, permanent: boolean = false): Promise<void> {
    try {
      const endpoint = permanent 
        ? `/attachments/${id}?permanent=true`
        : `/attachments/${id}`
      await apiClient.delete(endpoint)
    } catch (error) {
      console.error('Delete attachment failed:', error)
      throw new Error(`删除附件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 恢复软删除的附件
   */
  static async restoreAttachment(id: string): Promise<void> {
    try {
      await apiClient.post(`/attachments/${id}/restore`)
    } catch (error) {
      console.error('Restore attachment failed:', error)
      throw new Error(`恢复附件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 获取文件下载URL
   */
  static getDownloadUrl(id: string): string {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
    return `${baseURL}/api/v1/attachments/download/${id}`
  }

  /**
   * 下载文件
   */
  static downloadFile(id: string, filename?: string): void {
    try {
      const url = this.getDownloadUrl(id)
      const link = document.createElement('a')
      link.href = url
      if (filename) {
        link.download = filename
      }
      link.target = '_blank'
      
      // 添加认证header（如果需要）
      const token = localStorage.getItem('access_token')
      if (token) {
        // 对于需要认证的下载，使用fetch然后创建blob URL
        fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob)
          link.href = blobUrl
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(blobUrl)
        })
        .catch(error => {
          console.error('Download failed:', error)
          // 降级到直接链接
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
      } else {
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Download failed:', error)
      throw new Error(`文件下载失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 预览文件（用于图片等可预览的文件类型）
   */
  static previewFile(id: string): void {
    try {
      const url = this.getDownloadUrl(id)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Preview failed:', error)
      throw new Error(`文件预览失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 根据模块获取附件
   */
  static async getAttachmentsByModule(
    moduleType: string,
    moduleId: string,
    page: number = 1,
    size: number = 10
  ): Promise<any> {
    return this.getAttachments({
      module_type: moduleType,
      module_id: moduleId,
      page,
      size
    })
  }

  /**
   * 根据用户获取附件
   */
  static async getAttachmentsByUser(
    uploadedBy: string,
    page: number = 1,
    size: number = 10
  ): Promise<any> {
    return this.getAttachments({
      uploaded_by: uploadedBy,
      page,
      size
    })
  }

  /**
   * 验证文件类型
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    // 如果是 MIME 类型（包含 '/'），直接比较
    if (allowedTypes.some(type => type.includes('/'))) {
      return allowedTypes.includes(file.type)
    }
    
    // 如果是文件扩展名，需要转换
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension) return false
    
    // 扩展名到 MIME 类型的映射
    const extensionToMimeMap: Record<string, string[]> = {
      'pdf': ['application/pdf'],
      'doc': ['application/msword'],
      'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'xls': ['application/vnd.ms-excel'],
      'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      'ppt': ['application/vnd.ms-powerpoint'],
      'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      'txt': ['text/plain'],
      'zip': ['application/zip', 'application/x-zip-compressed'],
      'rar': ['application/x-rar-compressed', 'application/vnd.rar'],
      'jpg': ['image/jpeg'],
      'jpeg': ['image/jpeg'],
      'png': ['image/png'],
      'gif': ['image/gif'],
      'webp': ['image/webp'],
      'csv': ['text/csv']
    }
    
    // 检查扩展名是否在允许的类型中
    if (allowedTypes.includes(fileExtension)) {
      // 进一步验证 MIME 类型（可选，用于额外安全性）
      const allowedMimes = extensionToMimeMap[fileExtension]
      if (allowedMimes && file.type && !allowedMimes.includes(file.type)) {
        console.warn(`File extension ${fileExtension} matches but MIME type ${file.type} doesn't match expected types:`, allowedMimes)
        // 这里我们仍然允许，因为有些浏览器可能返回不同的 MIME 类型
      }
      return true
    }
    
    return false
  }

  /**
   * 验证文件大小
   */
  static validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return file.size <= maxSizeInBytes
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 获取文件图标类名（基于文件类型）
   */
  static getFileIcon(fileType: string): string {
    const iconMap: Record<string, string> = {
      'image/jpeg': 'pi pi-image',
      'image/png': 'pi pi-image',
      'image/gif': 'pi pi-image',
      'image/webp': 'pi pi-image',
      'application/pdf': 'pi pi-file-pdf',
      'text/plain': 'pi pi-file',
      'text/csv': 'pi pi-file-excel',
      'application/msword': 'pi pi-file-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'pi pi-file-word',
      'application/vnd.ms-excel': 'pi pi-file-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'pi pi-file-excel',
      'application/zip': 'pi pi-file-import',
      'application/x-zip-compressed': 'pi pi-file-import',
      'chemical/x-mdl-sdfile': 'pi pi-file',
      'chemical/x-daylight-smiles': 'pi pi-file'
    }

    return iconMap[fileType] || 'pi pi-file'
  }
}
