<template>
  <div class="synthetic-input-page">
    <div class="container">
      <h1 class="page-title">合成录入平台</h1>
      
      <!-- 项目选择区域 -->
      <div class="project-selection-section">
        <div class="project-selection">
          <label for="project-dropdown" class="project-label">选择项目:</label>
          <Dropdown
            id="project-dropdown"
            v-model="selectedProject"
            :options="projects"
            optionLabel="name"
            optionValue="id"
            placeholder="请选择项目"
            class="project-dropdown"
            @change="handleProjectChange"
            :loading="projectLoading"
          />
          <Button 
            label="管理项目" 
            icon="pi pi-cog"
            severity="secondary"
            @click="showProjectDialog = true"
            class="manage-project-btn"
          />
        </div>
        
        <!-- 当前项目显示 -->
        <div v-if="currentProject" class="current-project-info">
          <h3>当前项目: {{ currentProject.name }}</h3>
          <p v-if="currentProject.description">{{ currentProject.description }}</p>
        </div>
      </div>

      <!-- 化合物列表区域 -->
      <div class="compounds-section">
        <div class="section-header">
          <h2>化合物列表</h2>
          <div class="header-actions">
            <Button 
              label="刷新" 
              icon="pi pi-refresh"
              @click="handleRefreshTable"
              :loading="tableLoading"
              class="refresh-btn"
            />
            <Button 
              label="列设置" 
              icon="pi pi-cog"
              severity="secondary"
              @click="openColumnSelector"
              class="column-btn"
            />
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-container">
          <DataTable
            :value="tableData"
            :loading="tableLoading"
            :scrollable="scrollable"
            :scrollHeight="scrollHeight"
            :paginator="true"
            :rows="pageSize"
            :totalRecords="total"
            :lazy="true"
            @page="onPageChange"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            currentPageReportTemplate="显示 {first} 到 {last} 条记录，共 {totalRecords} 条"
            class="data-table"
            stripedRows
            responsiveLayout="scroll"
          >
            <!-- 化合物名称列 -->
            <Column 
              v-if="isColumnVisible('name')"
              field="name" 
              header="化合物名称" 
              :style="getColumnStyle('name')"
              :frozen="isColumnFrozen('name')"
              :alignFrozen="getColumnAlign('name')"
              sortable
            >
              <template #body="{ data }">
                <span class="compound-name">{{ data.name || '-' }}</span>
              </template>
            </Column>

            <!-- SMILES结构列 -->
            <Column 
              v-if="isColumnVisible('smiles')"
              field="smiles" 
              header="SMILES结构" 
              :style="getColumnStyle('smiles')"
              :frozen="isColumnFrozen('smiles')"
              :alignFrozen="getColumnAlign('smiles')"
            >
              <template #body="{ data }">
                <div class="smiles-combined-container">
                  <!-- 结构图片部分 -->
                  <div class="smiles-image-section">
                    <img
                      v-if="data.smilesImage"
                      :src="data.smilesImage"
                      :alt="`Structure of ${data.name}`"
                      class="smiles-image clickable-image"
                      @click="showImageModal(data)"
                      @error="handleImageError"
                    />
                    <div v-else class="no-image">
                      <i class="pi pi-image"></i>
                      <span>无结构图</span>
                    </div>
                  </div>
                  
                  <!-- SMILES文本部分 -->
                  <div class="smiles-text-section">
                    <span class="smiles-text">{{ data.smiles || '-' }}</span>
                  </div>
                </div>
              </template>
            </Column>

            <!-- 合成优先级列 -->
            <Column 
              v-if="isColumnVisible('synthetic_priority')"
              field="synthetic_priority" 
              header="合成优先级" 
              :style="getColumnStyle('synthetic_priority')"
              :frozen="isColumnFrozen('synthetic_priority')"
              :alignFrozen="getColumnAlign('synthetic_priority')"
              sortable
            >
              <template #body="{ data }">
                <span class="priority-cell">
                  {{ getPriorityLabel(data.synthetic_priority) }}
                </span>
              </template>
            </Column>

            <!-- 描述列 -->
            <Column 
              v-if="isColumnVisible('description')"
              field="description" 
              header="描述" 
              :style="getColumnStyle('description')"
              :frozen="isColumnFrozen('description')"
              :alignFrozen="getColumnAlign('description')"
            >
              <template #body="{ data }">
                <span class="description-text">{{ data.description || '-' }}</span>
              </template>
            </Column>

            <!-- 创建时间列 -->
            <Column 
              v-if="isColumnVisible('create_time')"
              field="create_time" 
              header="创建时间" 
              :style="getColumnStyle('create_time')"
              :frozen="isColumnFrozen('create_time')"
              :alignFrozen="getColumnAlign('create_time')"
              sortable
            >
              <template #body="{ data }">
                <span class="create-time">{{ formatDateTime(data.create_time) }}</span>
              </template>
            </Column>

            <!-- 操作列 -->
            <Column 
              v-if="isColumnVisible('action')"
              field="action" 
              header="操作" 
              :style="getColumnStyle('action')"
              :frozen="isColumnFrozen('action')"
              :alignFrozen="getColumnAlign('action')"
            >
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button
                    icon="pi pi-pencil"
                    severity="info"
                    size="small"
                    @click="editCompound(data)"
                    class="action-btn edit-btn"
                    v-tooltip.top="'编辑'"
                  />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    @click="deleteRow(data.id)"
                    class="action-btn delete-btn"
                    v-tooltip.top="'删除'"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- 项目管理对话框 -->
    <Dialog
      v-model:visible="showProjectDialog"
      modal
      header="项目管理"
      :style="{ width: '600px' }"
      class="project-dialog"
    >
      <ProjectList
        :projects="projects"
        :loading="projectLoading"
        @select="handleSelectProject"
        @edit="handleEditProject"
        @delete="handleDeleteProject"
        @create="handleCreateProject"
        @refresh="refreshProjects"
      />
    </Dialog>

    <!-- 列设置对话框 -->
    <Dialog
      v-model:visible="showColumnDialog"
      modal
      header="列设置"
      :style="{ width: '500px' }"
      class="column-dialog"
    >
      <div class="column-content">
        <p class="column-description">选择要显示的列:</p>
        
        <div class="column-options">
          <div
            v-for="column in availableColumns"
            :key="column.field"
            class="column-option"
            :class="{ 'disabled': column.required }"
          >
            <label class="column-checkbox">
              <input
                type="checkbox"
                :checked="column.visible"
                :disabled="column.required"
                @change="toggleColumn(column.field)"
              />
              <span class="checkmark"></span>
            </label>
            <span class="column-label">{{ column.header }}</span>
            <span v-if="column.required" class="required-badge">必需</span>
          </div>
        </div>
        
        <div class="column-actions">
          <Button 
            label="全选" 
            severity="secondary" 
            @click="selectAllColumns"
            class="select-all-btn"
          />
          <Button 
            label="重置默认" 
            severity="secondary" 
            @click="resetToDefault"
            class="reset-btn"
          />
          <Button 
            label="应用" 
            @click="applyColumnChanges"
            class="apply-btn"
          />
          <Button 
            label="取消" 
            severity="secondary" 
            @click="closeColumnDialog"
            class="cancel-btn"
          />
        </div>
      </div>
    </Dialog>

    <!-- 结构图片预览对话框 -->
    <Dialog
      v-model:visible="showImageDialog"
      modal
      :header="selectedImage.name || '分子结构'"
      :style="{ width: '600px' }"
      class="image-dialog"
    >
      <div class="image-content">
        <img
          :src="selectedImage.src"
          :alt="selectedImage.name"
          class="preview-image"
        />
        <div class="image-details">
          <div class="detail-row">
            <label>化合物名称:</label>
            <span>{{ selectedImage.name }}</span>
          </div>
          <div class="detail-row">
            <label>SMILES:</label>
            <span class="smiles-text">{{ selectedImage.smiles }}</span>
          </div>
          <div v-if="selectedImage.description" class="detail-row">
            <label>描述:</label>
            <span>{{ selectedImage.description }}</span>
          </div>
        </div>
        <div class="image-actions">
          <Button 
            label="下载图片" 
            icon="pi pi-download"
            @click="downloadImage"
            class="download-btn"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';

// 导入自定义组件
import ProjectList from '@/components/ProjectList.vue';

// 导入自定义组合式函数
import { useTableData } from '@/composables/useTableData';
import { useProjectManagement } from '@/composables/useProjectManagement';
import type { Project } from '@/types/data';

// 使用组合式函数
const {
  tableData,
  loading: tableLoading,
  total,
  currentPage,
  pageSize,
  showImageDialog,
  selectedImage,
  scrollable,
  scrollHeight,
  loadTableData,
  deleteRow,
  showImageModal,
  closeImageDialog,
  downloadImage,
  handleImageError
} = useTableData();

const {
  projects,
  selectedProject: selectedProjectId,
  loading: projectLoading,
  showProjectDialog,
  loadProjects,
  createProject,
  updateProject,
  deleteProject,
  closeProjectDialog,
  refreshProjects
} = useProjectManagement();

// 本地状态
const selectedProject = ref<string | null>(null);
const showColumnDialog = ref(false);

// 计算属性：当前选中的项目对象
const currentProject = computed(() => {
  if (!selectedProject.value) return null;
  return projects.value.find(p => p.id === selectedProject.value) || null;
});

// 定义可用的列配置
interface ColumnConfig {
  field: string;
  header: string;
  style: string;
  visible: boolean;
  required: boolean;
  frozen?: boolean;
  alignFrozen?: string;
}

const availableColumns = ref<ColumnConfig[]>([
  { field: 'name', header: '化合物名称', style: 'min-width: 150px', visible: true, required: true },
  { field: 'smiles', header: 'SMILES结构', style: 'min-width: 300px', visible: true, required: false },
  { field: 'synthetic_priority', header: '合成优先级', style: 'min-width: 120px', visible: true, required: false },
  { field: 'description', header: '描述', style: 'min-width: 200px', visible: true, required: false },
  { field: 'create_time', header: '创建时间', style: 'min-width: 140px', visible: true, required: false },
  { field: 'action', header: '操作', style: 'min-width: 120px', visible: true, required: true, frozen: true, alignFrozen: 'right' }
]);

// 默认列配置
const defaultColumnSettings = [
  { field: 'name', visible: true },
  { field: 'smiles', visible: true },
  { field: 'synthetic_priority', visible: true },
  { field: 'description', visible: true },
  { field: 'create_time', visible: true },
  { field: 'action', visible: true }
];

// 合成优先级选项
const syntheticPriorityOptions = [
  { label: '高 (High)', value: 3 },
  { label: '中 (Medium)', value: 2 },
  { label: '低 (Low)', value: 1 }
];

// 列相关的辅助方法
const isColumnVisible = (field: string) => {
  const column = availableColumns.value.find(col => col.field === field);
  return column ? column.visible : false;
};

const getColumnStyle = (field: string) => {
  const column = availableColumns.value.find(col => col.field === field);
  return column ? column.style : '';
};

const isColumnFrozen = (field: string) => {
  const column = availableColumns.value.find(col => col.field === field);
  return column ? column.frozen : false;
};

const getColumnAlign = (field: string) => {
  const column = availableColumns.value.find(col => col.field === field);
  return column ? column.alignFrozen : undefined;
};

// 获取优先级显示文本
const getPriorityLabel = (priority: number | null | undefined) => {
  if (priority === null || priority === undefined) return '-';
  const option = syntheticPriorityOptions.find(opt => opt.value === priority);
  return option ? option.label : `${priority}`;
};

// 格式化日期时间
const formatDateTime = (dateTime: string | null | undefined) => {
  if (!dateTime) return '-';
  try {
    const date = new Date(dateTime);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    return dateTime;
  }
};

// 事件处理方法
const handleProjectChange = async () => {
  console.log('Project changed to:', selectedProject.value);
  if (selectedProject.value) {
    await loadTableData(1, pageSize.value, selectedProject.value);
  } else {
    // 如果没有选择项目，清空表格数据
    tableData.value = [];
    total.value = 0;
  }
};

const handleRefreshTable = async () => {
  if (selectedProject.value) {
    await loadTableData(currentPage.value, pageSize.value, selectedProject.value);
  }
};

const onPageChange = async (event: any) => {
  const page = event.page + 1; // PrimeVue 的页码从0开始
  const size = event.rows;
  await loadTableData(page, size, selectedProject.value || undefined);
};

// 列设置相关方法
const openColumnSelector = () => {
  showColumnDialog.value = true;
};

const closeColumnDialog = () => {
  showColumnDialog.value = false;
};

const toggleColumn = (field: string) => {
  const column = availableColumns.value.find(col => col.field === field);
  if (column && !column.required) {
    column.visible = !column.visible;
  }
};

const selectAllColumns = () => {
  availableColumns.value.forEach(column => {
    column.visible = true;
  });
};

const resetToDefault = () => {
  defaultColumnSettings.forEach(defaultCol => {
    const column = availableColumns.value.find(col => col.field === defaultCol.field);
    if (column) {
      column.visible = defaultCol.visible;
    }
  });
};

const applyColumnChanges = () => {
  console.log('应用列设置变更');
  
  // 保存列设置到localStorage
  const columnSettings = availableColumns.value.map(col => ({
    field: col.field,
    visible: col.visible
  }));
  
  try {
    localStorage.setItem('synthetic-page-column-settings', JSON.stringify(columnSettings));
    console.log('列设置已保存到localStorage');
  } catch (error) {
    console.error('保存列设置失败:', error);
  }
  
  closeColumnDialog();
  alert('列设置已应用');
};

// 从localStorage加载列设置
const loadColumnSettings = () => {
  try {
    const savedSettings = localStorage.getItem('synthetic-page-column-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      settings.forEach((setting: any) => {
        const column = availableColumns.value.find(col => col.field === setting.field);
        if (column) {
          column.visible = setting.visible;
        }
      });
      console.log('列设置已从localStorage加载');
    }
  } catch (error) {
    console.error('加载列设置失败:', error);
  }
};

// 项目管理相关方法
const handleSelectProject = async (project: Project) => {
  console.log('Selected project:', project);
  selectedProject.value = project.id;
  await handleProjectChange();
  closeProjectDialog();
};

const handleEditProject = (project: Project) => {
  console.log('Edit project:', project);
  alert(`编辑项目: ${project.name}\n功能待实现`);
};

const handleDeleteProject = async (project: Project) => {
  console.log('Delete project:', project);
  const confirmed = confirm(`确定要删除项目 "${project.name}" 吗？此操作不可撤销。`);
  if (confirmed) {
    try {
      await deleteProject(project.id);
      alert(`项目 "${project.name}" 已删除`);
      // 如果删除的是当前选中的项目，清空选择
      if (selectedProject.value === project.id) {
        selectedProject.value = null;
        tableData.value = [];
        total.value = 0;
      }
    } catch (error) {
      alert('删除项目失败，请稍后重试。');
    }
  }
};

const handleCreateProject = () => {
  console.log('Create new project');
  const name = prompt('请输入项目名称:');
  if (name && name.trim()) {
    createNewProject(name.trim());
  }
};

const createNewProject = async (name: string, description?: string) => {
  try {
    const newProject = await createProject({ name, description });
    if (newProject) {
      alert(`项目 "${newProject.name}" 创建成功`);
    }
  } catch (error) {
    alert('创建项目失败，请稍后重试。');
  }
};

// 化合物编辑（暂时只是提示）
const editCompound = (compound: any) => {
  console.log('编辑化合物:', compound);
  alert(`编辑化合物: ${compound.name}\n功能待实现`);
};

// 初始化
const initialize = async () => {
  // 加载列设置
  loadColumnSettings();
  
  // 加载项目列表
  await loadProjects();
  
  // 自动选中第一个项目（如果有的话）
  if (projects.value.length > 0 && !selectedProject.value) {
    selectedProject.value = projects.value[0].id;
    await handleProjectChange();
  }
  
  console.log('Synthetic Input Page initialized');
};

// 监听项目列表变化
watch(projects, (newProjects) => {
  // 如果当前选中的项目不在新的项目列表中，清空选择
  if (selectedProject.value && !newProjects.find(p => p.id === selectedProject.value)) {
    selectedProject.value = null;
    tableData.value = [];
    total.value = 0;
  }
}, { deep: true });

onMounted(() => {
  initialize();
});
</script>

<style scoped>
.synthetic-input-page {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  color: var(--p-primary-color);
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

/* 项目选择区域样式 */
.project-selection-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.project-selection {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.project-label {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.project-dropdown {
  flex: 1;
  max-width: 300px;
}

.manage-project-btn {
  white-space: nowrap;
}

.current-project-info {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.current-project-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--p-primary-color);
  font-size: 1.1rem;
}

.current-project-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* 化合物列表区域样式 */
.compounds-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  margin: 0;
  color: var(--p-primary-color);
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.refresh-btn,
.column-btn {
  min-width: 100px;
}

/* 表格容器样式 */
.table-container {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.data-table {
  width: 100%;
}

.data-table :deep(.p-datatable-header) {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  padding: 1rem;
}

/* 表格内容样式 */
.compound-name {
  font-weight: 500;
  color: #333;
}

.smiles-combined-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 280px;
}

.smiles-image-section {
  display: flex;
  justify-content: center;
}

.smiles-image {
  max-width: 120px;
  max-height: 80px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.clickable-image {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 80px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  color: #666;
  font-size: 0.8rem;
}

.smiles-text-section {
  text-align: center;
}

.smiles-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  color: #495057;
  word-break: break-all;
  display: block;
  max-width: 100%;
}

.priority-cell {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: #e9ecef;
  color: #495057;
}

.description-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.create-time {
  font-size: 0.9rem;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
}

.edit-btn:hover {
  transform: scale(1.1);
}

.delete-btn:hover {
  transform: scale(1.1);
}

/* 对话框样式 */
.project-dialog :deep(.p-dialog-content) {
  padding: 0;
}

.column-dialog :deep(.p-dialog-content) {
  padding: 1.5rem;
}

.column-content {
  min-height: 300px;
}

.column-description {
  margin-bottom: 1rem;
  color: #666;
}

.column-options {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.column-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.column-option:last-child {
  border-bottom: none;
}

.column-option.disabled {
  opacity: 0.6;
}

.column-checkbox {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.column-checkbox input[type="checkbox"] {
  opacity: 0;
  position: absolute;
  width: 1rem;
  height: 1rem;
}

.checkmark {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--p-primary-color);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.column-checkbox input[type="checkbox"]:checked + .checkmark {
  background-color: var(--p-primary-color);
}

.column-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.column-checkbox input[type="checkbox"]:disabled + .checkmark {
  border-color: #ccc;
  background-color: #f8f9fa;
}

.column-label {
  font-weight: 500;
  flex: 1;
}

.required-badge {
  background-color: #dc3545;
  color: white;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.7rem;
}

.column-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.column-actions button {
  min-width: 80px;
}

/* 图片预览对话框样式 */
.image-dialog :deep(.p-dialog-content) {
  padding: 1.5rem;
}

.image-content {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.image-details {
  text-align: left;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.detail-row label {
  font-weight: 500;
  width: 100px;
  color: #333;
}

.detail-row span {
  flex: 1;
  color: #666;
}

.image-actions {
  text-align: center;
}

.download-btn {
  min-width: 120px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .synthetic-input-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .project-selection {
    flex-direction: column;
    align-items: stretch;
  }
  
  .project-dropdown {
    max-width: none;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .column-actions {
    justify-content: center;
  }
}
</style>
