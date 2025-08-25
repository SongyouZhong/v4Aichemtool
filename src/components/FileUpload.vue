<template>
  <div class="file-upload-component">
    <!-- 文件选择区域 -->
    <div class="upload-area">
      <input
        ref="fileInput"
        type="file"
        :multiple="config.multiple"
        :accept="acceptTypes"
        @change="handleFileSelect"
        style="display: none"
      />
      
      <div 
        class="drop-zone"
        :class="{ 'drag-over': isDragOver }"
        @click="selectFiles"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <i class="pi pi-cloud-upload" style="font-size: 3rem; color: var(--primary-color)"></i>
        <p class="upload-text">
          点击选择文件或拖拽文件到此处
        </p>
        <p class="upload-hint">
          支持的格式: {{ allowedTypesDisplay }}
          <br>
          最大文件大小: {{ config.maxFileSize || 100 }}MB
        </p>
      </div>
    </div>

    <!-- 文件列表 -->
    <div v-if="uploadQueue.length > 0" class="file-list">
      <h4>文件列表</h4>
      <div 
        v-for="item in uploadQueue" 
        :key="item.file.name + item.file.size"
        class="file-item"
        :class="item.status"
      >
        <div class="file-info">
          <i :class="getFileIcon(item.file.type)"></i>
          <div class="file-details">
            <span class="file-name">{{ item.file.name }}</span>
            <span class="file-size">{{ formatFileSize(item.file.size) }}</span>
          </div>
        </div>
        
        <div class="file-actions">
          <div v-if="item.status === 'uploading'" class="progress-wrapper">
            <ProgressBar :value="item.progress" class="upload-progress" />
            <span class="progress-text">{{ item.progress }}%</span>
          </div>
          
          <div v-else-if="item.status === 'success'" class="success-actions">
            <Button
              icon="pi pi-download"
              @click="downloadFile(item.result!)"
              text
              rounded
              severity="info"
            />
            <Button
              icon="pi pi-eye"
              @click="previewFile(item.result!)"
              text
              rounded
              severity="secondary"
            />
          </div>
          
          <div v-else-if="item.status === 'error'" class="error-info">
            <small class="error-text">{{ item.error }}</small>
          </div>
          
          <Button
            icon="pi pi-times"
            @click="removeFile(item)"
            text
            rounded
            severity="danger"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- 上传按钮 -->
    <div v-if="pendingFiles.length > 0" class="upload-actions">
      <Button
        label="开始上传"
        icon="pi pi-upload"
        @click="startUpload"
        :loading="isUploading"
        :disabled="isUploading"
      />
      <Button
        label="清空列表"
        icon="pi pi-trash"
        @click="clearQueue"
        severity="secondary"
        outlined
        :disabled="isUploading"
      />
    </div>

    <!-- 已上传文件列表 -->
    <div v-if="showExistingFiles && existingFiles.length > 0" class="existing-files">
      <Divider />
      <h4>已上传的文件</h4>
      <div 
        v-for="file in existingFiles" 
        :key="file.id"
        class="existing-file-item"
      >
        <div class="file-info">
          <i :class="getFileIcon(file.file_type)"></i>
          <div class="file-details">
            <span class="file-name">{{ file.file_name }}</span>
            <span class="file-size">{{ formatFileSize(file.file_size) }}</span>
            <span class="file-date">{{ formatDate(file.uploaded_at) }}</span>
          </div>
        </div>
        
        <div class="file-actions">
          <Button
            icon="pi pi-download"
            @click="downloadExistingFile(file)"
            text
            rounded
            severity="info"
          />
          <Button
            icon="pi pi-eye"
            @click="previewExistingFile(file)"
            text
            rounded
            severity="secondary"
          />
          <Button
            icon="pi pi-trash"
            @click="deleteExistingFile(file)"
            text
            rounded
            severity="danger"
            :loading="deletingFiles.has(file.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import Divider from 'primevue/divider'

import { FileApiService } from '@/services/fileApi'
import type { 
  FileUploadConfig, 
  FileUploadProgress, 
  AttachmentResponse,
  Attachment 
} from '@/types/attachment'

interface Props {
  config: FileUploadConfig
  showExistingFiles?: boolean
  autoUpload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showExistingFiles: true,
  autoUpload: false
})

const emit = defineEmits<{
  uploaded: [files: AttachmentResponse[]]
  error: [error: string]
}>()

const toast = useToast()
const fileInput = ref<HTMLInputElement>()
const uploadQueue = ref<FileUploadProgress[]>([])
const existingFiles = ref<Attachment[]>([])
const isDragOver = ref(false)
const isUploading = ref(false)
const deletingFiles = ref(new Set<string>())

// 计算属性
const pendingFiles = computed(() => 
  uploadQueue.value.filter(item => item.status === 'pending')
)

const acceptTypes = computed(() => {
  if (!props.config.allowedTypes || props.config.allowedTypes.length === 0) {
    return '*'
  }
  
  // 将扩展名转换为文件选择器可识别的格式
  const acceptList = props.config.allowedTypes.map(type => {
    // 如果是 MIME 类型，直接使用
    if (type.includes('/')) {
      return type
    } else {
      // 如果是扩展名，添加点前缀
      return `.${type}`
    }
  })
  
  return acceptList.join(',')
})

const allowedTypesDisplay = computed(() => {
  if (!props.config.allowedTypes || props.config.allowedTypes.length === 0) {
    return '所有格式'
  }
  
  const extensions = props.config.allowedTypes.map(type => {
    // 如果是 MIME 类型，转换为扩展名
    if (type.includes('/')) {
      const extMap: Record<string, string> = {
        'image/jpeg': 'JPG',
        'image/png': 'PNG',
        'image/gif': 'GIF',
        'image/webp': 'WEBP',
        'application/pdf': 'PDF',
        'text/plain': 'TXT',
        'text/csv': 'CSV',
        'application/zip': 'ZIP',
        'application/x-zip-compressed': 'ZIP',
        'application/msword': 'DOC',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
        'application/vnd.ms-excel': 'XLS',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
        'application/vnd.ms-powerpoint': 'PPT',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
        'application/x-rar-compressed': 'RAR',
        'application/vnd.rar': 'RAR'
      }
      return extMap[type] || type.split('/')[1]?.toUpperCase()
    } else {
      // 如果已经是扩展名，直接转换为大写
      return type.toUpperCase()
    }
  })
  
  return extensions.join(', ')
})

// 方法
const selectFiles = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  addFilesToQueue(files)
  target.value = '' // 清空input，允许重复选择同一文件
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer?.files || [])
  addFilesToQueue(files)
}

const addFilesToQueue = (files: File[]) => {
  const validFiles: File[] = []
  
  for (const file of files) {
    // 验证文件类型
    if (props.config.allowedTypes && !FileApiService.validateFileType(file, props.config.allowedTypes)) {
      toast.add({
        severity: 'warn',
        summary: '文件类型不支持',
        detail: `文件 ${file.name} 的类型不被支持`,
        life: 3000
      })
      continue
    }
    
    // 验证文件大小
    const maxSize = props.config.maxFileSize || 100
    if (!FileApiService.validateFileSize(file, maxSize)) {
      toast.add({
        severity: 'warn',
        summary: '文件太大',
        detail: `文件 ${file.name} 超过了 ${maxSize}MB 的大小限制`,
        life: 3000
      })
      continue
    }
    
    validFiles.push(file)
  }
  
  // 添加到队列
  const newItems: FileUploadProgress[] = validFiles.map(file => ({
    file,
    progress: 0,
    status: 'pending'
  }))
  
  uploadQueue.value.push(...newItems)
  
  // 自动上传
  if (props.autoUpload && newItems.length > 0) {
    startUpload()
  }
}

const removeFile = (item: FileUploadProgress) => {
  const index = uploadQueue.value.indexOf(item)
  if (index > -1) {
    uploadQueue.value.splice(index, 1)
  }
}

const clearQueue = () => {
  uploadQueue.value = uploadQueue.value.filter(item => item.status === 'uploading')
}

const startUpload = async () => {
  const filesToUpload = pendingFiles.value
  if (filesToUpload.length === 0) return
  
  isUploading.value = true
  const uploadedFiles: AttachmentResponse[] = []
  
  try {
    for (const item of filesToUpload) {
      item.status = 'uploading'
      item.progress = 0
      
      try {
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          if (item.progress < 90) {
            item.progress += Math.random() * 20
          }
        }, 200)
        
        const result = await FileApiService.uploadFile(
          item.file,
          props.config.moduleType,
          props.config.moduleId,
          props.config.uploadedBy
        )
        
        clearInterval(progressInterval)
        item.progress = 100
        item.status = 'success'
        item.result = result
        uploadedFiles.push(result)
        
        toast.add({
          severity: 'success',
          summary: '上传成功',
          detail: `文件 ${item.file.name} 上传成功`,
          life: 3000
        })
        
      } catch (error) {
        item.status = 'error'
        item.error = '上传失败'
        
        toast.add({
          severity: 'error',
          summary: '上传失败',
          detail: `文件 ${item.file.name} 上传失败`,
          life: 3000
        })
      }
    }
    
    if (uploadedFiles.length > 0) {
      emit('uploaded', uploadedFiles)
      await loadExistingFiles() // 刷新已存在的文件列表
    }
    
  } catch (error) {
    emit('error', '批量上传失败')
  } finally {
    isUploading.value = false
  }
}

const downloadFile = (file: AttachmentResponse) => {
  FileApiService.downloadFile(file.id, file.file_name)
}

const previewFile = (file: AttachmentResponse) => {
  FileApiService.previewFile(file.id)
}

const downloadExistingFile = (file: Attachment) => {
  FileApiService.downloadFile(file.id, file.file_name)
}

const previewExistingFile = (file: Attachment) => {
  FileApiService.previewFile(file.id)
}

const deleteExistingFile = async (file: Attachment) => {
  try {
    deletingFiles.value.add(file.id)
    await FileApiService.deleteAttachment(file.id)
    
    toast.add({
      severity: 'success',
      summary: '删除成功',
      detail: `文件 ${file.file_name} 已删除`,
      life: 3000
    })
    
    await loadExistingFiles()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '删除失败',
      detail: `文件 ${file.file_name} 删除失败`,
      life: 3000
    })
  } finally {
    deletingFiles.value.delete(file.id)
  }
}

const loadExistingFiles = async () => {
  if (!props.showExistingFiles) return
  
  try {
    const response = await FileApiService.getAttachmentsByModule(
      props.config.moduleType,
      props.config.moduleId
    )
    existingFiles.value = response.items || []
  } catch (error) {
    console.error('Failed to load existing files:', error)
  }
}

const getFileIcon = (fileType: string) => {
  return FileApiService.getFileIcon(fileType)
}

const formatFileSize = (bytes: number) => {
  return FileApiService.formatFileSize(bytes)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 监听配置变化，重新加载文件
watch(() => [props.config.moduleType, props.config.moduleId], () => {
  loadExistingFiles()
}, { deep: true })

// 组件挂载时加载已存在的文件
onMounted(() => {
  loadExistingFiles()
})
</script>

<style scoped>
.file-upload-component {
  width: 100%;
}

.upload-area {
  margin-bottom: 1rem;
}

.drop-zone {
  border: 2px dashed var(--surface-border);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--surface-ground);
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: var(--primary-color);
  background-color: var(--primary-50);
}

.upload-text {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-color);
}

.upload-hint {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.file-list {
  margin-bottom: 1rem;
}

.file-item,
.existing-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  background-color: var(--surface-card);
}

.file-item.success {
  border-color: var(--green-500);
  background-color: var(--green-50);
}

.file-item.error {
  border-color: var(--red-500);
  background-color: var(--red-50);
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-info i {
  font-size: 1.5rem;
  margin-right: 0.75rem;
  color: var(--primary-color);
}

.file-details {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.file-size,
.file-date {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 0.5rem;
}

.upload-progress {
  width: 100px;
}

.progress-text {
  font-size: 0.8rem;
  min-width: 30px;
}

.success-actions {
  display: flex;
  gap: 0.25rem;
}

.error-text {
  color: var(--red-500);
  font-size: 0.8rem;
}

.upload-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.existing-files {
  margin-top: 1rem;
}
</style>
