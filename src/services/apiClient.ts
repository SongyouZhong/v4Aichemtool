// API客户端工具类
// 提供统一的HTTP请求方法

import { API_CONFIG, HTTP_STATUS } from './apiConfig'

// 响应接口
export interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
}

// 分页响应接口
export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// 错误响应接口
export interface ApiError {
  status: number
  message: string
  detail?: string
}

// API客户端类
export class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
    this.defaultHeaders = { ...API_CONFIG.DEFAULT_HEADERS }
  }

  // 私有方法：构建完整URL
  private buildURL(endpoint: string): string {
    return `${this.baseURL}${endpoint}`
  }

  // 私有方法：处理响应
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        // 如果不是JSON格式，使用原始文本
        errorMessage = errorText || errorMessage
      }
      
      // 创建带有状态码的错误对象
      const error = new Error(errorMessage) as any
      error.status = response.status
      throw error
    }

    const data = await response.json()
    return {
      data,
      status: response.status
    }
  }

  // 私有方法：创建请求配置
  private createRequestConfig(
    method: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): RequestInit {
    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...customHeaders
      }
    }

    if (data) {
      config.body = JSON.stringify(data)
    }

    return config
  }

  // GET请求
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = this.buildURL(endpoint)
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    try {
      const response = await fetch(url, this.createRequestConfig('GET'))
      return this.handleResponse<T>(response)
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error)
      throw error
    }
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(
        this.buildURL(endpoint),
        this.createRequestConfig('POST', data)
      )
      return this.handleResponse<T>(response)
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error)
      throw error
    }
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(
        this.buildURL(endpoint),
        this.createRequestConfig('PUT', data)
      )
      return this.handleResponse<T>(response)
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error)
      throw error
    }
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(
        this.buildURL(endpoint),
        this.createRequestConfig('DELETE')
      )
      return this.handleResponse<T>(response)
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error)
      throw error
    }
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`)
      return response.ok
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}

// 创建单例API客户端实例
export const apiClient = new ApiClient()
