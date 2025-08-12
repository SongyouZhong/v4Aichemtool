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
                <label for="compound">化合物ID *</label>
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
                <InputText
                  id="batch"
                  v-model="formData.batch"
                  placeholder="请输入批次"
                  class="form-input"
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
  Synthetic 
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
  batch: '',
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

// 计算分子式图片URL
const moleculeImageUrl = computed(() => {
  if (!currentSmiles.value) return '';
  return `${API_CONFIG.BASE_URL}/smiles/smiles2img?smiles=${encodeURIComponent(currentSmiles.value)}`;
});

// 页面加载时获取数据
onMounted(async () => {
  await loadProjects();
  await loadAssays();
});

// 监听项目变化
watch(selectedProject, (newProject) => {
  if (newProject) {
    formData.value.project_id = newProject;
    loadCompoundsByProject(newProject);
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
    batch: '',
    ref_activity_id: '',
    note: ''
  };
  errors.value = {};
  currentSmiles.value = '';
  synthetics.value = [];
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
