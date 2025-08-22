export interface AttachmentResponse {
  id: string
  file_name: string
  file_size: number
  file_type: string
  download_url: string
  uploaded_at: string
}

export interface Attachment {
  id: string
  module_type: string
  module_id: string
  file_name: string
  file_size: number
  file_type: string
  storage_path: string
  uploaded_by: string
  uploaded_at: string
  is_deleted: boolean
  download_url?: string
}

export interface AttachmentFilter {
  page?: number
  size?: number
  module_type?: string
  module_id?: string
  uploaded_by?: string
}

export interface FileUploadConfig {
  moduleType: string
  moduleId: string
  uploadedBy: string
  maxFileSize?: number // MB
  allowedTypes?: string[]
  multiple?: boolean
}

export interface FileUploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  result?: AttachmentResponse
}
