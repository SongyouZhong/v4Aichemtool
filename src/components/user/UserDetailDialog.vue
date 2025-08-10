<template>
  <Dialog
    v-model:visible="dialogVisible"
    header="用户详情"
    :modal="true"
    :style="{ width: '500px' }"
    class="user-detail-dialog"
  >
    <div v-if="user" class="user-detail">
      <!-- 用户头像和基本信息 -->
      <div class="user-header">
        <Avatar 
          :label="user.name.charAt(0)" 
          class="user-avatar-large"
          shape="circle"
        />
        <div class="user-basic-info">
          <h3 class="user-name">{{ user.name }}</h3>
          <Tag :value="user.department" class="department-tag" />
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="user-details">
        <div class="detail-section">
          <h4 class="section-title">联系信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label class="detail-label">手机号码</label>
              <div class="detail-value">
                <i class="pi pi-phone detail-icon"></i>
                <span>{{ user.phone }}</span>
                <Button
                  icon="pi pi-copy"
                  @click="copyToClipboard(user.phone)"
                  class="p-button-text p-button-sm copy-btn"
                  v-tooltip.top="'复制'"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">组织信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label class="detail-label">所属部门</label>
              <div class="detail-value">
                <i class="pi pi-building detail-icon"></i>
                <span>{{ user.department }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">系统信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label class="detail-label">用户ID</label>
              <div class="detail-value">
                <i class="pi pi-id-card detail-icon"></i>
                <span class="user-id">{{ user.id }}</span>
                <Button
                  icon="pi pi-copy"
                  @click="copyToClipboard(user.id)"
                  class="p-button-text p-button-sm copy-btn"
                  v-tooltip.top="'复制'"
                />
              </div>
            </div>
            
            <div class="detail-item">
              <label class="detail-label">创建时间</label>
              <div class="detail-value">
                <i class="pi pi-calendar detail-icon"></i>
                <span>{{ formatDateTime(user.create_time) }}</span>
              </div>
            </div>
            
            <div class="detail-item">
              <label class="detail-label">更新时间</label>
              <div class="detail-value">
                <i class="pi pi-clock detail-icon"></i>
                <span>{{ formatDateTime(user.update_time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button
          label="关闭"
          icon="pi pi-times"
          @click="dialogVisible = false"
          class="p-button-text"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { User } from '@/types/user'

interface Props {
  visible: boolean
  user?: User | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  user: null
})

const emit = defineEmits<Emits>()
const toast = useToast()

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

/**
 * 格式化日期时间
 */
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 复制到剪贴板
 */
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({
      severity: 'success',
      summary: '成功',
      detail: '已复制到剪贴板',
      life: 2000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '复制失败',
      life: 3000
    })
  }
}
</script>

<style scoped>
.user-detail-dialog {
  font-family: var(--font-family);
}

.user-detail {
  padding: 1rem 0;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  margin-bottom: 1.5rem;
}

.user-avatar-large {
  width: 4rem;
  height: 4rem;
  font-size: 1.5rem;
}

.user-basic-info {
  flex: 1;
}

.user-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.department-tag {
  font-size: 0.875rem;
}

.user-details {
  space-y: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.detail-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--surface-100);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--primary-color);
}

.detail-icon {
  color: var(--primary-color);
  font-size: 1rem;
}

.user-id {
  font-family: monospace;
  font-size: 0.875rem;
  background: var(--surface-200);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.copy-btn {
  margin-left: auto;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.copy-btn:hover {
  opacity: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
}

@media (max-width: 600px) {
  .user-header {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-value {
    flex-wrap: wrap;
  }
}
</style>
