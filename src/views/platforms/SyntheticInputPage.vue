<template>
  <div class="synthetic-input-page">
    <div class="container">
      <h1 class="page-title">合成录入</h1>
      
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

        <!-- 状态汇总信息 -->
        <div v-if="statusSummary" class="status-summary">
          <div class="summary-item">
            <span class="summary-label">总计:</span>
            <span class="summary-value">{{ statusSummary.total }}</span>
          </div>
          <div class="summary-item status-not-started">
            <span class="summary-label">未合成:</span>
            <span class="summary-value">{{ statusSummary.not_started }}</span>
          </div>
          <div class="summary-item status-in-progress">
            <span class="summary-label">合成中:</span>
            <span class="summary-value">{{ statusSummary.in_progress }}</span>
          </div>
          <div class="summary-item status-completed">
            <span class="summary-label">已合成:</span>
            <span class="summary-value">{{ statusSummary.completed }}</span>
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
            v-model:expandedRows="expandedRows"
            dataKey="id"
          >
            <!-- 展开列 -->
            <Column :expander="true" headerStyle="width: 3rem" />
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

            <!-- 合成状态列 -->
            <Column 
              v-if="isColumnVisible('synthesis_status')"
              field="synthesis_status" 
              header="合成状态" 
              :style="getColumnStyle('synthesis_status')"
              :frozen="isColumnFrozen('synthesis_status')"
              :alignFrozen="getColumnAlign('synthesis_status')"
              sortable
            >
              <template #body="{ data }">
                <span class="synthesis-status-cell" :class="getSynthesisStatusClass(data.synthesis_status)">
                  {{ getSynthesisStatusLabel(data.synthesis_status) }}
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
                    v-if="data.synthesis_status !== 1"
                    icon="pi pi-play"
                    size="middle"
                    outlined
                    @click="startSynthesis(data)"
                    :disabled="data.synthesis_status === 0"
                    v-tooltip.top="data.synthesis_status === 0 ? '合成进行中' : '开始合成此化合物'"
                    class="action-btn start-synthesis-btn"
                  />

                </div>
              </template>
            </Column>

            <!-- 行展开模板 -->
            <template #expansion="slotProps">
              <div class="synthesis-expansion">
                <div class="expansion-header">
                  <h4>{{ slotProps.data.name }} - 合成记录</h4>
                  <div class="expansion-actions">
                    <Button 
                      label="添加合成记录" 
                      icon="pi pi-plus"
                      size="small"
                      @click="addSynthesisRecord(slotProps.data)"
                      class="add-synthesis-btn"
                    />
                    <Button 
                      label="刷新" 
                      icon="pi pi-refresh"
                      size="small"
                      severity="secondary"
                      @click="refreshSynthesisRecords(slotProps.data.id)"
                      :loading="synthesisLoading"
                      class="refresh-synthesis-btn"
                    />
                  </div>
                </div>
                
                <!-- 合成记录表格 -->
                <DataTable
                  :value="getSynthesisRecords(slotProps.data.id)"
                  :loading="synthesisLoading"
                  class="synthesis-table"
                  stripedRows
                  responsiveLayout="scroll"
                  :paginator="true"
                  :rows="5"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                  currentPageReportTemplate="显示 {first} 到 {last} 条记录，共 {totalRecords} 条"
                >
                  <!-- 批次列 -->
                  <Column field="batch" header="批次" sortable>
                    <template #body="{ data }">
                      <span class="batch-number">{{ data.batch || '-' }}</span>
                    </template>
                  </Column>

                  <!-- 单位列 -->
                  <Column field="unit" header="单位" sortable>
                    <template #body="{ data }">
                      <span class="unit-text">{{ data.unit || '-' }}</span>
                    </template>
                  </Column>

                  <!-- 数量列 -->
                  <Column field="quantity" header="数量" sortable>
                    <template #body="{ data }">
                      <span class="quantity-value">{{ formatQuantity(data.quantity || data.mass) }}</span>
                    </template>
                  </Column>

                  <!-- 创建时间列 -->
                  <Column field="create_time" header="创建时间" sortable>
                    <template #body="{ data }">
                      <span class="create-time">{{ formatDateTime(data.create_time) }}</span>
                    </template>
                  </Column>

                  <!-- 创建人列 -->
                  <Column field="creator_name" header="创建人">
                    <template #body="{ data }">
                      <span class="creator-name">{{ data.creator_name || data.creator_id || '-' }}</span>
                    </template>
                  </Column>

                  <!-- 操作列 -->
                  <Column header="操作" style="width: 120px">
                    <template #body="{ data }">
                      <div class="synthesis-actions">
                        <Button
                          icon="pi pi-pencil"
                          severity="info"
                          size="small"
                          @click="editSynthesisRecord(data)"
                          class="action-btn edit-btn"
                          v-tooltip.top="'编辑'"
                        />
                        <Button
                          icon="pi pi-trash"
                          severity="danger"
                          size="small"
                          @click="deleteSynthesisRecord(data)"
                          class="action-btn delete-btn"
                          v-tooltip.top="'删除'"
                        />
                      </div>
                    </template>
                  </Column>

                  <!-- 空数据模板 -->
                  <template #empty>
                    <div class="empty-synthesis">
                      <i class="pi pi-info-circle"></i>
                      <p>暂无合成记录</p>
                    </div>
                  </template>
                </DataTable>
              </div>
            </template>
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
            label="重置" 
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

    <!-- 合成记录编辑对话框 -->
    <Dialog
      v-model:visible="showSynthesisDialog"
      modal
      :header="synthesisDialogTitle"
      :style="{ width: '500px' }"
      class="synthesis-dialog"
    >
      <div class="synthesis-form">
        <div class="form-row">
          <label for="synthesis-batch">批次 *</label>
          <InputNumber
            id="synthesis-batch"
            v-model="currentSynthesis.batch"
            placeholder="请输入批次号"
            :useGrouping="false"
            class="form-input"
            @update:modelValue="onBatchChange"
          />
        </div>

        <div class="form-row">
          <label for="synthesis-name">合成名称</label>
          <InputText
            id="synthesis-name"
            v-model="currentSynthesis.synthetic_name"
            placeholder="将根据化合物名称和批次自动生成"
            class="form-input"
            readonly
          />
        </div>

        <div class="form-row">
          <label for="synthesis-unit">单位 *</label>
          <Dropdown
            id="synthesis-unit"
            v-model="currentSynthesis.unit"
            :options="unitOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="请选择单位"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <label for="synthesis-quantity">数量 *</label>
          <InputNumber
            id="synthesis-quantity"
            v-model="currentSynthesis.mass"
            placeholder="请输入数量"
            :minFractionDigits="0"
            :maxFractionDigits="4"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <label for="synthesis-description">描述</label>
          <Textarea
            id="synthesis-description"
            v-model="currentSynthesis.description"
            placeholder="请输入描述（可选）"
            rows="3"
            class="form-input"
          />
        </div>

        <div class="form-actions">
          <Button 
            label="取消" 
            severity="secondary" 
            @click="closeSynthesisDialog"
            class="cancel-btn"
          />
          <Button 
            label="保存" 
            @click="saveSynthesisRecord"
            :loading="saving"
            class="save-btn"
          />
        </div>
      </div>
    </Dialog>

    <!-- 开始合成确认对话框 -->
    <Dialog 
      v-model:visible="showStartSynthesisDialog" 
      header="确认开始合成"
      :modal="true" 
      :closable="true"
      :draggable="false"
      :resizable="false"
      class="start-synthesis-dialog"
      @hide="closeStartSynthesisDialog"
    >
      <div class="start-synthesis-content">
        <div class="confirmation-message">
          <i class="pi pi-question-circle question-icon"></i>
          <div class="message-text">
            <h4>确认开始合成</h4>
            <p v-if="currentCompoundForSynthesis">
              您确定要开始合成化合物 <strong>"{{ currentCompoundForSynthesis.name }}"</strong> 吗？
            </p>
            <p>开始合成后，该化合物的状态将变更为"合成中"。</p>
          </div>
        </div>
        
        <div class="dialog-actions">
          <Button 
            label="取消" 
            icon="pi pi-times" 
            severity="secondary"
            @click="closeStartSynthesisDialog"
            :disabled="startingSynthesis"
          />
          <Button 
            label="确认开始" 
            icon="pi pi-check" 
            @click="confirmStartSynthesis"
            :loading="startingSynthesis"
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
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';

// 导入自定义组件
import ProjectList from '@/components/ProjectList.vue';

// 导入自定义组合式函数
import { useTableData } from '@/composables/useTableData';
import { useProjectManagement } from '@/composables/useProjectManagement';
import type { Project } from '@/types/data';

// 导入合成记录API服务
import { SyntheticApiService, type SyntheticRecord, type SyntheticRecordCreate, type SyntheticRecordUpdate } from '@/services/syntheticApi';
import { CompoundApiService } from '@/services/compoundApi';

// 导入合成工具函数
import { generateSyntheticName } from '@/utils/syntheticUtils';

// 初始化toast
const toast = useToast();

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

// 行展开和合成记录相关状态
const expandedRows = ref<{ [key: string]: boolean }>({});
const synthesisRecords = ref<{ [compoundId: string]: SyntheticRecord[] }>({});
const synthesisLoading = ref(false);
const showSynthesisDialog = ref(false);
const currentSynthesis = ref<Partial<SyntheticRecord & SyntheticRecordCreate>>({
  compound_id: '',
  batch: 1,
  synthetic_name: '',  // 添加合成名称字段
  description: '',
  mass: 0,
  unit: 'mg',
  quantity: 0,
  creator_id: 'current_user' // 应该从用户状态获取
});
const saving = ref(false);

// 开始合成相关状态
const showStartSynthesisDialog = ref(false);
const startingSynthesis = ref(false);
const currentCompoundForSynthesis = ref<any>(null);

// 状态管理相关
const statusSummary = ref<any>(null);
const batchUpdateLoading = ref(false);

// 单位选项
const unitOptions = ref([
  { label: '毫克 (mg)', value: 'mg' },
  { label: '克 (g)', value: 'g' },
  { label: '千克 (kg)', value: 'kg' },
  { label: '毫升 (mL)', value: 'mL' },
  { label: '升 (L)', value: 'L' },
  { label: '摩尔 (mol)', value: 'mol' },
  { label: '毫摩尔 (mmol)', value: 'mmol' }
]);

// 计算属性：当前选中的项目对象
const currentProject = computed(() => {
  if (!selectedProject.value) return null;
  return projects.value.find(p => p.id === selectedProject.value) || null;
});

// 计算属性：合成记录对话框标题
const synthesisDialogTitle = computed(() => {
  return currentSynthesis.value.id ? '编辑合成记录' : '添加合成记录';
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
  { field: 'synthesis_status', header: '合成状态', style: 'min-width: 120px', visible: true, required: false },
  { field: 'description', header: '描述', style: 'min-width: 200px', visible: true, required: false },
  { field: 'create_time', header: '创建时间', style: 'min-width: 140px', visible: true, required: false },
  { field: 'action', header: '操作', style: 'min-width: 150px', visible: true, required: true }
]);

// 默认列配置
const defaultColumnSettings = [
  { field: 'name', visible: true },
  { field: 'smiles', visible: true },
  { field: 'synthetic_priority', visible: true },
  { field: 'synthesis_status', visible: true },
  { field: 'description', visible: true },
  { field: 'create_time', visible: true },
  { field: 'action', visible: true }
];

// 合成优先级选项
const syntheticPriorityOptions = [
  { label: '高 (High)', value: 3 },
  { label: '中 (Medium)', value: 2 },
  { label: '低 (Low)', value: 1 },
  { label: '不合成 (No Synthesis)', value: 0 }
];

// 合成状态选项
const synthesisStatusOptions = [
  { label: '未合成', value: -1 },
  { label: '合成中', value: 0 },
  { label: '已合成', value: 1 }
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

// 获取合成状态显示文本
const getSynthesisStatusLabel = (status: number | null | undefined) => {
  if (status === null || status === undefined) return '未合成';
  const option = synthesisStatusOptions.find(opt => opt.value === status);
  return option ? option.label : '未知状态';
};

// 获取合成状态样式类
const getSynthesisStatusClass = (status: number | null | undefined) => {
  switch (status) {
    case -1: return 'status-not-started';
    case 0: return 'status-in-progress';
    case 1: return 'status-completed';
    default: return 'status-unknown';
  }
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

// 格式化数量显示
const formatQuantity = (quantity: number | null | undefined) => {
  if (quantity === null || quantity === undefined) return '-';
  return quantity.toLocaleString();
};

// 合成记录相关方法
const getSynthesisRecords = (compoundId: string): SyntheticRecord[] => {
  return synthesisRecords.value[compoundId] || [];
};

const loadSynthesisRecords = async (compoundId: string) => {
  synthesisLoading.value = true;
  try {
    const response = await SyntheticApiService.getSyntheticsByCompound(compoundId, 1, 50);
    synthesisRecords.value[compoundId] = response.items;
    console.log(`加载化合物 ${compoundId} 的合成记录:`, response.items.length);
  } catch (error) {
    console.error('加载合成记录失败:', error);
    synthesisRecords.value[compoundId] = [];
  } finally {
    synthesisLoading.value = false;
  }
};

const refreshSynthesisRecords = async (compoundId: string) => {
  await loadSynthesisRecords(compoundId);
};

const addSynthesisRecord = (compound: any) => {
  currentSynthesis.value = {
    compound_id: compound.id,
    batch: 1,
    synthetic_name: generateSyntheticName(compound.name || '', 1),  // 自动生成合成名称
    description: '',
    mass: 0,
    unit: 'mg',
    quantity: 0,
    creator_id: 'current_user'
  };
  showSynthesisDialog.value = true;
};

const editSynthesisRecord = (record: SyntheticRecord) => {
  currentSynthesis.value = { ...record };
  showSynthesisDialog.value = true;
};

const deleteSynthesisRecord = async (record: SyntheticRecord) => {
  const confirmed = confirm(`确定要删除批次 "${record.batch}" 的合成记录吗？`);
  if (confirmed) {
    try {
      await SyntheticApiService.deleteSynthetic(record.id);
      
      // 从本地数据中删除
      const compoundRecords = synthesisRecords.value[record.compound_id];
      if (compoundRecords) {
        const index = compoundRecords.findIndex(r => r.id === record.id);
        if (index > -1) {
          compoundRecords.splice(index, 1);
        }
      }
      
      alert('合成记录删除成功');
    } catch (error) {
      console.error('删除合成记录失败:', error);
      alert('删除失败，请稍后重试');
    }
  }
};

// 批次变化时自动生成合成名称
const onBatchChange = () => {
  console.log('批次发生变化:', currentSynthesis.value.batch);
  console.log('当前化合物ID:', currentSynthesis.value.compound_id);
  
  if (currentSynthesis.value.batch && currentSynthesis.value.compound_id) {
    const compoundName = getCurrentCompoundName();
    console.log('获取到的化合物名称:', compoundName);
    
    if (compoundName) {
      const newSyntheticName = generateSyntheticName(compoundName, currentSynthesis.value.batch);
      console.log('生成的合成名称:', newSyntheticName);
      currentSynthesis.value.synthetic_name = newSyntheticName;
    }
  }
};

// 获取当前化合物名称
const getCurrentCompoundName = (): string => {
  if (!currentSynthesis.value.compound_id) return '';
  
  // 从当前表格数据中查找化合物名称
  const compound = tableData.value.find((item: any) => item.id === currentSynthesis.value.compound_id);
  return compound?.name || '';
};

const saveSynthesisRecord = async () => {
  // 验证表单
  if (!currentSynthesis.value.batch || !currentSynthesis.value.unit || !currentSynthesis.value.mass) {
    alert('请填写所有必填项');
    return;
  }

  saving.value = true;
  try {
    if (currentSynthesis.value.id) {
      // 更新现有记录
      const updateData: SyntheticRecordUpdate = {
        batch: currentSynthesis.value.batch,
        synthetic_name: currentSynthesis.value.synthetic_name,  // 添加合成名称字段
        description: currentSynthesis.value.description,
        mass: currentSynthesis.value.mass,
        unit: currentSynthesis.value.unit  // 添加单位字段
      };
      
      const updatedRecord = await SyntheticApiService.updateSynthetic(currentSynthesis.value.id, updateData);
      
      // 更新本地数据
      const compoundRecords = synthesisRecords.value[currentSynthesis.value.compound_id!];
      if (compoundRecords) {
        const index = compoundRecords.findIndex(r => r.id === currentSynthesis.value.id);
        if (index > -1) {
          compoundRecords[index] = updatedRecord;
        }
      }
    } else {
      // 添加新记录
      const createData: SyntheticRecordCreate = {
        compound_id: currentSynthesis.value.compound_id!,
        batch: currentSynthesis.value.batch!,
        synthetic_name: currentSynthesis.value.synthetic_name,  // 添加合成名称字段
        description: currentSynthesis.value.description,
        mass: currentSynthesis.value.mass!,
        unit: currentSynthesis.value.unit!,  // 添加单位字段
        creator_id: currentSynthesis.value.creator_id!
      };
      
      const newRecord = await SyntheticApiService.createSynthetic(createData);
      
      // 添加到本地数据
      const compoundId = currentSynthesis.value.compound_id!;
      if (!synthesisRecords.value[compoundId]) {
        synthesisRecords.value[compoundId] = [];
      }
      synthesisRecords.value[compoundId].unshift(newRecord);
    }
    
    closeSynthesisDialog();
    alert('合成记录保存成功');
  } catch (error) {
    console.error('保存合成记录失败:', error);
    alert('保存失败，请稍后重试');
  } finally {
    saving.value = false;
  }
};

const closeSynthesisDialog = () => {
  showSynthesisDialog.value = false;
  currentSynthesis.value = {
    compound_id: '',
    batch: 1,
    synthetic_name: '',  // 重置合成名称
    description: '',
    mass: 0,
    unit: 'mg',
    quantity: 0,
    creator_id: 'current_user'
  };
};

// 开始合成相关方法
const startSynthesis = (compound: any) => {
  // 检查合成状态
  const status = compound.synthesis_status !== undefined && compound.synthesis_status !== null ? compound.synthesis_status : -1;
  
  if (status === 1) { // 已合成
    toast.add({
      severity: 'warn',
      summary: '无法开始合成',
      detail: `化合物 "${compound.name}" 已经完成合成`,
      life: 3000
    });
    return;
  }
  
  if (status === 0) { // 合成中
    toast.add({
      severity: 'info',
      summary: '合成进行中',
      detail: `化合物 "${compound.name}" 正在合成中`,
      life: 3000
    });
    return;
  }
  
  // 只有未合成的化合物才能开始合成
  currentCompoundForSynthesis.value = compound;
  showStartSynthesisDialog.value = true;
};

const closeStartSynthesisDialog = () => {
  showStartSynthesisDialog.value = false;
  currentCompoundForSynthesis.value = null;
};

const confirmStartSynthesis = async () => {
  if (!currentCompoundForSynthesis.value) return;
  
  startingSynthesis.value = true;
  try {
    const result = await CompoundApiService.startSynthesis(currentCompoundForSynthesis.value.id);
    console.log('开始合成成功:', result);
    
    // 更新当前表格数据中的化合物状态
    const compoundIndex = tableData.value.findIndex((item: any) => item.id === currentCompoundForSynthesis.value.id);
    if (compoundIndex !== -1) {
      (tableData.value[compoundIndex] as any).synthesis_status = 0; // 合成中
    }
    
    // 显示成功提示
    toast.add({
      severity: 'success',
      summary: '开始合成成功',
      detail: `化合物 "${currentCompoundForSynthesis.value.name}" 已开始合成！`,
      life: 3000
    });
    
    closeStartSynthesisDialog();
    
    // 刷新状态汇总
    await loadStatusSummary();
    
  } catch (error: any) {
    console.error('开始合成失败:', error);
    
    // 根据错误类型显示不同的提示
    let errorMessage = '开始合成失败，请稍后重试';
    
    if (error.response?.status === 400) {
      const detail = error.response?.data?.detail;
      if (detail?.includes('already synthesized')) {
        errorMessage = '该化合物已经完成合成，无需重复操作';
      } else if (detail?.includes('already in progress')) {
        errorMessage = '该化合物正在合成中，请等待完成';
      } else {
        errorMessage = detail || '操作无效，请检查化合物状态';
      }
    } else if (error.response?.status === 404) {
      errorMessage = '化合物不存在';
    }
    
    toast.add({
      severity: 'error',
      summary: '开始合成失败',
      detail: errorMessage,
      life: 5000
    });
  } finally {
    startingSynthesis.value = false;
  }
};

// 事件处理方法
const handleProjectChange = async () => {
  console.log('Project changed to:', selectedProject.value);
  if (selectedProject.value) {
    await loadTableData(1, pageSize.value, selectedProject.value, false); // 不包含不合成的化合物
    await loadStatusSummary(); // 加载状态汇总
  } else {
    // 如果没有选择项目，清空表格数据
    statusSummary.value = null;
    tableData.value = [];
    total.value = 0;
  }
};

const handleRefreshTable = async () => {
  if (selectedProject.value) {
    await loadTableData(currentPage.value, pageSize.value, selectedProject.value, false); // 不包含不合成的化合物
    await loadStatusSummary(); // 同时刷新状态汇总
  }
};

// 加载状态汇总
const loadStatusSummary = async () => {
  try {
    if (selectedProject.value) {
      statusSummary.value = await CompoundApiService.getSynthesisStatusSummary(selectedProject.value);
    }
  } catch (error) {
    console.error('加载状态汇总失败:', error);
  }
};

const onPageChange = async (event: any) => {
  const page = event.page + 1; // PrimeVue 的页码从0开始
  const size = event.rows;
  await loadTableData(page, size, selectedProject.value || undefined, false); // 不包含不合成的化合物
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
    await loadStatusSummary(); // 加载状态汇总
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

// 监听行展开事件，自动加载合成记录
watch(expandedRows, (newExpanded, oldExpanded) => {
  // 找出新展开的行
  Object.keys(newExpanded).forEach(compoundId => {
    if (newExpanded[compoundId] && (!oldExpanded || !oldExpanded[compoundId])) {
      // 如果还没有加载过这个化合物的合成记录，则加载
      if (!synthesisRecords.value[compoundId]) {
        loadSynthesisRecords(compoundId);
      }
    }
  });
}, { deep: true });

// 监听合成记录批次变化，自动更新合成名称
watch(() => currentSynthesis.value.batch, (newBatch) => {
  console.log('监听到批次变化:', newBatch);
  if (newBatch && currentSynthesis.value.compound_id) {
    const compoundName = getCurrentCompoundName();
    if (compoundName) {
      const newSyntheticName = generateSyntheticName(compoundName, newBatch);
      console.log('通过 watch 生成的合成名称:', newSyntheticName);
      currentSynthesis.value.synthetic_name = newSyntheticName;
    }
  }
});

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

/* 状态汇总样式 */
.status-summary {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.summary-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #495057;
}

.status-not-started .summary-value {
  color: #dc3545; /* 红色 - 未合成 */
}

.status-in-progress .summary-value {
  color: #fd7e14; /* 橙色 - 合成中 */
}

.status-completed .summary-value {
  color: #198754; /* 绿色 - 已合成 */
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
  max-width: 180px;
  max-height: 120px;
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
  width: 180px;
  height: 120px;
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

/* 合成状态样式 */
.synthesis-status-cell {
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  text-align: center;
  display: inline-block;
  min-width: 80px;
}

.status-not-started {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.status-in-progress {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-completed {
  background-color: #d1edff;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status-unknown {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
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

/* 合成记录展开区域样式 */
.synthesis-expansion {
  padding: 1rem;
  background-color: #f8f9fa;
  border-left: 4px solid var(--p-primary-color);
}

.expansion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.expansion-header h4 {
  margin: 0;
  color: var(--p-primary-color);
  font-size: 1.1rem;
}

.expansion-actions {
  display: flex;
  gap: 0.5rem;
}

.add-synthesis-btn,
.refresh-synthesis-btn {
  min-width: 120px;
}

/* 合成记录表格样式 */
.synthesis-table {
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
}

.synthesis-table :deep(.p-datatable-header) {
  background-color: #e9ecef;
  padding: 0.75rem;
}

.batch-number {
  font-weight: 500;
  color: #495057;
}

.unit-text {
  padding: 0.25rem 0.5rem;
  background-color: #e3f2fd;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #1976d2;
}

.quantity-value {
  font-weight: 500;
  color: #2e7d32;
}

.creator-name {
  color: #666;
}

.synthesis-actions {
  display: flex;
  gap: 0.25rem;
}

.empty-synthesis {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-synthesis i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #ccc;
}

/* 合成记录对话框样式 */
.synthesis-dialog :deep(.p-dialog-content) {
  padding: 1.5rem;
}

.synthesis-form {
  min-width: 400px;
}

.form-row {
  margin-bottom: 1.5rem;
}

.form-row label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.cancel-btn,
.save-btn {
  min-width: 80px;
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

  /* 合成记录展开区域响应式 */
  .expansion-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .expansion-actions {
    justify-content: center;
  }
  
  .synthesis-form {
    min-width: auto;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}

/* 开始合成按钮样式 */
.start-synthesis-btn {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
  color: white !important;
}

.start-synthesis-btn:hover {
  background-color: #218838 !important;
  border-color: #218838 !important;
}

.start-synthesis-btn:disabled {
  background-color: #6c757d !important;
  border-color: #6c757d !important;
  color: white !important;
  opacity: 0.6;
}

/* 开始合成确认对话框样式 */
.start-synthesis-dialog :deep(.p-dialog-content) {
  padding: 0;
}

.start-synthesis-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 400px;
}

.start-synthesis-content .confirmation-message {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.start-synthesis-content .question-icon {
  color: #28a745;
  font-size: 1.5rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.start-synthesis-content .message-text h4 {
  margin: 0 0 0.75rem 0;
  color: #155724;
  font-size: 1.1rem;
  font-weight: 600;
}

.start-synthesis-content .message-text p {
  margin: 0 0 0.5rem 0;
  color: #155724;
  font-size: 0.95rem;
  line-height: 1.4;
}

.start-synthesis-content .dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0 1rem 1rem;
}
</style>
