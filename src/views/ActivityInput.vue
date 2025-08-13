<template>
  <div class="activity-input-container">
    <div class="page-header">
      <h1>活性录入平台</h1>
      <p>录入和管理化合物活性数据</p>
    </div>

    <div class="content-wrapper">
      <!-- 项目选择器 -->
      <div class="project-selector">
        <label>选择项目:</label>
        <Dropdown
          v-model="selectedProject"
          :options="projects"
          option-label="name"
          option-value="id"
          placeholder="请选择项目"
          class="project-dropdown"
          @change="onProjectChange"
        />
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content" v-if="selectedProject">
        <!-- 分子式图片区域 -->
        <div class="molecule-section">
          <div class="molecule-image-container">
            <img 
              v-if="currentSmiles && moleculeImageUrl" 
              :src="moleculeImageUrl" 
              alt="分子式"
              class="molecule-image"
            />
            <div v-else class="molecule-placeholder">
              <i class="pi pi-image"></i>
              <p>请选择化合物查看分子式</p>
            </div>
          </div>
        </div>

        <!-- 表单区域 -->
        <div class="form-section">
          <form @submit.prevent="submitActivity" class="activity-form">
            <div class="form-grid">
              <!-- 化合物ID -->
              <div class="form-group">
                <label for="compound">化合物名称*</label>
                <Dropdown
                  id="compound"
                  v-model="formData.compound_id"
                  :options="compounds"
                  option-label="name"
                  option-value="id"
                  placeholder="请选择化合物"
                  class="form-input"
                  @change="onCompoundChange"
                  :class="{ 'p-invalid': errors.compound_id }"
                />
                <small v-if="errors.compound_id" class="p-error">{{ errors.compound_id }}</small>
              </div>

              <!-- 合成名称 -->
              <div class="form-group">
                <label for="synthetic">合成名称</label>
                <Dropdown
                  id="synthetic"
                  v-model="formData.synthetic_name"
                  :options="synthetics"
                  option-label="synthetic_name"
                  option-value="synthetic_name"
                  placeholder="请选择合成名称"
                  class="form-input"
                />
              </div>

              <!-- 检测方法ID -->
              <div class="form-group">
                <label for="assay">检测方法ID *</label>
                <Dropdown
                  id="assay"
                  v-model="formData.assay_id"
                  :options="assays"
                  option-label="name"
                  option-value="id"
                  placeholder="请选择检测方法"
                  class="form-input"
                  :class="{ 'p-invalid': errors.assay_id }"
                />
                <small v-if="errors.assay_id" class="p-error">{{ errors.assay_id }}</small>
              </div>

              <!-- 活性类型 -->
              <div class="form-group">
                <label for="activity-type">活性类型 *</label>
                <Dropdown
                  id="activity-type"
                  v-model="formData.activity_type"
                  :options="activityTypes"
                  option-label="label"
                  option-value="value"
                  placeholder="请选择活性类型"
                  class="form-input"
                  :class="{ 'p-invalid': errors.activity_type }"
                />
                <small v-if="errors.activity_type" class="p-error">{{ errors.activity_type }}</small>
              </div>

              <!-- 活性关系 -->
              <div class="form-group">
                <label for="activity-relation">活性关系 *</label>
                <Dropdown
                  id="activity-relation"
                  v-model="formData.activity_relation"
                  :options="activityRelations"
                  option-label="label"
                  option-value="value"
                  placeholder="请选择活性关系"
                  class="form-input"
                  :class="{ 'p-invalid': errors.activity_relation }"
                />
                <small v-if="errors.activity_relation" class="p-error">{{ errors.activity_relation }}</small>
              </div>

              <!-- 活性单位 -->
              <div class="form-group">
                <label for="activity-unit">活性单位 *</label>
                <Dropdown
                  id="activity-unit"
                  v-model="formData.activity_unit"
                  :options="activityUnits"
                  option-label="label"
                  option-value="value"
                  placeholder="请选择活性单位"
                  class="form-input"
                  :class="{ 'p-invalid': errors.activity_unit }"
                />
                <small v-if="errors.activity_unit" class="p-error">{{ errors.activity_unit }}</small>
              </div>

              <!-- 活性值 -->
              <div class="form-group">
                <label for="activity-value">活性值 *</label>
                <InputNumber
                  id="activity-value"
                  v-model="formData.activity_value"
                  placeholder="请输入活性值"
                  class="form-input"
                  :class="{ 'p-invalid': errors.activity_value }"
                  :min-fraction-digits="0"
                  :max-fraction-digits="6"
                />
                <small v-if="errors.activity_value" class="p-error">{{ errors.activity_value }}</small>
              </div>

              <!-- 批次 -->
              <div class="form-group">
                <label for="batch">批次</label>
                <InputNumber
                  id="batch"
                  v-model="formData.batch"
                  placeholder="请输入批次"
                  class="form-input"
                  :use-grouping="false"
                  :min-fraction-digits="0"
                  :max-fraction-digits="0"
                />
              </div>

              <!-- 参考活性ID -->
              <div class="form-group">
                <label for="ref-activity">参考活性ID</label>
                <Dropdown
                  id="ref-activity"
                  v-model="formData.ref_activity_id"
                  :options="referenceActivities"
                  option-label="displayName"
                  option-value="id"
                  placeholder="请选择参考活性"
                  class="form-input"
                />
              </div>

              <!-- 备注 -->
              <div class="form-group form-group-full">
                <label for="note">备注</label>
                <Textarea
                  id="note"
                  v-model="formData.note"
                  placeholder="请输入备注信息"
                  class="form-input"
                  rows="3"
                />
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <Button
                type="submit"
                label="保存活性数据"
                icon="pi pi-save"
                class="submit-button"
                :loading="isSubmitting"
              />
              <Button
                type="button"
                label="重置表单"
                icon="pi pi-refresh"
                severity="secondary"
                class="reset-button"
                @click="resetForm"
              />
            </div>
          </form>
        </div>
      </div>

      <!-- 未选择项目时的提示 -->
      <div v-else class="no-project-selected">
        <i class="pi pi-info-circle"></i>
        <p>请先选择一个项目以开始录入活性数据</p>
      </div>
    </div>

    <!-- 活性列表区域 -->
    <div v-if="selectedProject" class="activity-list-section">
      <div class="section-header">
        <h2>当前项目活性列表</h2>
        <div class="header-actions">
          <Button 
            icon="pi pi-refresh"
            label="刷新"
            class="refresh-btn"
            @click="refreshActivityList"
            :loading="activityLoading"
          />
          <Button 
            icon="pi pi-cog"
            label="列设置"
            severity="secondary"
            class="column-btn"
            @click="openActivityColumnSelector"
          />
        </div>
      </div>

      <!-- 活性数据表格 -->
      <div class="activity-table-container">
        <DataTable
          :value="activityTableData"
          :loading="activityLoading"
          :scrollable="true"
          scrollHeight="400px"
          :paginator="true"
          :rows="activityPageSize"
          :totalRecords="activityTotal"
          :lazy="true"
          @page="onActivityPageChange"
          dataKey="id"
          class="activity-table"
        >
          

          <!-- 合成名称列 -->
          <Column 
            v-if="isActivityColumnVisible('synthetic_name')"
            field="synthetic_name" 
            header="合成名称"
            :style="getActivityColumnStyle('synthetic_name')"
          >
            <template #body="{ data }">
              <span class="synthetic-name">{{ data.synthetic_name || '-' }}</span>
            </template>
          </Column>

          <!-- 检测方法列 -->
          <Column 
            v-if="isActivityColumnVisible('assay_name')"
            field="assay_name" 
            header="检测方法"
            :style="getActivityColumnStyle('assay_name')"
          >
            <template #body="{ data }">
              <span class="assay-name">{{ data.assay_name || '-' }}</span>
            </template>
          </Column>

          <!-- 活性类型列 -->
          <Column 
            v-if="isActivityColumnVisible('activity_type')"
            field="activity_type" 
            header="活性类型"
            :style="getActivityColumnStyle('activity_type')"
          >
            <template #body="{ data }">
              <span class="activity-type">{{ data.activity_type || '-' }}</span>
            </template>
          </Column>

          <!-- 活性关系列 -->
          <Column 
            v-if="isActivityColumnVisible('activity_relation')"
            field="activity_relation" 
            header="关系"
            :style="getActivityColumnStyle('activity_relation')"
          >
            <template #body="{ data }">
              <span class="activity-relation">{{ data.activity_relation || '-' }}</span>
            </template>
          </Column>

          <!-- 活性值列 -->
          <Column 
            v-if="isActivityColumnVisible('activity_value')"
            field="activity_value" 
            header="活性值"
            :style="getActivityColumnStyle('activity_value')"
          >
            <template #body="{ data }">
              <span class="activity-value">
                {{ formatActivityValue(data.activity_value) }}
              </span>
            </template>
          </Column>

          <!-- 活性单位列 -->
          <Column 
            v-if="isActivityColumnVisible('activity_unit')"
            field="activity_unit" 
            header="单位"
            :style="getActivityColumnStyle('activity_unit')"
          >
            <template #body="{ data }">
              <span class="activity-unit">{{ data.activity_unit || '-' }}</span>
            </template>
          </Column>

          <!-- 批次列 -->
          <Column 
            v-if="isActivityColumnVisible('batch')"
            field="batch" 
            header="批次"
            :style="getActivityColumnStyle('batch')"
          >
            <template #body="{ data }">
              <span class="batch-info">{{ data.batch || '-' }}</span>
            </template>
          </Column>

          <!-- 备注列 -->
          <Column 
            v-if="isActivityColumnVisible('note')"
            field="note" 
            header="备注"
            :style="getActivityColumnStyle('note')"
          >
            <template #body="{ data }">
              <span 
                class="note-text" 
                :title="data.note"
              >
                {{ data.note || '-' }}
              </span>
            </template>
          </Column>

          <!-- 创建时间列 -->
          <Column 
            v-if="isActivityColumnVisible('create_time')"
            field="create_time" 
            header="创建时间"
            :style="getActivityColumnStyle('create_time')"
          >
            <template #body="{ data }">
              <span class="create-time">{{ formatDateTime(data.create_time) }}</span>
            </template>
          </Column>

          <!-- 操作列 -->
          <Column 
            v-if="isActivityColumnVisible('action')"
            header="操作" 
            :style="getActivityColumnStyle('action')"
            :frozen="isActivityColumnFrozen('action')"
            :alignFrozen="getActivityColumnAlign('action')"
          >
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  class="action-btn edit-btn"
                  @click="editActivity(data)"
                  v-tooltip.top="'编辑'"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  class="action-btn delete-btn"
                  @click="deleteActivity(data)"
                  v-tooltip.top="'删除'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- 活性列设置对话框 -->
    <Dialog
      v-model:visible="showActivityColumnDialog"
      modal
      header="活性列表列设置"
      :style="{ width: '500px' }"
      class="column-dialog"
    >
      <div class="column-content">
        <p class="column-description">选择要显示的列:</p>
        
        <div class="column-options">
          <div
            v-for="column in availableActivityColumns"
            :key="column.field"
            class="column-option"
            :class="{ 'disabled': column.required }"
          >
            <label class="column-checkbox">
              <input 
                type="checkbox" 
                :checked="column.visible"
                :disabled="column.required"
                @change="toggleActivityColumn(column.field)"
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
            class="select-all-btn"
            @click="selectAllActivityColumns"
          />
          <Button 
            label="重置"
            severity="secondary"
            class="reset-btn"
            @click="resetActivityColumnsToDefault"
          />
          <Button 
            label="应用"
            class="apply-btn"
            @click="applyActivityColumnChanges"
          />
          <Button 
            label="取消"
            severity="secondary"
            class="cancel-btn"
            @click="closeActivityColumnDialog"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';

import { activityApi } from '@/services/activityApi';
import { assayApi } from '@/services/assayApi';
import { projectApi } from '@/services/projectApi';
import { compoundApi } from '@/services/compoundApi';
import { syntheticApi } from '@/services/syntheticApi';
import { API_CONFIG } from '@/services/apiConfig';
import type { 
  ActivityCreate, 
  Project, 
  Assay,
  Compound,
  Synthetic,
  Activity
} from '@/types';

const toast = useToast();

// 响应式数据
const selectedProject = ref<string>('');
const projects = ref<Project[]>([]);
const compounds = ref<Compound[]>([]);
const synthetics = ref<Synthetic[]>([]);
const assays = ref<Assay[]>([]);
const referenceActivities = ref<any[]>([]);
const isSubmitting = ref(false);
const currentSmiles = ref<string>('');

// 活性列表相关数据
const activityTableData = ref<Activity[]>([]);
const activityLoading = ref(false);
const activityTotal = ref(0);
const activityCurrentPage = ref(1);
const activityPageSize = ref(20);
const showActivityColumnDialog = ref(false);

// 表单数据
const formData = ref<ActivityCreate>({
  compound_id: '',
  project_id: '',
  synthetic_name: '',
  assay_id: '',
  activity_type: 'IC50',
  activity_relation: '=',
  activity_unit: 'nM',
  activity_value: 0,
  batch: undefined,
  ref_activity_id: '',
  note: ''
});

// 错误信息
const errors = ref<Record<string, string>>({});

// 选项数据
const activityTypes = ref([
  { label: 'Ki', value: 'Ki' },
  { label: 'IC50', value: 'IC50' },
  { label: 'EC50', value: 'EC50' }
]);

const activityRelations = ref([
  { label: '大于 (>)', value: '>' },
  { label: '小于 (<)', value: '<' },
  { label: '等于 (=)', value: '=' }
]);

const activityUnits = ref([
  { label: 'nM', value: 'nM' },
  { label: 'μM', value: 'μM' },
  { label: 'mM', value: 'mM' },
  { label: 'pM', value: 'pM' },
  { label: 'mg/mL', value: 'mg/mL' },
  { label: 'μg/mL', value: 'μg/mL' }
]);

// 活性列表列配置
interface ActivityColumnConfig {
  field: string;
  header: string;
  style: string;
  visible: boolean;
  required: boolean;
  frozen?: boolean;
  alignFrozen?: string;
}

const availableActivityColumns = ref<ActivityColumnConfig[]>([
  { field: 'compound_name', header: '化合物名称', style: 'min-width: 150px', visible: true, required: true },
  { field: 'synthetic_name', header: '合成名称', style: 'min-width: 150px', visible: true, required: false },
  { field: 'assay_name', header: '检测方法', style: 'min-width: 120px', visible: true, required: false },
  { field: 'activity_type', header: '活性类型', style: 'min-width: 100px', visible: true, required: false },
  { field: 'activity_relation', header: '关系', style: 'min-width: 60px', visible: true, required: false },
  { field: 'activity_value', header: '活性值', style: 'min-width: 100px', visible: true, required: true },
  { field: 'activity_unit', header: '单位', style: 'min-width: 80px', visible: true, required: false },
  { field: 'batch', header: '批次', style: 'min-width: 100px', visible: true, required: false },
  { field: 'note', header: '备注', style: 'min-width: 150px', visible: true, required: false },
  { field: 'create_time', header: '创建时间', style: 'min-width: 140px', visible: true, required: false },
  { field: 'action', header: '操作', style: 'min-width: 120px', visible: true, required: true, frozen: true, alignFrozen: 'right' }
]);

// 默认活性列设置
const defaultActivityColumnSettings = [
  { field: 'compound_name', visible: true },
  { field: 'synthetic_name', visible: true },
  { field: 'assay_name', visible: true },
  { field: 'activity_type', visible: true },
  { field: 'activity_relation', visible: true },
  { field: 'activity_value', visible: true },
  { field: 'activity_unit', visible: true },
  { field: 'batch', visible: true },
  { field: 'note', visible: false },
  { field: 'create_time', visible: false },
  { field: 'action', visible: true }
];

// 计算分子式图片URL
const moleculeImageUrl = computed(() => {
  if (!currentSmiles.value) return '';
  return `${API_CONFIG.BASE_URL}/smiles/smiles2img?smiles=${encodeURIComponent(currentSmiles.value)}`;
});

// 页面加载时获取数据
onMounted(async () => {
  // 加载活性列设置
  loadActivityColumnSettings();
  
  await loadProjects();
  await loadAssays();
});

// 监听项目变化
watch(selectedProject, (newProject) => {
  if (newProject) {
    formData.value.project_id = newProject;
    loadCompoundsByProject(newProject);
    // 加载当前项目的活性列表
    loadActivityList(1, activityPageSize.value);
  } else {
    // 清空活性列表
    activityTableData.value = [];
    activityTotal.value = 0;
  }
});

// 加载项目列表
const loadProjects = async () => {
  try {
    const response = await projectApi.getList({ size: 100 });
    projects.value = response.items || [];
  } catch (error) {
    console.error('Failed to load projects:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '加载项目列表失败',
      life: 3000
    });
  }
};

// 加载检测方法列表
const loadAssays = async () => {
  try {
    const response = await assayApi.getList({ size: 100 });
    assays.value = response.items || [];
  } catch (error) {
    console.error('Failed to load assays:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '加载检测方法列表失败',
      life: 3000
    });
  }
};

// 根据项目加载化合物
const loadCompoundsByProject = async (projectId: string) => {
  try {
    const response = await compoundApi.getList({ 
      project_id: projectId,
      size: 100 
    });
    compounds.value = response.items || [];
  } catch (error) {
    console.error('Failed to load compounds:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '加载化合物列表失败',
      life: 3000
    });
  }
};

// 根据化合物加载合成记录
const loadSyntheticsByCompound = async (compoundId: string) => {
  try {
    const response = await syntheticApi.getByCompound(compoundId, { size: 100 });
    synthetics.value = (response.items || []).filter((syn: any) => syn.synthetic_name);
  } catch (error) {
    console.error('Failed to load synthetics:', error);
    synthetics.value = [];
  }
};

// 项目变化处理
const onProjectChange = () => {
  // 重置相关字段
  formData.value.compound_id = '';
  formData.value.synthetic_name = '';
  currentSmiles.value = '';
  synthetics.value = [];
};

// 化合物变化处理
const onCompoundChange = () => {
  const selectedCompound = compounds.value.find(c => c.id === formData.value.compound_id);
  if (selectedCompound) {
    currentSmiles.value = selectedCompound.smiles || '';
    loadSyntheticsByCompound(selectedCompound.id);
  }
  // 重置合成名称
  formData.value.synthetic_name = '';
};

// 表单验证
const validateForm = (): boolean => {
  errors.value = {};
  
  if (!formData.value.compound_id) {
    errors.value.compound_id = '请选择化合物';
  }
  
  if (!formData.value.assay_id) {
    errors.value.assay_id = '请选择检测方法';
  }
  
  if (!formData.value.activity_type) {
    errors.value.activity_type = '请选择活性类型';
  }
  
  if (!formData.value.activity_relation) {
    errors.value.activity_relation = '请选择活性关系';
  }
  
  if (!formData.value.activity_unit) {
    errors.value.activity_unit = '请选择活性单位';
  }
  
  if (formData.value.activity_value === null || formData.value.activity_value === undefined) {
    errors.value.activity_value = '请输入活性值';
  }
  
  return Object.keys(errors.value).length === 0;
};

// 提交表单
const submitActivity = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'warn',
      summary: '验证失败',
      detail: '请检查表单中的错误信息',
      life: 3000
    });
    return;
  }

  isSubmitting.value = true;
  
  try {
    await activityApi.create(formData.value);
    
    toast.add({
      severity: 'success',
      summary: '成功',
      detail: '活性数据保存成功',
      life: 3000
    });
    
    resetForm();
    
    // 刷新活性列表
    if (selectedProject.value) {
      await refreshActivityList();
    }
  } catch (error) {
    console.error('Failed to save activity:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '保存活性数据失败',
      life: 3000
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 重置表单
const resetForm = () => {
  formData.value = {
    compound_id: '',
    project_id: selectedProject.value,
    synthetic_name: '',
    assay_id: '',
    activity_type: 'IC50',
    activity_relation: '=',
    activity_unit: 'nM',
    activity_value: 0,
    batch: undefined,
    ref_activity_id: '',
    note: ''
  };
  errors.value = {};
  currentSmiles.value = '';
  synthetics.value = [];
};

// 活性列表相关辅助方法
const isActivityColumnVisible = (field: string) => {
  const column = availableActivityColumns.value.find(col => col.field === field);
  return column ? column.visible : false;
};

const getActivityColumnStyle = (field: string) => {
  const column = availableActivityColumns.value.find(col => col.field === field);
  return column ? column.style : '';
};

const isActivityColumnFrozen = (field: string) => {
  const column = availableActivityColumns.value.find(col => col.field === field);
  return column ? column.frozen : false;
};

const getActivityColumnAlign = (field: string) => {
  const column = availableActivityColumns.value.find(col => col.field === field);
  return column ? column.alignFrozen : undefined;
};

// 格式化活性值
const formatActivityValue = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString();
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

// 加载当前项目的活性列表
const loadActivityList = async (page: number = 1, size: number = 20) => {
  if (!selectedProject.value) return;
  
  activityLoading.value = true;
  try {
    const response = await activityApi.getByProject(selectedProject.value, { page, size });
    activityTableData.value = response.items || [];
    activityTotal.value = response.total || 0;
    activityCurrentPage.value = page;
    console.log(`加载项目 ${selectedProject.value} 的活性数据:`, response.items?.length || 0);
  } catch (error) {
    console.error('加载活性列表失败:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '加载活性列表失败',
      life: 3000
    });
    activityTableData.value = [];
    activityTotal.value = 0;
  } finally {
    activityLoading.value = false;
  }
};

// 刷新活性列表
const refreshActivityList = async () => {
  await loadActivityList(activityCurrentPage.value, activityPageSize.value);
};

// 活性列表分页事件处理
const onActivityPageChange = async (event: any) => {
  const page = event.page + 1; // PrimeVue 的页码从0开始
  const size = event.rows;
  await loadActivityList(page, size);
};

// 编辑活性记录
const editActivity = (activity: Activity) => {
  console.log('编辑活性记录:', activity);
  toast.add({
    severity: 'info',
    summary: '提示',
    detail: '编辑活性功能待实现',
    life: 3000
  });
};

// 删除活性记录
const deleteActivity = async (activity: Activity) => {
  const confirmed = confirm(`确定要删除这条活性记录吗？\n化合物: ${activity.compound_id}\n活性类型: ${activity.activity_type}\n活性值: ${activity.activity_value} ${activity.activity_unit}`);
  if (confirmed) {
    try {
      await activityApi.delete(activity.id!);
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '活性记录删除成功',
        life: 3000
      });
      // 刷新列表
      await refreshActivityList();
    } catch (error) {
      console.error('删除活性记录失败:', error);
      toast.add({
        severity: 'error',
        summary: '错误',
        detail: '删除活性记录失败',
        life: 3000
      });
    }
  }
};

// 打开活性列设置对话框
const openActivityColumnSelector = () => {
  showActivityColumnDialog.value = true;
};

// 关闭活性列设置对话框
const closeActivityColumnDialog = () => {
  showActivityColumnDialog.value = false;
};

// 切换活性列显示状态
const toggleActivityColumn = (field: string) => {
  const column = availableActivityColumns.value.find(col => col.field === field);
  if (column && !column.required) {
    column.visible = !column.visible;
  }
};

// 全选活性列
const selectAllActivityColumns = () => {
  availableActivityColumns.value.forEach(column => {
    column.visible = true;
  });
};

// 重置活性列设置到默认状态
const resetActivityColumnsToDefault = () => {
  defaultActivityColumnSettings.forEach(defaultCol => {
    const column = availableActivityColumns.value.find(col => col.field === defaultCol.field);
    if (column) {
      column.visible = defaultCol.visible;
    }
  });
};

// 应用活性列设置变更
const applyActivityColumnChanges = () => {
  console.log('应用活性列设置变更');
  
  // 保存列设置到localStorage
  const columnSettings = availableActivityColumns.value.map(col => ({
    field: col.field,
    visible: col.visible
  }));
  
  try {
    localStorage.setItem('activity-page-column-settings', JSON.stringify(columnSettings));
    console.log('活性列设置已保存到localStorage');
  } catch (error) {
    console.error('保存活性列设置失败:', error);
  }
  
  closeActivityColumnDialog();
  toast.add({
    severity: 'success',
    summary: '成功',
    detail: '列设置已应用',
    life: 3000
  });
};

// 从localStorage加载活性列设置
const loadActivityColumnSettings = () => {
  try {
    const savedSettings = localStorage.getItem('activity-page-column-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      settings.forEach((setting: any) => {
        const column = availableActivityColumns.value.find(col => col.field === setting.field);
        if (column) {
          column.visible = setting.visible;
        }
      });
      console.log('活性列设置已从localStorage加载');
    }
  } catch (error) {
    console.error('加载活性列设置失败:', error);
  }
};
</script>

<style scoped>
.activity-input-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: var(--p-primary-color);
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.content-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.project-selector {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.project-selector label {
  font-weight: 600;
  color: #495057;
}

.project-dropdown {
  min-width: 300px;
}

.main-content {
  display: flex;
  min-height: 600px;
}

.molecule-section {
  flex: 1;
  padding: 2rem;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.molecule-image-container {
  text-align: center;
}

.molecule-image {
  max-width: 300px;
  max-height: 300px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background: white;
  padding: 1rem;
}

.molecule-placeholder {
  width: 300px;
  height: 300px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  background: white;
}

.molecule-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.form-section {
  flex: 1;
  padding: 2rem;
}

.activity-form {
  max-width: 600px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.form-input {
  width: 100%;
}

.p-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

.submit-button {
  background: var(--p-primary-color);
}

.no-project-selected {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.no-project-selected i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* 活性列表区域样式 */
.activity-list-section {
  background: white;
  margin-top: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
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

/* 活性表格容器样式 */
.activity-table-container {
  padding: 1.5rem;
}

.activity-table {
  width: 100%;
}

.activity-table :deep(.p-datatable-header) {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  padding: 1rem;
}

/* 活性表格内容样式 */
.compound-name,
.synthetic-name,
.assay-name {
  font-weight: 500;
  color: #333;
}

.activity-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: #e3f2fd;
  color: #1976d2;
}

.activity-relation {
  font-weight: bold;
  color: #495057;
}

.activity-value {
  font-weight: 500;
  color: #2e7d32;
}

.activity-unit {
  padding: 0.25rem 0.5rem;
  background-color: #f1f8e9;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #388e3c;
}

.batch-info {
  font-family: 'Courier New', Courier, monospace;
  color: #666;
}

.note-text {
  max-width: 150px;
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

/* 列设置对话框样式 */
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

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .molecule-section {
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .project-selector {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .project-dropdown {
    min-width: 100%;
  }
}
</style>
