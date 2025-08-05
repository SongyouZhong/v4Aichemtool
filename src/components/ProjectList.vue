<!-- 项目列表显示组件 -->
<template>
  <div class="project-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      </div>
      <p>正在加载项目数据...</p>
    </div>

    <!-- 无数据状态 -->
    <div v-else-if="projects.length === 0" class="empty-state">
      <i class="pi pi-folder-open" style="font-size: 3rem; color: #6c757d;"></i>
      <p>暂无项目数据</p>
      <Button 
        label="创建第一个项目" 
        icon="pi pi-plus" 
        @click="$emit('create-project')"
        size="small"
      />
    </div>

    <!-- 项目列表 -->
    <div v-else class="projects-grid">
      <div 
        v-for="project in projects" 
        :key="project.id" 
        class="project-card"
        :class="{ 'project-card--selected': selectedProject && selectedProject.id === project.id }"
        @click="$emit('select-project', project)"
      >
        <div class="project-header">
          <h4 class="project-title">
            {{ project.name }}
            <i v-if="selectedProject && selectedProject.id === project.id" 
               class="pi pi-check-circle selected-indicator" 
               v-tooltip.top="'当前选中'"
            ></i>
          </h4>
          <div class="project-actions">
            <Button 
              icon="pi pi-pencil" 
              severity="secondary" 
              size="small" 
              text 
              @click.stop="$emit('edit-project', project)"
              v-tooltip.top="'编辑项目'"
            />
            <Button 
              icon="pi pi-trash" 
              severity="danger" 
              size="small" 
              text 
              @click.stop="$emit('delete-project', project)"
              v-tooltip.top="'删除项目'"
            />
          </div>
        </div>
        
        <div class="project-content">
          <div class="project-field">
            <label>项目描述:</label>
            <p>{{ project.description || '无描述' }}</p>
          </div>
          
          <div class="project-field" v-if="project.attachment">
            <label>附件:</label>
            <p>{{ project.attachment }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="project-actions-bar">
      <Button 
        label="刷新" 
        icon="pi pi-refresh" 
        severity="secondary"
        @click="$emit('refresh')"
        :loading="loading"
      />
      <Button 
        label="新建项目" 
        icon="pi pi-plus" 
        @click="$emit('create-project')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import type { Project } from '@/types/data'

// Props
defineProps<{
  projects: Project[]
  loading: boolean
  selectedProject?: Project | null
}>()

// Emits
defineEmits<{
  'select-project': [project: Project]
  'edit-project': [project: Project]
  'delete-project': [project: Project]
  'create-project': []
  'refresh': []
}>()
</script>

<style scoped>
.project-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 200px;
  color: #6c757d;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 200px;
  color: #6c757d;
  text-align: center;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.project-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.project-card:hover {
  border-color: var(--p-primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.project-card--selected {
  border-color: var(--p-primary-color);
  background: linear-gradient(135deg, rgba(var(--p-primary-500-rgb), 0.05) 0%, rgba(var(--p-primary-500-rgb), 0.02) 100%);
  box-shadow: 0 4px 12px rgba(var(--p-primary-500-rgb), 0.15);
  transform: translateY(-1px);
}

.project-card--selected .project-title {
  color: var(--p-primary-600);
  font-weight: 700;
}

.project-card--selected::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--p-primary-500), var(--p-primary-600));
  border-radius: 8px 8px 0 0;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.project-title {
  margin: 0;
  color: var(--p-primary-color);
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
  word-break: break-word;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-indicator {
  color: var(--p-green-500);
  font-size: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.project-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.project-card:hover .project-actions {
  opacity: 1;
}

.project-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.project-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.project-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
}

.project-field p {
  margin: 0;
  font-size: 0.9rem;
  color: #212529;
  line-height: 1.4;
  word-break: break-word;
}

.project-meta {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f8f9fa;
}

.project-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  margin-top: auto;
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .project-actions-bar {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .project-actions-bar button {
    width: 100%;
  }
}
</style>
