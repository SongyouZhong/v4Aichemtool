<template>
  <div class="data-input-page">
    <div class="container">
      <h1 class="page-title">Data Input Platform</h1>
      
      <!-- 上半部分 -->
      <div class="top-section">
        <!-- 左边Ketcher化学结构编辑器 -->
        <div class="left-block">
          <div class="ketcher-container">
            <h3>Chemical Structure Editor</h3>
            <iframe 
              ref="ketcherFrame"
              class="ketcher-frame" 
              id="idKetcher" 
              src="/standalone/index.html" 
              width="100%" 
              height="450"
              @load="handleKetcherLoad"
            />
            <div class="ketcher-controls">
              <Button 
                label="Get SMILES" 
                size="small"
                @click="getSmilesAndSync"
                class="control-btn"
                title="Get SMILES from editor to input field"
              />
              <Button 
                label="Clear" 
                size="small" 
                severity="secondary"
                @click="clearMolecule"
                class="control-btn"
              />
            </div>
            <div class="ketcher-help">
              <small class="help-text">
                <strong>Usage:</strong> 
                • Draw molecule, click "Get SMILES" to copy to input field<br>
                • Enter SMILES in input field, click "Set SMILES" to display in editor<br>
                <span v-if="!ketcherReady" style="color: orange;">⚠️ Ketcher is loading...</span>
                <span v-else style="color: green;">✅ Ketcher is ready</span>
              </small>
            </div>
          </div>
        </div>
        
        <!-- 右边输入框区域 -->
        <div class="right-inputs">
          <h3>Input Parameters</h3>
          
          <!-- 第1行：1个下拉框 + 1个按钮 -->
        <div class="input-row row-1">
          <div class="input-item">
            <label for="current-project">Current Project:</label>
            <InputText 
              id="current-project"
              :value="currentProjectDisplay"
              readonly
              placeholder="No project selected"
              class="w-full project-display"
            />
          </div>
          <Button 
            label="Project Management" 
            icon="pi pi-cog" 
            @click="handleProjectManagement"
            class="row-btn"
          />
        </div>          <!-- 第2行：2个输入框 -->
          <div class="input-row row-2">
            <div class="input-item">
              <label for="input2">Compound Name:</label>
              <InputText v-model="inputs.compoundName" id="input2" placeholder="Enter compound name" />
            </div>
            <div class="input-item">
              <label for="input3">Compound Batch:</label>
              <InputText v-model="inputs.compoundBatch" id="input3" placeholder="Enter compound batch" />
            </div>
          </div>
          
          <!-- 第3行：SMILES输入框和Set SMILES按钮 -->
          <div class="input-row row-3">
            <div class="input-item smiles-input-container">
              <label for="input4">Compound SMILES:</label>
              <InputText v-model="inputs.compoundSmiles" id="input4" placeholder="Enter SMILES or use 'Get SMILES' button" />
              <small class="field-help">Type SMILES (e.g., CCO for ethanol) then click "Set SMILES" button</small>
            </div>
            <div class="smiles-set-button">
              <Button 
                label="Set SMILES" 
                size="small" 
                severity="info"
                @click="setSmilesFromInput"
                class="control-btn set-smiles-btn"
                title="Set SMILES from input field to editor"
              />
            </div>
          </div>

          <!-- 第4行：Compound Note -->
          <div class="input-row row-4">
            <div class="input-item note-input-container">
              <label for="input5">Compound Note:</label>
              <textarea 
                v-model="inputs.compoundNote" 
                id="input5" 
                placeholder="Enter compound note or description..." 
                class="compound-note-textarea"
                rows="4"
              />
            </div>
          </div>
          
          <!-- 第5行：保存按钮 -->
          <div class="input-row row-5">
            <Button label="Save" @click="handleSave" class="row-btn" />
          </div>
        
        </div>
      </div>
      
      <!-- 下半部分 - 数据表格 -->
      <div class="bottom-section">
        <div class="table-header">
          <h3>化合物列表</h3>
          <div class="header-actions">
            <Button 
              label="Columns" 
              icon="pi pi-th-large" 
              severity="secondary"
              @click="openColumnSelector"
              class="column-btn"
              v-tooltip.top="'选择显示列'"
            />
            <Button 
              label="Filter" 
              icon="pi pi-filter" 
              severity="secondary"
              @click="openFilterDrawer"
              class="filter-btn"
            />
          </div>
        </div>
        <div class="table-container">
          <DataTable 
            :value="tableData" 
            :rows="rows"
            :rowsPerPageOptions="[10, 15, 20, 30, 50]"
            :paginator="true"
            :scrollable="scrollable"
            :scrollHeight="scrollHeight"
            tableStyle="min-width: 80rem"
            class="data-table"
            responsiveLayout="scroll"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          >
            <!-- 动态生成列 -->
            <Column 
              v-for="col in visibleColumns" 
              :key="col.field" 
              :field="col.field" 
              :header="col.header" 
              :style="col.style"
              :frozen="col.frozen"
              :alignFrozen="col.alignFrozen"
            >
              <template #body="slotProps">
                <!-- Name 列 -->
                <span v-if="col.field === 'name'">{{ slotProps.data.name }}</span>
                
                <!-- Batch 列 -->
                <span v-else-if="col.field === 'batch'">{{ slotProps.data.batch ?? '-' }}</span>
                
                <!-- SMILES 列 -->
                <span v-else-if="col.field === 'smiles'" class="smiles-text">{{ slotProps.data.smiles }}</span>
                
                <!-- SMILES Image 列 -->
                <div v-else-if="col.field === 'smilesImage'" class="smiles-image-container">
                  <img v-if="slotProps.data.smilesImage" 
                       :src="slotProps.data.smilesImage" 
                       :alt="'SMILES: ' + slotProps.data.smiles"
                       class="smiles-image clickable-image"
                       @error="handleImageError($event)"
                       @click="showImageModal(slotProps.data)"
                       :title="'Click to enlarge - ' + slotProps.data.name"
                  />
                  <span v-else class="no-image">No Image</span>
                </div>
                
                <!-- Description 列 -->
                <span v-else-if="col.field === 'description'">{{ slotProps.data.description }}</span>
                
                <!-- Attachments 列 -->
                <div v-else-if="col.field === 'attachments'" class="attachments-cell">
                  <span v-if="slotProps.data.attachments && slotProps.data.attachments.length > 0">
                    {{ slotProps.data.attachments.length }} file(s)
                  </span>
                  <span v-else>-</span>
                </div>
                
                <!-- Create Time 列 -->
                <span v-else-if="col.field === 'create_time'">
                  {{ slotProps.data.create_time ? new Date(slotProps.data.create_time).toLocaleDateString() : '-' }}
                </span>
                
                <!-- Creator 列 -->
                <span v-else-if="col.field === 'creator_id'">{{ slotProps.data.creator_id || '-' }}</span>
                
                <!-- Project ID 列 -->
                <span v-else-if="col.field === 'project_id'">{{ slotProps.data.project_id || '-' }}</span>
                
                <!-- Action 列 -->
                <div v-else-if="col.field === 'action'" class="action-buttons">
                  <Button 
                    icon="pi pi-pencil" 
                    size="small" 
                    outlined
                    @click="editRow(slotProps.data)"
                    v-tooltip.top="'Edit'"
                    class="action-btn edit-btn"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    size="small" 
                    outlined
                    severity="danger"
                    @click="deleteRow(slotProps.data)"
                    v-tooltip.top="'Delete'"
                    class="action-btn delete-btn"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
    
    <!-- 图片放大对话框 -->
    <Dialog 
      v-model:visible="showImageDialog" 
      :header="selectedImage.name + ' - Molecular Structure'"
      :modal="true" 
      :closable="true"
      :draggable="false"
      :resizable="false"
      class="image-dialog"
      @hide="closeImageDialog"
    >
      <div class="image-modal-content">
        <div class="enlarged-image-container">
          <img 
            :src="selectedImage.src" 
            :alt="'SMILES: ' + selectedImage.smiles"
            class="enlarged-image"
            @error="handleImageError($event)"
          />
        </div>
        
        <div class="image-details">
          <div class="detail-row">
            <label>Compound Name:</label>
            <span class="detail-value">{{ selectedImage.name }}</span>
          </div>
          
          <div class="detail-row">
            <label>SMILES:</label>
            <span class="detail-value smiles-code">{{ selectedImage.smiles }}</span>
          </div>
          
          <div class="detail-row">
            <label>Description:</label>
            <span class="detail-value">{{ selectedImage.description }}</span>
          </div>
        </div>
        
        <div class="modal-actions">
          <Button 
            label="Download Image" 
            icon="pi pi-download"
            @click="downloadImage"
            class="download-btn"
            size="small"
          />
          <Button 
            label="Close" 
            icon="pi pi-times"
            @click="closeImageDialog"
            severity="secondary"
            size="small"
          />
        </div>
      </div>
    </Dialog>
    
    <!-- 项目管理对话框 -->
    <Dialog 
      v-model:visible="showProjectDialog" 
      header="项目管理"
      :modal="true" 
      :closable="true"
      :draggable="false"
      :resizable="false"
      class="project-dialog"
      @hide="closeProjectDialog"
    >
      <div class="project-modal-content">
        <ProjectList 
          :projects="projects"
          :loading="projectLoading"
          :selectedProject="selectedProject"
          @select-project="handleSelectProject"
          @edit-project="handleEditProject"
          @delete-project="handleDeleteProject"
          @create-project="handleCreateProject"
          @refresh="refreshProjects"
        />
      </div>
    </Dialog>
    
    <!-- 项目切换确认对话框 -->
    <Dialog 
      v-model:visible="showProjectSwitchDialog" 
      header="确认切换项目"
      :modal="true" 
      :closable="true"
      :draggable="false"
      :resizable="false"
      class="project-switch-dialog"
      @hide="closeSwitchDialog"
    >
      <div class="switch-dialog-content">
        <div class="warning-message">
          <i class="pi pi-exclamation-triangle warning-icon"></i>
          <div class="message-text">
            <h4>您即将切换项目</h4>
            <p>当前项目: <strong>{{ selectedProject?.name || 'None' }}</strong></p>
            <p>切换到: <strong>{{ pendingProject?.name || 'None' }}</strong></p>
            <p class="warning-text">切换项目可能会影响当前的工作状态，确定要继续吗？</p>
          </div>
        </div>
        
        <div class="dialog-actions">
          <Button 
            label="取消" 
            icon="pi pi-times" 
            severity="secondary"
            @click="cancelSwitch"
          />
          <Button 
            label="确认切换" 
            icon="pi pi-check" 
            @click="confirmSwitch"
          />
        </div>
      </div>
    </Dialog>

    <!-- 保存化合物确认对话框 -->
    <Dialog 
      v-model:visible="showSaveConfirmDialog" 
      header="确认保存化合物"
      :modal="true" 
      :closable="true"
      :draggable="false"
      :resizable="false"
      class="save-confirm-dialog"
      @hide="closeSaveConfirmDialog"
    >
      <div class="confirm-dialog-content">
        <div class="confirmation-message">
          <i class="pi pi-question-circle question-icon"></i>
          <div class="message-text">
            <h4>确认保存化合物信息</h4>
            <p>您即将保存以下化合物信息到数据库中：</p>
            <div class="compound-summary">
              <div class="summary-row">
                <label>化合物名称:</label>
                <span>{{ inputs.compoundName || '未设置' }}</span>
              </div>
              <div class="summary-row">
                <label>化合物批次:</label>
                <span>{{ inputs.compoundBatch || '未设置' }}</span>
              </div>
              <div class="summary-row">
                <label>SMILES:</label>
                <span class="smiles-value">{{ inputs.compoundSmiles || '未设置' }}</span>
              </div>
              <div class="summary-row">
                <label>备注:</label>
                <span>{{ inputs.compoundNote || '未设置' }}</span>
              </div>
            </div>
            <p class="confirm-text">确定要保存吗？</p>
          </div>
        </div>
        
        <div class="dialog-actions">
          <Button 
            label="取消" 
            icon="pi pi-times" 
            severity="secondary"
            @click="closeSaveConfirmDialog"
            :disabled="saveLoading"
          />
          <Button 
            label="确认保存" 
            icon="pi pi-check" 
            @click="confirmSaveCompound"
            :loading="saveLoading"
          />
        </div>
      </div>
    </Dialog>
    
    <!-- Filter Drawer -->
    <Drawer 
      v-model:visible="showFilterDrawer" 
      header="化合物过滤器"
      position="right"
      class="filter-drawer"
      :modal="true"
      :dismissableMask="true"
    >
      <div class="filter-content">
        <div class="filter-section">
          <label for="filter-smiles" class="filter-label">分子式 (SMILES):</label>
          <InputText 
            id="filter-smiles"
            v-model="filterOptions.smiles"
            placeholder="请输入SMILES分子式 (如: CCO)"
            class="filter-input"
          />
          <small class="help-text">输入SMILES分子式进行相似度搜索</small>
        </div>
        
        <div class="filter-section">
          <label for="filter-similarity" class="filter-label">相似度阈值:</label>
          <InputText 
            id="filter-similarity"
            v-model="filterOptions.similarity"
            placeholder="请输入相似度 (0.0 - 1.0)"
            class="filter-input"
            @input="validateSimilarity"
          />
          <small class="help-text">范围: 0.0 - 1.0，最多一位小数 (如: 0.8)</small>
          <div v-if="similarityError" class="error-message">
            {{ similarityError }}
          </div>
        </div>
        
        <div class="filter-actions">
          <Button 
            label="应用过滤" 
            icon="pi pi-check"
            @click="applyFilter"
            class="apply-btn"
            :disabled="!isFilterValid"
          />
          <Button 
            label="清除过滤" 
            icon="pi pi-times"
            severity="secondary"
            @click="clearFilter"
            class="clear-btn"
          />
          <Button 
            label="关闭" 
            icon="pi pi-times"
            severity="secondary"
            @click="closeFilterDrawer"
            class="close-btn"
          />
        </div>
      </div>
    </Drawer>
    
    <!-- Column Selector Dialog -->
    <Dialog 
      v-model:visible="showColumnDialog" 
      header="选择显示列"
      :modal="true" 
      :closable="true"
      :draggable="false"
      :resizable="false"
      class="column-dialog"
      @hide="closeColumnDialog"
    >
      <div class="column-content">
        <div class="column-description">
          <p>选择您希望在表格中显示的列：</p>
        </div>
        
        <div class="column-options">
          <div 
            v-for="column in availableColumns" 
            :key="column.field"
            class="column-option"
          >
            <label class="column-checkbox">
              <input 
                type="checkbox" 
                :checked="column.visible"
                @change="toggleColumn(column.field)"
                :disabled="column.required"
              />
              <span class="checkmark"></span>
              <span class="column-label">{{ column.header }}</span>
              <span v-if="column.required" class="required-badge">必需</span>
            </label>
          </div>
        </div>
        
        <div class="column-actions">
          <Button 
            label="全选" 
            icon="pi pi-check-square"
            severity="secondary"
            @click="selectAllColumns"
            class="select-all-btn"
          />
          <Button 
            label="重置为默认" 
            icon="pi pi-refresh"
            severity="secondary"
            @click="resetToDefault"
            class="reset-btn"
          />
          <Button 
            label="应用" 
            icon="pi pi-check"
            @click="applyColumnChanges"
            class="apply-btn"
          />
          <Button 
            label="取消" 
            icon="pi pi-times"
            severity="secondary"
            @click="closeColumnDialog"
            class="cancel-btn"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Drawer from 'primevue/drawer';

// 导入自定义组件
import ProjectList from '@/components/ProjectList.vue';

// 导入自定义组合式函数
import { useTableData } from '@/composables/useTableData';
import { useProjectManagement, useFormData } from '@/composables/useProjectManagement';
import { useKetcher } from '@/composables/useKetcher';
import type { Project } from '@/types/data';

// 导入API服务
import { CompoundApiService } from '@/services/compoundApi';

// 使用组合式函数
const {
  tableData,
  rows,
  loading: tableLoading,
  showImageDialog,
  selectedImage,
  scrollable,
  scrollHeight,
  loadTableData,
  loadSampleData: loadSampleTableData,
  addNewRow,
  editRow,
  deleteRow,
  clearTable,
  showImageModal,
  closeImageDialog,
  downloadImage,
  handleImageError
} = useTableData();

const {
  mainParameterOptions,
  projectTableData,
  showProjectDialog,
  loading: projectLoading,
  projects,
  selectedProject,
  loadMainParameterOptions,
  loadProjectTableData,
  loadProjects,
  createProject,
  updateProject,
  deleteProject,
  handleProjectManagement,
  closeProjectDialog,
  editProject,
  refreshProjects
} = useProjectManagement();

const {
  inputs,
  errors: formErrors,
  loading: formLoading,
  resetForm,
  loadSampleData: loadSampleFormData,
  validateForm,
  saveFormData
} = useFormData();

const {
  ketcherFrame,
  currentSmiles,
  ketcherReady,
  loading: ketcherLoading,
  onKetcherLoad,
  getSmiles,
  setMolecule,
  clearMolecule,
  setSampleMolecule,
  setKetcherFrame
} = useKetcher();

// 计算属性：当前选中项目的显示
const currentProjectDisplay = computed(() => {
  if (selectedProject.value) {
    return `${selectedProject.value.name}${selectedProject.value.description ? ' - ' + selectedProject.value.description : ''}`;
  }
  return 'No project selected';
});

// 项目切换确认对话框相关
const showProjectSwitchDialog = ref(false);
const pendingProject = ref<Project | null>(null);

// 保存确认对话框相关
const showSaveConfirmDialog = ref(false);
const saveLoading = ref(false);

// Filter Drawer相关
const showFilterDrawer = ref(false);
const filterOptions = ref({
  smiles: '',
  similarity: ''
});
const similarityError = ref('');

// Column Selector相关
const showColumnDialog = ref(false);

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
  { field: 'batch', header: '批次', style: 'min-width: 120px', visible: true, required: false },
  { field: 'smiles', header: 'SMILES', style: 'min-width: 200px', visible: true, required: false },
  { field: 'smilesImage', header: 'SMILES图像', style: 'min-width: 150px', visible: true, required: false },
  { field: 'description', header: '描述', style: 'min-width: 200px', visible: true, required: false },
  { field: 'attachments', header: '附件', style: 'min-width: 150px', visible: true, required: false },
  { field: 'create_time', header: '创建时间', style: 'min-width: 140px', visible: false, required: false },
  { field: 'creator_id', header: '创建者', style: 'min-width: 120px', visible: false, required: false },
  { field: 'project_id', header: '项目ID', style: 'min-width: 120px', visible: false, required: false },
  { field: 'action', header: '操作', style: 'min-width: 150px', visible: true, required: true, frozen: true, alignFrozen: 'right' }
]);

// 默认列配置（用于重置）
const defaultColumnSettings = [
  { field: 'name', visible: true },
  { field: 'batch', visible: true },
  { field: 'smiles', visible: true },
  { field: 'smilesImage', visible: true },
  { field: 'description', visible: true },
  { field: 'attachments', visible: true },
  { field: 'create_time', visible: false },
  { field: 'creator_id', visible: false },
  { field: 'project_id', visible: false },
  { field: 'action', visible: true }
];

// 计算属性：当前可见的列
const visibleColumns = computed(() => {
  return availableColumns.value.filter(col => col.visible);
});

// 计算属性：验证过滤器是否有效
const isFilterValid = computed(() => {
  if (!filterOptions.value.smiles.trim()) return false;
  if (!filterOptions.value.similarity.trim()) return false;
  if (similarityError.value) return false;
  return true;
});

// 业务逻辑方法
const handleSave = () => {
  console.log('Save clicked');
  // 先获取最新的SMILES数据，然后显示确认对话框
  showSaveConfirmDialog.value = true;
};

const handleRefreshTable = async () => {
  await loadTableData(1, 10, selectedProject.value?.id);
};

const handleValidate = () => {
  console.log('Validate clicked');
  const isValid = validateForm();
  if (isValid) {
    alert('Validation passed!');
  } else {
    alert('Validation failed: ' + formErrors.value.join(', '));
  }
};

const handleCalculate = () => {
  console.log('Calculate clicked');
  // 这里添加计算逻辑
};

const handleReset = () => {
  resetForm();
  console.log('Parameters reset');
};

const handleImport = () => {
  console.log('Import clicked');
  // 这里添加导入逻辑
};

const handleExport = () => {
  console.log('Export clicked');
  // 这里添加导出逻辑
};

const handlePreview = () => {
  console.log('Preview clicked');
  // 这里添加预览逻辑
};

const handleSaveAll = async () => {
  console.log('Save All clicked');
  await saveData();
};

const handleClearAll = () => {
  handleReset();
  clearTable();
  clearMolecule();
  console.log('All data cleared');
};

// 项目管理相关的事件处理方法
const handleSelectProject = async (project: Project) => {
  console.log('Selected project:', project);
  
  // 如果没有当前选中的项目，直接选中并加载数据
  if (!selectedProject.value) {
    selectedProject.value = project;
    inputs.value.mainParameter = project.id;
    // 加载该项目的化合物数据
    await loadTableData(1, 10, project.id);
    return;
  }
  
  // 如果选择的是同一个项目，不需要确认
  if (selectedProject.value.id === project.id) {
    return;
  }
  
  // 需要切换项目，显示确认对话框
  pendingProject.value = project;
  showProjectSwitchDialog.value = true;
};

// 项目切换确认对话框相关方法
const closeSwitchDialog = () => {
  showProjectSwitchDialog.value = false;
  pendingProject.value = null;
};

const cancelSwitch = () => {
  console.log('Project switch cancelled');
  closeSwitchDialog();
};

const confirmSwitch = async () => {
  console.log('Project switch confirmed');
  if (pendingProject.value) {
    // 更新选中的项目
    selectedProject.value = pendingProject.value;
    inputs.value.mainParameter = pendingProject.value.id;
    console.log('Switched to project:', pendingProject.value);
    
    // 重新加载表格数据以显示新项目的化合物
    await loadTableData(1, 10, pendingProject.value.id);
  }
  closeSwitchDialog();
};

// 保存确认对话框相关方法
const closeSaveConfirmDialog = () => {
  showSaveConfirmDialog.value = false;
};

const confirmSaveCompound = async () => {
  console.log('Confirm save compound');
  saveLoading.value = true;
  
  try {
    // 先获取最新的SMILES数据
    await getSmilesAndSync();
    
    // 验证必要字段
    if (!inputs.value.compoundName.trim()) {
      alert('请输入化合物名称');
      return;
    }
    
    if (!inputs.value.compoundSmiles.trim()) {
      alert('请输入或绘制化合物的SMILES结构');
      return;
    }
    
    // 警告用户如果没有选择项目
    if (!selectedProject.value) {
      const proceed = confirm('没有选择项目，化合物将不会关联到任何项目。确定要继续保存吗？');
      if (!proceed) {
        return;
      }
    }
    
    // 准备化合物数据
    const compoundData = {
      name: inputs.value.compoundName.trim(),
      batch: inputs.value.compoundBatch ? parseInt(inputs.value.compoundBatch) : undefined,
      smiles: inputs.value.compoundSmiles.trim(),
      description: inputs.value.compoundNote.trim() || undefined,
      creator_id: 'current_user', // 这里应该从认证系统获取当前用户ID
      project_id: selectedProject.value?.id // 关联到当前选中的项目
    };
    
    console.log('Saving compound data:', compoundData);
    
    // 调用API保存化合物
    const savedCompound = await CompoundApiService.createCompound(compoundData);
    
    console.log('Compound saved successfully:', savedCompound);
    alert(`化合物 "${savedCompound.name}" 保存成功！\nID: ${savedCompound.id}`);
    
    // 关闭对话框
    closeSaveConfirmDialog();
    
    // 刷新表格数据以显示新保存的化合物（基于当前选中的项目）
    await loadTableData(1, 10, selectedProject.value?.id);
    
    // 可选：重置表单
    // resetForm();
    
  } catch (error) {
    console.error('Failed to save compound:', error);
    alert('保存化合物失败，请稍后重试。');
  } finally {
    saveLoading.value = false;
  }
};

const handleEditProject = (project: Project) => {
  console.log('Edit project:', project);
  // 不应该改变当前选中的项目，只是编辑项目信息
  alert(`编辑项目: ${project.name}\n功能待实现`);
};

const handleDeleteProject = async (project: Project) => {
  console.log('Delete project:', project);
  const confirmed = confirm(`确定要删除项目 "${project.name}" 吗？此操作不可撤销。`);
  if (confirmed) {
    const success = await deleteProject(project.id);
    if (success) {
      alert('项目删除成功');
    } else {
      alert('项目删除失败，请稍后重试');
    }
  }
};

const handleCreateProject = () => {
  console.log('Create new project');
  // 弹出创建项目的对话框
  const name = prompt('请输入项目名称:');
  if (name && name.trim()) {
    const description = prompt('请输入项目描述（可选）:');
    createNewProject(name.trim(), description?.trim());
  }
};

const createNewProject = async (name: string, description?: string) => {
  const newProject = await createProject({ name, description });
  if (newProject) {
    alert(`项目 "${newProject.name}" 创建成功`);
  } else {
    alert('项目创建失败，请稍后重试');
  }
};

// Filter Drawer相关方法
const openFilterDrawer = () => {
  showFilterDrawer.value = true;
};

const closeFilterDrawer = () => {
  showFilterDrawer.value = false;
};

const validateSimilarity = () => {
  const value = filterOptions.value.similarity;
  similarityError.value = '';
  
  if (!value.trim()) {
    return;
  }
  
  // 验证是否为有效数字
  const num = parseFloat(value);
  if (isNaN(num)) {
    similarityError.value = '请输入有效的数字';
    return;
  }
  
  // 验证范围
  if (num < 0 || num > 1) {
    similarityError.value = '相似度必须在0.0到1.0之间';
    return;
  }
  
  // 验证小数位数
  const decimalPlaces = (value.split('.')[1] || '').length;
  if (decimalPlaces > 1) {
    similarityError.value = '最多允许一位小数';
    return;
  }
};

const applyFilter = async () => {
  console.log('应用过滤器:', filterOptions.value);
  
  // 这里可以添加具体的过滤逻辑
  // 例如调用API进行SMILES相似度搜索
  
  try {
    // 示例：基于SMILES和相似度过滤化合物
    // 实际实现中需要调用后端API
    alert(`应用过滤器:\nSMILES: ${filterOptions.value.smiles}\n相似度阈值: ${filterOptions.value.similarity}`);
    
    // 关闭抽屉
    closeFilterDrawer();
    
    // 刷新表格数据（这里可以传递过滤参数）
    await loadTableData(1, 10, selectedProject.value?.id);
    
  } catch (error) {
    console.error('过滤失败:', error);
    alert('过滤操作失败，请稍后重试');
  }
};

const clearFilter = async () => {
  console.log('清除过滤器');
  
  // 重置过滤选项
  filterOptions.value.smiles = '';
  filterOptions.value.similarity = '';
  similarityError.value = '';
  
  // 重新加载所有数据
  await loadTableData(1, 10, selectedProject.value?.id);
  
  alert('过滤器已清除');
};

// Column Selector相关方法
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
    if (!column.required) {
      column.visible = true;
    }
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
  
  // 这里可以添加保存用户偏好设置到localStorage的逻辑
  const columnSettings = availableColumns.value.map(col => ({
    field: col.field,
    visible: col.visible
  }));
  
  try {
    localStorage.setItem('tableColumnSettings', JSON.stringify(columnSettings));
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
    const savedSettings = localStorage.getItem('tableColumnSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      settings.forEach((setting: { field: string; visible: boolean }) => {
        const column = availableColumns.value.find(col => col.field === setting.field);
        if (column) {
          column.visible = setting.visible;
        }
      });
      console.log('从localStorage加载列设置');
    }
  } catch (error) {
    console.error('加载列设置失败:', error);
  }
};

// SMILES 同步方法
const getSmilesAndSync = async () => {
  const smiles = await getSmiles();
  if (smiles) {
    inputs.value.compoundSmiles = smiles;
    console.log('SMILES synced to input field:', smiles);
  }
};

const setSmilesFromInput = async () => {
  console.log('setSmilesFromInput called');
  console.log('Ketcher ready:', ketcherReady.value);
  console.log('Ketcher frame ref:', !!ketcherFrame.value);
  
  const smiles = inputs.value.compoundSmiles.trim();
  console.log('SMILES from input:', smiles);
  
  if (smiles) {
    const success = await setMolecule(smiles);
    if (success) {
      console.log('SMILES set from input field:', smiles);
    } else {
      alert('Failed to set SMILES. Please check the console for details.');
    }
  } else {
    // 如果输入框为空，设置示例分子
    console.log('Input is empty, setting sample molecule');
    const success = await setSampleMolecule();
    if (success) {
      inputs.value.compoundSmiles = currentSmiles.value;
    }
  }
};

// Ketcher加载处理
const handleKetcherLoad = () => {
  console.log('Ketcher iframe load event triggered');
  
  // 使用nextTick确保Vue的ref已经更新
  nextTick(() => {
    if (ketcherFrame.value) {
      setKetcherFrame(ketcherFrame.value);
      console.log('Ketcher frame reference set:', ketcherFrame.value);
    } else {
      console.warn('ketcherFrame.value is null in handleKetcherLoad');
    }
    // 调用原始的onKetcherLoad方法
    onKetcherLoad();
  });
};

// 保存数据
const saveData = async () => {
  // 先获取最新的SMILES数据
  await getSmilesAndSync();
  
  const success = await saveFormData();
  if (success) {
    alert('Data saved successfully!');
  } else {
    alert('Failed to save data. Please check the form and try again.');
  }
};

// 初始化
const initialize = async () => {
  // 先加载列设置
  loadColumnSettings();
  
  // 并行加载所有必要的数据
  await Promise.all([
    loadMainParameterOptions(),
    loadProjectTableData(),
    loadProjects() // 先加载项目列表
  ]);
  
  // 自动选中第一个项目（如果有的话）并加载其化合物数据
  if (projects.value.length > 0 && !selectedProject.value) {
    await handleSelectProject(projects.value[0]);
  } else {
    // 如果没有项目，加载所有化合物数据
    await loadTableData();
  }
  
  console.log('Application initialized');
};

onMounted(() => {
  initialize();
});
</script>

<style scoped>
.data-input-page {
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

.top-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.left-block {
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.ketcher-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.ketcher-container h3 {
  margin: 0 0 1rem 0;
  color: var(--p-primary-color);
  font-size: 1.1rem;
  text-align: center;
}

.ketcher-frame {
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: #fff;
  min-height: 450px;
}

.ketcher-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.ketcher-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.control-btn {
  min-width: 80px;
  font-size: 0.875rem;
  height: 2rem;
}

/* SMILES输入容器 */
.smiles-input-container {
  flex: 2;
  min-width: 300px;
}

/* Set SMILES按钮容器 */
.smiles-set-button {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  min-width: 120px;
  padding-left: 1rem;
}

.set-smiles-btn {
  min-width: 100px;
  height: 2.5rem;
}

/* 备注输入容器 */
.note-input-container {
  width: 100%;
}

/* Compound Note 文本框样式 */
.compound-note-textarea {
  width: 100%;
  min-height: 100px;
  max-height: 200px;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  background-color: #ffffff;
  color: #495057;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #6c757d #f8f9fa;
}

.compound-note-textarea:focus {
  outline: 0;
  border-color: var(--p-primary-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.compound-note-textarea::placeholder {
  color: #6c757d;
  opacity: 1;
}

/* WebKit scrollbar styling */
.compound-note-textarea::-webkit-scrollbar {
  width: 8px;
}

.compound-note-textarea::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 4px;
}

.compound-note-textarea::-webkit-scrollbar-thumb {
  background: #6c757d;
  border-radius: 4px;
}

.compound-note-textarea::-webkit-scrollbar-thumb:hover {
  background: #495057;
}

.smiles-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.smiles-display label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.smiles-input {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  word-break: break-all;
}

.right-inputs {
  padding: 1rem;
}

.right-inputs h3 {
  margin-bottom: 1.5rem;
  color: var(--p-primary-color);
  font-size: 1.3rem;
}

.input-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.input-item {
  flex: 1;
  min-width: 200px;
}

.input-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.input-item .p-inputtext {
  width: 100%;
}

.row-btn {
  height: 2.5rem;
  min-width: 100px;
  font-size: 0.9rem;
}

/* 特定行的布局调整 */
.row-1 {
  align-items: flex-end;
}

.row-1 .input-item {
  flex: 2;
}

.row-2 {
  justify-content: space-between;
}

.row-2 .input-item {
  flex: 1;
  max-width: calc(50% - 0.5rem);
}

.row-3 {
  align-items: flex-end;
}

.row-4 {
  justify-content: center;
}

.row-5 {
  justify-content: center;
  flex-wrap: wrap;
}

.row-5 .row-btn {
  flex: 1;
  min-width: 120px;
  max-width: 150px;
}

.bottom-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header h3 {
  margin: 0;
  color: var(--p-primary-color);
  font-size: 1.3rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.column-btn,
.filter-btn {
  min-width: 100px;
  height: 2.5rem;
}

.bottom-section h3 {
  margin-bottom: 1.5rem;
  color: var(--p-primary-color);
  font-size: 1.3rem;
}

.table-container {
  margin-bottom: 2rem;
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.data-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.data-table .p-datatable-header {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.smiles-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  word-break: break-all;
  max-width: 200px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.smiles-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
}

.smiles-image {
  max-width: 120px;
  max-height: 60px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.clickable-image {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-image:hover {
  transform: scale(1.05);
  border-color: var(--p-primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.no-image {
  color: #666;
  font-style: italic;
  font-size: 0.8rem;
}

.attachments-cell {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 2.2rem;
  height: 2.2rem;
}

.edit-btn {
  color: var(--p-blue-500);
  border-color: var(--p-blue-500);
}

.edit-btn:hover {
  background: var(--p-blue-500);
  color: white;
}

.delete-btn:hover {
  background: var(--p-red-500);
  color: white;
}

.table-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.table-actions .action-btn {
  min-width: 140px;
  height: 2.5rem;
  width: auto;
}

/* 图片放大对话框样式 */
.image-dialog {
  max-width: 90vw;
  max-height: 90vh;
}

.image-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 500px;
}

.enlarged-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  min-height: 300px;
}

.enlarged-image {
  max-width: 100%;
  max-height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.detail-row label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
  font-size: 0.9rem;
}

.detail-value {
  flex: 1;
  color: #212529;
  font-size: 0.9rem;
  line-height: 1.4;
}

.smiles-code {
  font-family: 'Courier New', Courier, monospace;
  background: #ffffff;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  word-break: break-all;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.download-btn {
  min-width: 140px;
}

/* 项目管理对话框样式 */
.project-dialog {
  max-width: 600px;
}

.project-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 500px;
}

.project-modal-content h4 {
  margin: 0;
  color: var(--p-primary-color);
  font-size: 1.2rem;
  text-align: center;
}

.project-table {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

.project-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.project-cell {
  border: 1px solid #dee2e6;
  padding: 1rem;
  background: #f8f9fa;
}

.project-row:nth-child(even) .project-cell {
  background: #ffffff;
}

.cell-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cell-content label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.cell-content span {
  color: #212529;
  font-size: 1rem;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.project-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.edit-project-btn {
  min-width: 120px;
}

/* 项目切换确认对话框样式 */
.project-switch-dialog {
  max-width: 500px;
}

.switch-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 400px;
}

.warning-message {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  border-left: 4px solid #f39c12;
}

.warning-icon {
  color: #f39c12;
  font-size: 1.5rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.message-text {
  flex: 1;
}

.message-text h4 {
  margin: 0 0 0.75rem 0;
  color: #856404;
  font-size: 1.1rem;
  font-weight: 600;
}

.message-text p {
  margin: 0 0 0.5rem 0;
  color: #856404;
  font-size: 0.95rem;
  line-height: 1.4;
}

.message-text p:last-child {
  margin-bottom: 0;
}

.warning-text {
  font-weight: 500;
  color: #b8860b !important;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.dialog-actions button {
  min-width: 120px;
}

/* 保存确认对话框样式 */
.save-confirm-dialog {
  max-width: 600px;
}

.confirm-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 500px;
}

.confirmation-message {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.question-icon {
  color: #28a745;
  font-size: 1.5rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.message-text h4 {
  margin: 0 0 0.75rem 0;
  color: #155724;
  font-size: 1.1rem;
  font-weight: 600;
}

.message-text p {
  margin: 0 0 0.5rem 0;
  color: #155724;
  font-size: 0.95rem;
  line-height: 1.4;
}

.compound-summary {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  min-width: 120px;
}

.summary-row span {
  color: #212529;
  font-size: 0.9rem;
  flex: 1;
  text-align: right;
  word-break: break-word;
}

.smiles-value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem !important;
  background: #ffffff;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.confirm-text {
  font-weight: 500;
  color: #155724 !important;
  margin-top: 1rem !important;
}

/* Filter Drawer 样式 */
.filter-drawer {
  width: 400px;
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.filter-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.filter-input:focus {
  outline: 0;
  border-color: var(--p-primary-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.help-text {
  color: #6c757d;
  font-size: 0.8rem;
  font-style: italic;
  margin-top: 0.25rem;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.25rem;
  padding: 0.375rem 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.filter-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.apply-btn,
.clear-btn,
.close-btn {
  width: 100%;
  height: 2.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.apply-btn {
  order: 1;
}

.clear-btn {
  order: 2;
}

.close-btn {
  order: 3;
}

.apply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Help text styling */
.ketcher-help {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid var(--p-primary-color);
}

.help-text {
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.field-help {
  color: #6c757d;
  font-size: 0.75rem;
  font-style: italic;
  margin-top: 0.25rem;
  display: block;
}

/* 项目显示字段样式 */
.project-display {
  background-color: #f8f9fa !important;
  border: 1px solid #ced4da !important;
  color: #495057 !important;
  font-weight: 500;
  cursor: default;
}

.project-display:focus {
  border-color: var(--p-primary-color) !important;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
}

/* Column Dialog 样式 */
.column-dialog {
  max-width: 500px;
}

.column-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 450px;
  padding: 0.5rem;
}

.column-description {
  text-align: center;
  color: #495057;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.column-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 350px;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  scrollbar-width: thin;
  scrollbar-color: #6c757d #f8f9fa;
}

.column-options::-webkit-scrollbar {
  width: 8px;
}

.column-options::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 4px;
}

.column-options::-webkit-scrollbar-thumb {
  background: #6c757d;
  border-radius: 4px;
}

.column-option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.column-option:hover {
  background: #e9ecef;
  border-color: var(--p-primary-color);
}

.column-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  width: 100%;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
}

.column-checkbox input[type="checkbox"] {
  display: none;
}

.checkmark {
  position: relative;
  width: 20px;
  height: 20px;
  border: 2px solid #ced4da;
  border-radius: 4px;
  background: white;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.column-checkbox input[type="checkbox"]:checked + .checkmark {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
}

.column-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.column-checkbox input[type="checkbox"]:disabled + .checkmark {
  background: #e9ecef;
  border-color: #ced4da;
  cursor: not-allowed;
}

.column-checkbox:has(input[type="checkbox"]:disabled) {
  cursor: not-allowed;
  opacity: 0.7;
}

.column-label {
  flex: 1;
  font-weight: 500;
}

.required-badge {
  background: #ffc107;
  color: #212529;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.column-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.column-actions button {
  min-width: 100px;
  height: 2.5rem;
  font-size: 0.9rem;
}

.select-all-btn,
.reset-btn {
  flex: 1;
  max-width: 120px;
}

.apply-btn,
.cancel-btn {
  flex: 1;
  max-width: 100px;
}
</style>
