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
                label="Set SMILES" 
                size="small" 
                severity="info"
                @click="setSmilesFromInput"
                class="control-btn"
                title="Set SMILES from input field to editor"
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
              <label for="dropdown1">Main Parameter:</label>
              <Dropdown 
                v-model="inputs.mainParameter" 
                id="dropdown1"
                :options="mainParameterOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Select a project"
                class="w-full"
              />
            </div>
            <Button label="项目管理" @click="handleProjectManagement" class="row-btn" />
          </div>
          
          <!-- 第2行：2个输入框 -->
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
          
          <!-- 第3行：2个输入框 -->
          <div class="input-row row-3">
            <div class="input-item">
              <label for="input4">Compound SMILES:</label>
              <InputText v-model="inputs.compoundSmiles" id="input4" placeholder="Enter SMILES or use 'Get SMILES' button" />
              <small class="field-help">Type SMILES (e.g., CCO for ethanol) then click "Set SMILES" button above</small>
            </div>
            <div class="input-item">
              <label for="input5">Compound Note:</label>
              <InputText v-model="inputs.compoundNote" id="input5" placeholder="Enter compound note" />
            </div>
          </div>
          
          <!-- 第4行：4个按钮 -->
          <div class="input-row row-4">
            <Button label="Process" @click="handleProcess" class="row-btn" />
            <Button label="Validate" @click="handleValidate" class="row-btn" severity="info" />
            <Button label="Calculate" @click="handleCalculate" class="row-btn" severity="success" />
            <Button label="Reset" @click="handleReset" class="row-btn" severity="secondary" />
          </div>
          
          <!-- 第5行：3个按钮 -->
          <div class="input-row row-5">
            <Button label="Import" @click="handleImport" class="row-btn" />
            <Button label="Export" @click="handleExport" class="row-btn" severity="info" />
            <Button label="Preview" @click="handlePreview" class="row-btn" severity="success" />
          </div>
          
          <!-- 第6行：2个按钮 -->
          <div class="input-row row-6">
            <Button label="Save All" @click="handleSaveAll" class="row-btn" />
            <Button label="Clear All" @click="handleClearAll" class="row-btn" severity="danger" />
          </div>
        </div>
      </div>
      
      <!-- 下半部分 - 数据表格 -->
      <div class="bottom-section">
        <h3>Data Table</h3>
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
            <Column field="name" header="Name" style="min-width: 150px">
              <template #body="slotProps">
                <span>{{ slotProps.data.name }}</span>
              </template>
            </Column>
            
            <Column field="batch" header="Batch" style="min-width: 120px">
              <template #body="slotProps">
                <span>{{ slotProps.data.batch }}</span>
              </template>
            </Column>
            
            <Column field="smiles" header="SMILES" style="min-width: 200px">
              <template #body="slotProps">
                <span class="smiles-text">{{ slotProps.data.smiles }}</span>
              </template>
            </Column>
            
            <Column field="smilesImage" header="SMILES Image" style="min-width: 150px">
              <template #body="slotProps">
                <div class="smiles-image-container">
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
              </template>
            </Column>
            
            <Column field="description" header="Description" style="min-width: 200px">
              <template #body="slotProps">
                <span>{{ slotProps.data.description }}</span>
              </template>
            </Column>
            
            <Column field="attachments" header="Attachments" style="min-width: 150px">
              <template #body="slotProps">
                <div class="attachments-cell">
                  <span v-if="slotProps.data.attachments && slotProps.data.attachments.length > 0">
                    {{ slotProps.data.attachments.length }} file(s)
                  </span>
                  <span v-else>-</span>
                </div>
              </template>
            </Column>
            
            <Column header="Action" style="min-width: 150px" :frozen="true" alignFrozen="right">
              <template #body="slotProps">
                <div class="action-buttons">
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
        
        <div class="table-actions">
          <Button 
            label="Add New Row" 
            icon="pi pi-plus"
            @click="addNewRow"
            class="action-btn"
          />
          <Button 
            label="Load Sample Data" 
            severity="info" 
            icon="pi pi-file-import"
            @click="loadSampleTableData"
            class="action-btn"
          />
          <Button 
            label="Clear Table" 
            severity="secondary" 
            icon="pi pi-times"
            @click="clearTable"
            class="action-btn"
          />
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
        <h4>项目信息表格 (2x2)</h4>
        <div class="project-table">
          <div class="project-row" v-for="(row, rowIndex) in projectTableData" :key="rowIndex">
            <div class="project-cell" v-for="(cell, cellIndex) in row" :key="cellIndex">
              <div class="cell-content">
                <label>{{ cell.label }}:</label>
                <span>{{ cell.value }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="project-actions">
          <Button 
            label="编辑项目" 
            icon="pi pi-pencil"
            @click="editProject"
            class="edit-project-btn"
            size="small"
          />
          <Button 
            label="关闭" 
            icon="pi pi-times"
            @click="closeProjectDialog"
            severity="secondary"
            size="small"
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

// 导入自定义组合式函数
import { useTableData } from '@/composables/useTableData';
import { useProjectManagement, useFormData } from '@/composables/useProjectManagement';
import { useKetcher } from '@/composables/useKetcher';

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
  loadMainParameterOptions,
  loadProjectTableData,
  handleProjectManagement,
  closeProjectDialog,
  editProject
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

// 业务逻辑方法
const handleProcess = () => {
  console.log('Process clicked');
  // 这里添加处理逻辑
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
  // 并行加载所有必要的数据
  await Promise.all([
    loadMainParameterOptions(),
    loadProjectTableData(),
    loadSampleTableData()
  ]);
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

.control-btn {
  min-width: 80px;
  font-size: 0.875rem;
  height: 2rem;
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

.row-2, .row-3 {
  justify-content: space-between;
}

.row-2 .input-item, .row-3 .input-item {
  flex: 1;
  max-width: calc(50% - 0.5rem);
}

.row-4, .row-5, .row-6 {
  justify-content: center;
  flex-wrap: wrap;
}

.row-4 .row-btn {
  flex: 1;
  min-width: 120px;
  max-width: 150px;
}

.row-5 .row-btn {
  flex: 1;
  min-width: 130px;
  max-width: 160px;
}

.row-6 .row-btn {
  flex: 1;
  min-width: 150px;
  max-width: 200px;
}

.bottom-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

@media (max-width: 768px) {
  .top-section {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .input-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .input-item {
    min-width: unset;
    max-width: unset;
  }
  
  .row-btn {
    width: 100%;
    min-width: unset;
    max-width: unset;
  }
  
  .table-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .table-actions .action-btn {
    width: 200px;
    min-width: unset;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .smiles-text {
    max-width: 150px;
  }
  
  .data-table {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .data-input-page {
    padding: 1rem;
  }
  
  .container {
    padding: 0;
  }
  
  .top-section, .bottom-section {
    padding: 1rem;
  }
  
  .ketcher-frame {
    height: 350px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
  }
  
  /* 移动端对话框优化 */
  .image-modal-content {
    min-width: unset;
    width: 100%;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .detail-row label {
    min-width: unset;
    font-weight: 700;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions button {
    width: 100%;
  }
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
</style>
