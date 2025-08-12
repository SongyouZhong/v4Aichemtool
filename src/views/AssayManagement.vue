<template>
  <div class="assay-management-container">
    <div class="page-header">
      <h1>检测方法管理</h1>
      <p>管理和配置检测方法信息</p>
    </div>

    <div class="content-wrapper">
      <!-- 操作区域 -->
      <div class="action-bar">
        <Button
          label="添加检测方法"
          icon="pi pi-plus"
          class="add-button"
          @click="showAddDialog = true"
        />
        <div class="search-bar">
          <InputText
            v-model="searchQuery"
            placeholder="搜索检测方法..."
            class="search-input"
            @input="onSearchChange"
          />
          <Button
            icon="pi pi-search"
            class="search-button"
            @click="loadAssays"
          />
        </div>
      </div>

      <!-- 检测方法列表 -->
      <div class="assay-list">
        <DataTable
          :value="assays"
          :loading="loading"
          :paginator="true"
          :rows="pageSize"
          :totalRecords="totalRecords"
          :lazy="true"
          @page="onPageChange"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 25, 50]"
          currentPageReportTemplate="显示 {first} 到 {last} 条，共 {totalRecords} 条记录"
          class="assay-table"
          responsiveLayout="scroll"
        >
          <Column field="name" header="检测方法名称" :sortable="true">
            <template #body="{ data }">
              <div class="assay-name">
                <strong>{{ data.name }}</strong>
              </div>
            </template>
          </Column>
          
          <Column field="description" header="描述">
            <template #body="{ data }">
              <div class="assay-description">
                {{ data.description || '无描述' }}
              </div>
            </template>
          </Column>
          
          <Column field="note" header="备注">
            <template #body="{ data }">
              <div class="assay-note">
                {{ data.note || '无备注' }}
              </div>
            </template>
          </Column>
          
          <Column header="操作" :exportable="false">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  class="edit-button"
                  size="small"
                  @click="editAssay(data)"
                  v-tooltip.top="'编辑'"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  class="delete-button"
                  size="small"
                  @click="confirmDelete(data)"
                  v-tooltip.top="'删除'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <Dialog
      v-model:visible="showAddDialog"
      :header="editingAssay ? '编辑检测方法' : '添加检测方法'"
      :modal="true"
      class="assay-dialog"
      :style="{ width: '500px' }"
    >
      <div class="dialog-content">
        <form @submit.prevent="submitAssay" class="assay-form">
          <div class="form-group">
            <label for="assay-name">检测方法名称 *</label>
            <InputText
              id="assay-name"
              v-model="formData.name"
              placeholder="请输入检测方法名称"
              class="form-input"
              :class="{ 'p-invalid': errors.name }"
            />
            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
          </div>

          <div class="form-group">
            <label for="assay-description">描述</label>
            <Textarea
              id="assay-description"
              v-model="formData.description"
              placeholder="请输入检测方法描述"
              class="form-input"
              rows="3"
            />
          </div>

          <div class="form-group">
            <label for="assay-note">备注</label>
            <Textarea
              id="assay-note"
              v-model="formData.note"
              placeholder="请输入备注信息"
              class="form-input"
              rows="2"
            />
          </div>
        </form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="取消"
            icon="pi pi-times"
            severity="secondary"
            @click="cancelEdit"
          />
          <Button
            :label="editingAssay ? '更新' : '保存'"
            icon="pi pi-check"
            class="save-button"
            @click="submitAssay"
            :loading="isSubmitting"
          />
        </div>
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="确认删除"
      :modal="true"
      class="delete-dialog"
      :style="{ width: '400px' }"
    >
      <div class="dialog-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--p-orange-500); margin-right: 1rem;"></i>
        <span>确定要删除检测方法 "{{ deletingAssay?.name }}" 吗？此操作不可撤销。</span>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="取消"
            icon="pi pi-times"
            severity="secondary"
            @click="showDeleteDialog = false"
          />
          <Button
            label="删除"
            icon="pi pi-trash"
            severity="danger"
            @click="deleteAssay"
            :loading="isDeleting"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';

import { assayApi } from '@/services/assayApi';
import type { Assay, AssayCreate } from '@/types';

const toast = useToast();

// 响应式数据
const assays = ref<Assay[]>([]);
const loading = ref(false);
const showAddDialog = ref(false);
const showDeleteDialog = ref(false);
const editingAssay = ref<Assay | null>(null);
const deletingAssay = ref<Assay | null>(null);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const searchQuery = ref('');

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);

// 表单数据
const formData = ref<AssayCreate>({
  name: '',
  description: '',
  note: ''
});

// 错误信息
const errors = ref<Record<string, string>>({});

// 页面加载时获取数据
onMounted(() => {
  loadAssays();
});

// 加载检测方法列表
const loadAssays = async () => {
  loading.value = true;
  try {
    const response = await assayApi.getList({
      page: currentPage.value,
      size: pageSize.value
    });
    
    assays.value = response.items || [];
    totalRecords.value = response.total || 0;
  } catch (error) {
    console.error('Failed to load assays:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '加载检测方法列表失败',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

// 分页变化处理
const onPageChange = (event: any) => {
  currentPage.value = event.page + 1;
  pageSize.value = event.rows;
  loadAssays();
};

// 搜索处理
const onSearchChange = () => {
  // 实际项目中可以实现搜索功能
  // 这里暂时只是重新加载数据
  currentPage.value = 1;
  loadAssays();
};

// 编辑检测方法
const editAssay = (assay: Assay) => {
  editingAssay.value = assay;
  formData.value = {
    name: assay.name,
    description: assay.description || '',
    note: assay.note || ''
  };
  showAddDialog.value = true;
};

// 确认删除
const confirmDelete = (assay: Assay) => {
  deletingAssay.value = assay;
  showDeleteDialog.value = true;
};

// 删除检测方法
const deleteAssay = async () => {
  if (!deletingAssay.value) return;
  
  isDeleting.value = true;
  try {
    await assayApi.delete(deletingAssay.value.id);
    
    toast.add({
      severity: 'success',
      summary: '成功',
      detail: '检测方法删除成功',
      life: 3000
    });
    
    showDeleteDialog.value = false;
    deletingAssay.value = null;
    loadAssays();
  } catch (error) {
    console.error('Failed to delete assay:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '删除检测方法失败',
      life: 3000
    });
  } finally {
    isDeleting.value = false;
  }
};

// 表单验证
const validateForm = (): boolean => {
  errors.value = {};
  
  if (!formData.value.name.trim()) {
    errors.value.name = '请输入检测方法名称';
  }
  
  return Object.keys(errors.value).length === 0;
};

// 提交表单
const submitAssay = async () => {
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
    if (editingAssay.value) {
      // 更新
      await assayApi.update(editingAssay.value.id, formData.value);
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '检测方法更新成功',
        life: 3000
      });
    } else {
      // 创建
      await assayApi.create(formData.value);
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '检测方法创建成功',
        life: 3000
      });
    }
    
    cancelEdit();
    loadAssays();
  } catch (error) {
    console.error('Failed to save assay:', error);
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: editingAssay.value ? '更新检测方法失败' : '创建检测方法失败',
      life: 3000
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 取消编辑
const cancelEdit = () => {
  showAddDialog.value = false;
  editingAssay.value = null;
  formData.value = {
    name: '',
    description: '',
    note: ''
  };
  errors.value = {};
};
</script>

<style scoped>
.assay-management-container {
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

.action-bar {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.add-button {
  background: var(--p-primary-color);
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.search-input {
  min-width: 250px;
}

.assay-list {
  padding: 1.5rem;
}

.assay-table {
  margin-top: 1rem;
}

.assay-name strong {
  color: var(--p-primary-color);
}

.assay-description,
.assay-note {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.edit-button {
  background: var(--p-green-500);
  border-color: var(--p-green-500);
}

.delete-button {
  background: var(--p-red-500);
  border-color: var(--p-red-500);
}

.assay-dialog .dialog-content {
  padding: 1rem 0;
}

.assay-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
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

.dialog-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.save-button {
  background: var(--p-primary-color);
}

.delete-dialog .dialog-content {
  display: flex;
  align-items: center;
  padding: 1rem 0;
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar {
    justify-content: stretch;
  }
  
  .search-input {
    min-width: 100%;
  }
  
  .assay-description,
  .assay-note {
    max-width: 150px;
  }
}
</style>
