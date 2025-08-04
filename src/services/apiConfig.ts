// API配置文件
// 配置后端API的基础URL和相关设置

// API基础配置
export const API_CONFIG = {
  // 后端API基础URL
  BASE_URL: 'http://localhost:8000/api/v1',
  
  // 请求超时时间（毫秒）
  TIMEOUT: 10000,
  
  // 默认请求头
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// API端点配置
export const API_ENDPOINTS = {
  // 项目相关
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
  },
  
  // 化合物相关
  COMPOUNDS: {
    LIST: '/compounds',
    CREATE: '/compounds',
    GET: (id: string) => `/compounds/${id}`,
    UPDATE: (id: string) => `/compounds/${id}`,
    DELETE: (id: string) => `/compounds/${id}`,
    SYNTHETICS: (id: string) => `/compounds/${id}/synthetics`,
    STOCKS: (id: string) => `/compounds/${id}/stocks`,
  },
  
  // 合成记录相关
  SYNTHETICS: {
    LIST: '/synthetics',
    CREATE: '/synthetics',
    GET: (id: string) => `/synthetics/${id}`,
    UPDATE: (id: string) => `/synthetics/${id}`,
    DELETE: (id: string) => `/synthetics/${id}`,
  },
  
  // 库存相关
  STOCKS: {
    LIST: '/stocks',
    CREATE: '/stocks',
    GET: (id: string) => `/stocks/${id}`,
    UPDATE: (id: string) => `/stocks/${id}`,
    DELETE: (id: string) => `/stocks/${id}`,
    SUMMARY: '/stocks/summary/by-compound',
  },
  
  // 附件相关
  ATTACHMENTS: {
    LIST: '/attachments',
    CREATE: '/attachments',
    GET: (id: string) => `/attachments/${id}`,
    UPDATE: (id: string) => `/attachments/${id}`,
    DELETE: (id: string) => `/attachments/${id}`,
    BY_TABLE: (tablename: string) => `/attachments/by-table/${tablename}`,
  }
}

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// 分页默认配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 10,
  MAX_SIZE: 100,
} as const
