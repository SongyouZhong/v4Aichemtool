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
              @load="onKetcherLoad"
            />
            <div class="ketcher-controls">
              <Button 
                label="Get SMILES" 
                size="small"
                @click="getSmiles"
                class="control-btn"
                title="Get SMILES from editor to input field"
              />
              <Button 
                label="Set SMILES" 
                size="small" 
                severity="info"
                @click="setSampleMolecule"
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
                • Enter SMILES in input field, click "Set SMILES" to display in editor
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
              <label for="input2">Parameter A:</label>
              <InputText v-model="inputs.parameterA" id="input2" placeholder="Enter parameter A" />
            </div>
            <div class="input-item">
              <label for="input3">Parameter B:</label>
              <InputText v-model="inputs.parameterB" id="input3" placeholder="Enter parameter B" />
            </div>
          </div>
          
          <!-- 第3行：2个输入框 -->
          <div class="input-row row-3">
            <div class="input-item">
              <label for="input4">Compound SMILES:</label>
              <InputText v-model="inputs.parameterC" id="input4" placeholder="Enter SMILES or use 'Get SMILES' button" />
              <small class="field-help">Type SMILES (e.g., CCO for ethanol) then click "Set SMILES" button above</small>
            </div>
            <div class="input-item">
              <label for="input5">Parameter D:</label>
              <InputText v-model="inputs.parameterD" id="input5" placeholder="Enter parameter D" />
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
import { ref, onMounted, computed } from 'vue';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';

// 新的输入框数据结构
const inputs = ref({
  mainParameter: null as string | null, // 明确指定类型
  parameterA: '',
  parameterB: '',
  parameterC: '', // 这个将改为compound smile
  parameterD: ''
});

// 主参数下拉框选项
const mainParameterOptions = ref([
  { label: 'Project Alpha', value: 'project_alpha' },
  { label: 'Project Beta', value: 'project_beta' },
  { label: 'Project Gamma', value: 'project_gamma' },
  { label: 'Project Delta', value: 'project_delta' }
]);

// 项目管理对话框相关
const showProjectDialog = ref(false);
const projectTableData = ref([
  [
    { label: 'Project Name', value: 'Chemical Analysis Platform' },
    { label: 'Status', value: 'Active' }
  ],
  [
    { label: 'Start Date', value: '2024-01-15' },
    { label: 'End Date', value: '2024-12-31' }
  ]
]);

// Ketcher相关
const ketcherFrame = ref<HTMLIFrameElement | null>(null);
const currentSmiles = ref('');
const ketcherReady = ref(false);

// 表格分页相关
const rows = ref(15);
const scrollable = computed(() => rows.value > 15);
const scrollHeight = computed(() => rows.value > 15 ? '400px' : undefined);

// 表格数据类型定义
interface TableRow {
  id: number;
  name: string;
  batch: string;
  smiles: string;
  smilesImage: string;
  description: string;
  attachments: string[];
}

// 表格数据
const tableData = ref<TableRow[]>([]);

// 图片放大对话框相关
const showImageDialog = ref(false);
const selectedImage = ref({
  src: '',
  name: '',
  smiles: '',
  description: ''
});

// 输入按钮事件处理
const handleSearch = () => {
  console.log('Search clicked with:', inputs.value.mainParameter);
  // 这里添加搜索逻辑
};

// 项目管理相关方法
const handleProjectManagement = () => {
  showProjectDialog.value = true;
};

const closeProjectDialog = () => {
  showProjectDialog.value = false;
};

const editProject = () => {
  console.log('Edit project clicked');
  // 这里可以添加编辑项目的逻辑
  alert('编辑项目功能待实现');
};

const handleProcess = () => {
  console.log('Process clicked');
  // 这里添加处理逻辑
};

const handleValidate = () => {
  console.log('Validate clicked');
  // 这里添加验证逻辑
};

const handleCalculate = () => {
  console.log('Calculate clicked');
  // 这里添加计算逻辑
};

const handleReset = () => {
  inputs.value = {
    mainParameter: null,
    parameterA: '',
    parameterB: '',
    parameterC: '',
    parameterD: ''
  };
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

const handleSaveAll = () => {
  console.log('Save All clicked');
  saveData();
};

const handleClearAll = () => {
  handleReset();
  clearTable();
  clearMolecule();
  console.log('All data cleared');
};

// Ketcher相关方法
const getKetcherInstance = () => {
  if (!ketcherFrame.value) return null;
  
  let ketcher = null;
  try {
    if ('contentDocument' in ketcherFrame.value) {
      ketcher = (ketcherFrame.value.contentWindow as any)?.ketcher;
    } else {
      ketcher = (window.frames as any)['idKetcher']?.ketcher;
    }
  } catch (error) {
    console.error('Error accessing Ketcher instance:', error);
  }
  
  return ketcher;
};

// 使用PostMessage API与Ketcher通信
const sendKetcherMessage = (action: string, data?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!ketcherFrame.value?.contentWindow) {
      reject(new Error('Ketcher frame not available'));
      return;
    }
    
    const messageId = Date.now() + Math.random();
    
    const handleResponse = (event: MessageEvent) => {
      if (event.data.action === action + 'Response') {
        window.removeEventListener('message', handleResponse);
        if (event.data.success) {
          resolve(event.data.data);
        } else {
          reject(new Error(event.data.error));
        }
      }
    };
    
    window.addEventListener('message', handleResponse);
    
    // 设置超时
    setTimeout(() => {
      window.removeEventListener('message', handleResponse);
      reject(new Error('Ketcher operation timeout'));
    }, 5000);
    
    ketcherFrame.value.contentWindow.postMessage({ action, data, messageId }, '*');
  });
};

const onKetcherLoad = () => {
  console.log('Ketcher iframe loaded');
  // 等待一段时间确保Ketcher完全初始化
  setTimeout(() => {
    ketcherReady.value = true;
    console.log('Ketcher ready for interaction');
    
    // 测试Ketcher实例是否可用
    const ketcher = getKetcherInstance();
    if (ketcher) {
      console.log('Ketcher instance found:', typeof ketcher);
      console.log('Available methods:', Object.keys(ketcher).filter(key => typeof ketcher[key] === 'function'));
    } else {
      console.warn('Ketcher instance not found');
    }
  }, 3000);
};

const getSmiles = async () => {
  if (!ketcherReady.value) {
    console.warn('Ketcher not ready');
    return;
  }
  
  console.log('Attempting to get SMILES from editor...');
  
  // 首先尝试直接访问Ketcher实例
  try {
    const ketcher = getKetcherInstance();
    if (ketcher && ketcher.getSmiles) {
      const smiles = await ketcher.getSmiles();
      currentSmiles.value = smiles || '';
      inputs.value.parameterC = smiles || '';
      console.log('SMILES retrieved successfully with direct API:', smiles);
      console.log('Updated Parameter C with SMILES:', smiles);
      return;
    }
  } catch (error) {
    console.warn('Direct Ketcher API failed, trying PostMessage:', error);
  }
  
  // 如果直接API失败，尝试PostMessage
  try {
    const smiles = await sendKetcherMessage('getSmiles');
    currentSmiles.value = smiles || '';
    inputs.value.parameterC = smiles || '';
    console.log('SMILES retrieved successfully with PostMessage:', smiles);
    console.log('Updated Parameter C with SMILES:', smiles);
  } catch (error) {
    console.error('Both direct API and PostMessage failed:', error);
    alert('Failed to get SMILES. Please ensure Ketcher is loaded properly.');
  }
};

const setSampleMolecule = async () => {
  if (!ketcherReady.value) {
    console.warn('Ketcher not ready');
    return;
  }
  
  // 如果Parameter C有SMILES，使用它；否则使用默认的咖啡因SMILES
  const smilesFromInput = inputs.value.parameterC.trim();
  const smilesToSet = smilesFromInput || 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C';
  
  console.log('Attempting to set SMILES:', smilesToSet);
  console.log('SMILES source:', smilesFromInput ? 'from input field' : 'default caffeine');
  
  // 首先尝试直接访问Ketcher实例
  try {
    const ketcher = getKetcherInstance();
    if (ketcher && ketcher.setMolecule) {
      await ketcher.setMolecule(smilesToSet);
      currentSmiles.value = smilesToSet;
      // 如果使用了默认值，更新到输入框
      if (!smilesFromInput) {
        inputs.value.parameterC = smilesToSet;
      }
      console.log('Molecule set successfully with direct API. SMILES:', smilesToSet);
      return;
    }
  } catch (error) {
    console.warn('Direct Ketcher API failed, trying PostMessage:', error);
  }
  
  // 如果直接API失败，尝试PostMessage
  try {
    await sendKetcherMessage('setMolecule', smilesToSet);
    currentSmiles.value = smilesToSet;
    // 如果使用了默认值，更新到输入框
    if (!smilesFromInput) {
      inputs.value.parameterC = smilesToSet;
    }
    console.log('Molecule set successfully with PostMessage. SMILES:', smilesToSet);
  } catch (error) {
    console.error('Both direct API and PostMessage failed:', error);
    alert(`Failed to set molecule. Please ensure Ketcher is loaded properly. SMILES: ${smilesToSet}`);
  }
};

const clearMolecule = async () => {
  if (!ketcherReady.value) {
    console.warn('Ketcher not ready');
    return;
  }
  
  try {
    await sendKetcherMessage('clear');
    currentSmiles.value = '';
    console.log('Molecule cleared');
  } catch (error) {
    console.error('Error clearing molecule:', error);
    // 回退到直接访问方法
    try {
      const ketcher = getKetcherInstance();
      if (ketcher) {
        await ketcher.setMolecule('');
        currentSmiles.value = '';
      }
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
    }
  }
};

// 表格相关方法
const addNewRow = () => {
  const newId = Math.max(...tableData.value.map(row => row.id), 0) + 1;
  const newRow: TableRow = {
    id: newId,
    name: '',
    batch: '',
    smiles: '',
    smilesImage: '',
    description: '',
    attachments: []
  };
  tableData.value.push(newRow);
  console.log('New row added');
};

const editRow = (row: TableRow) => {
  console.log('Editing row:', row);
  // 这里可以添加编辑逻辑，比如打开编辑对话框
  // 暂时用prompt做简单演示
  const newName = prompt('Edit name:', row.name);
  if (newName !== null) {
    row.name = newName;
  }
};

const deleteRow = (row: TableRow) => {
  if (confirm(`Are you sure you want to delete row "${row.name}"?`)) {
    const index = tableData.value.findIndex(r => r.id === row.id);
    if (index !== -1) {
      tableData.value.splice(index, 1);
      console.log('Row deleted:', row);
    }
  }
};

const clearTable = () => {
  tableData.value = [];
  console.log('Table cleared');
};

const loadSampleTableData = () => {
  tableData.value = [
    {
      id: 1,
      name: 'Caffeine',
      batch: 'CHM-2024-001',
      smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CN1C%3DNC2%3DC1C(%3DO)N(C(%3DO)N2C)C/PNG',
      description: 'Central nervous system stimulant, commonly found in coffee and tea',
      attachments: ['caffeine_analysis.pdf', 'nmr_data.xlsx', 'purity_report.doc']
    },
    {
      id: 2,
      name: 'Aspirin',
      batch: 'PHM-2024-002',
      smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC(%3DO)OC1%3DCC%3DCC%3DC1C(%3DO)O/PNG',
      description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for pain relief',
      attachments: ['aspirin_synthesis.pdf', 'quality_control.xlsx']
    },
    {
      id: 3,
      name: 'Glucose',
      batch: 'BIO-2024-003',
      smiles: 'C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O)O)O)O)O',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/C(%5BC%40%40H%5D1%5BC%40H%5D(%5BC%40%40H%5D(%5BC%40H%5D(%5BC%40H%5D(O1)O)O)O)O)O/PNG',
      description: 'Simple sugar and primary energy source for cellular metabolism',
      attachments: ['glucose_purity.pdf']
    },
    {
      id: 4,
      name: 'Ibuprofen',
      batch: 'PHM-2024-004',
      smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC(C)CC1%3DCC%3DC(C%3DC1)C(C)C(%3DO)O/PNG',
      description: 'Nonsteroidal anti-inflammatory drug for pain and fever reduction',
      attachments: ['ibuprofen_specs.pdf', 'dissolution_test.xlsx', 'stability_study.doc']
    },
    {
      id: 5,
      name: 'Benzene',
      batch: 'ORG-2024-005',
      smiles: 'C1=CC=CC=C1',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/C1%3DCC%3DCC%3DC1/PNG',
      description: 'Aromatic hydrocarbon, important industrial solvent and precursor',
      attachments: ['benzene_safety.pdf', 'gc_ms_analysis.xlsx']
    },
    {
      id: 6,
      name: 'Ethanol',
      batch: 'SOL-2024-006',
      smiles: 'CCO',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CCO/PNG',
      description: 'Common alcohol used as solvent and in pharmaceutical preparations',
      attachments: ['ethanol_purity.pdf']
    },
    {
      id: 7,
      name: 'Morphine',
      batch: 'NAR-2024-007',
      smiles: 'CN1CC[C@]23C4=C5C=CC(=O)C=C5CC[C@H]2[C@H]1CC6=C3C(=C(C=C6)O)O4',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CN1CC%5BC%40%5D23C4%3DC5C%3DCC(%3DO)C%3DC5CC%5BC%40H%5D2%5BC%40H%5D1CC6%3DC3C(%3DC(C%3DC6)O)O4/PNG',
      description: 'Opioid analgesic used for severe pain management',
      attachments: ['morphine_analysis.pdf', 'controlled_substance_log.xlsx', 'batch_record.doc']
    },
    {
      id: 8,
      name: 'Paracetamol',
      batch: 'PHM-2024-008',
      smiles: 'CC(=O)NC1=CC=C(C=C1)O',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC(%3DO)NC1%3DCC%3DC(C%3DC1)O/PNG',
      description: 'Acetaminophen, widely used analgesic and antipyretic medication',
      attachments: ['paracetamol_testing.pdf', 'dissolution_profile.xlsx']
    },
    {
      id: 9,
      name: 'Vitamin C',
      batch: 'VIT-2024-009',
      smiles: 'C([C@@H]([C@@H]([C@H](C(=O)C(=O)O)O)O)O)O',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/C(%5BC%40%40H%5D(%5BC%40%40H%5D(%5BC%40H%5D(C(%3DO)C(%3DO)O)O)O)O)O/PNG',
      description: 'Essential vitamin, ascorbic acid, important antioxidant',
      attachments: ['vitamin_c_assay.pdf', 'stability_data.xlsx', 'antioxidant_test.doc']
    },
    {
      id: 10,
      name: 'Dopamine',
      batch: 'NEU-2024-010',
      smiles: 'C1=CC(=C(C=C1CCN)O)O',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/C1%3DCC(%3DC(C%3DC1CCN)O)O/PNG',
      description: 'Neurotransmitter involved in reward and motivation pathways',
      attachments: ['dopamine_synthesis.pdf', 'hplc_method.xlsx']
    },
    {
      id: 11,
      name: 'Penicillin G',
      batch: 'ANT-2024-011',
      smiles: 'CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC1(%5BC%40%40H%5D(N2%5BC%40H%5D(S1)%5BC%40%40H%5D(C2%3DO)NC(%3DO)CC3%3DCC%3DCC%3DC3)C(%3DO)O)C/PNG',
      description: 'Beta-lactam antibiotic used to treat bacterial infections',
      attachments: ['penicillin_potency.pdf', 'microbiological_assay.xlsx', 'impurity_profile.doc']
    },
    {
      id: 12,
      name: 'Cholesterol',
      batch: 'STE-2024-012',
      smiles: 'C[C@H](CCCC(C)C)[C@H]1CC[C@@H]2[C@@]1(CC[C@H]3[C@H]2CC=C4[C@@]3(CC[C@@H](C4)O)C)C',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/C%5BC%40H%5D(CCCC(C)C)%5BC%40H%5D1CC%5BC%40%40H%5D2%5BC%40%40%5D1(CC%5BC%40H%5D3%5BC%40H%5D2CC%3DC4%5BC%40%40%5D3(CC%5BC%40%40H%5D(C4)O)C)C/PNG',
      description: 'Sterol molecule essential for cell membrane structure and function',
      attachments: ['cholesterol_analysis.pdf', 'lipid_profile.xlsx']
    },
    {
      id: 13,
      name: 'Codeine',
      batch: 'NAR-2024-013',
      smiles: 'COC1=C2C3=C(C[C@@H]4N(CC[C@@]35C2=C(C=C1)OC6=C5C(=CC=C6)O4)C)C=C3',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/COC1%3DC2C3%3DC(C%5BC%40%40H%5D4N(CC%5BC%40%40%5D35C2%3DC(C%3DC1)OC6%3DC5C(%3DCC%3DC6)O4)C)C%3DC3/PNG',
      description: 'Opioid analgesic used for mild to moderate pain relief',
      attachments: ['codeine_purity.pdf', 'opioid_screening.xlsx', 'batch_documentation.doc']
    },
    {
      id: 14,
      name: 'Warfarin',
      batch: 'ANT-2024-014',
      smiles: 'CC(=O)CC(C1=CC=CC=C1)C2=C(C3=CC=CC=C3OC2=O)O',
      smilesImage: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CC(%3DO)CC(C1%3DCC%3DCC%3DC1)C2%3DC(C3%3DCC%3DCC%3DC3OC2%3DO)O/PNG',
      description: 'Anticoagulant medication used to prevent blood clots',
      attachments: ['warfarin_stability.pdf', 'coagulation_test.xlsx']
    },
    {
      id: 15,
      name: 'Insulin',
      batch: 'PEP-2024-015',
      smiles: 'CCC(C)C[C@@H](C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](CC(=O)N)C(=O)N[C@@H](CC1=CC=CC=C1)C(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](CCC(=O)N)C(=O)N[C@@H](CC2=CC=C(C=C2)O)C(=O)N[C@@H]([C@@H](C)O)C(=O)N[C@@H](CCCCN)C(=O)N[C@@H](CC(=O)N)C(=O)N[C@@H](C(C)C)C(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](C)C(=O)N[C@@H](CC3=CC=CC=C3)C(=O)N[C@@H](CCC(=O)N)C(=O)N[C@@H](C)C(=O)N[C@@H](CC4=CC=C(C=C4)O)C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](C(C)C)C(=O)O)NC(=O)[C@H](CC5=CNC6=CC=CC=C65)NC(=O)[C@H](CO)NC(=O)[C@H](CC(=O)N)NC(=O)[C@H](CC(C)C)NC(=O)[C@H](CO)NC(=O)[C@H](CC7=CC=C(C=C7)O)NC(=O)[C@H](CCCCN)NC(=O)[C@H](CC8=CC=CC=C8)NC(=O)[C@H](CCC(=O)N)NC(=O)[C@H](CC9=CNC1=CC=CC=C91)N',
      smilesImage: '',
      description: 'Protein hormone essential for glucose metabolism regulation',
      attachments: ['insulin_bioactivity.pdf', 'protein_analysis.xlsx', 'stability_chamber.doc', 'endotoxin_test.pdf']
    }
  ];
  console.log('Sample table data loaded with', tableData.value.length, 'compounds');
};

const handleImageError = (event: Event) => {
  console.warn('Failed to load SMILES image:', (event.target as HTMLImageElement).src);
  (event.target as HTMLImageElement).style.display = 'none';
};

// 点击图片放大显示
const showImageModal = (row: TableRow) => {
  if (row.smilesImage) {
    selectedImage.value = {
      src: row.smilesImage,
      name: row.name,
      smiles: row.smiles,
      description: row.description
    };
    showImageDialog.value = true;
  }
};

// 关闭图片对话框
const closeImageDialog = () => {
  showImageDialog.value = false;
  selectedImage.value = {
    src: '',
    name: '',
    smiles: '',
    description: ''
  };
};

// 下载图片
const downloadImage = async () => {
  if (!selectedImage.value.src) return;
  
  try {
    const response = await fetch(selectedImage.value.src);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedImage.value.name.replace(/\s+/g, '_')}_structure.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
    console.log('Image downloaded successfully');
  } catch (error) {
    console.error('Error downloading image:', error);
    alert('Failed to download image. Please try again.');
  }
};

// 初始化表格数据
const initializeTable = () => {
  // 启动时自动加载示例数据
  loadSampleTableData();
};

// 保存数据
const saveData = async () => {
  // 先获取最新的SMILES数据
  await getSmiles();
  
  const allData = {
    inputs: inputs.value,
    tableData: tableData.value,
    moleculeSmiles: currentSmiles.value
  };
  
  console.log('Saving data:', allData);
  // 这里可以添加实际的保存逻辑，比如发送到API
  alert('Data saved successfully!');
};

// 加载示例数据 (仅针对输入框)
const loadSampleData = () => {
  // 填充输入框示例数据
  inputs.value = {
    mainParameter: 'project_alpha',
    parameterA: 'Sample A',
    parameterB: 'Sample B',
    parameterC: 'Sample C',
    parameterD: 'Sample D'
  };
  
  console.log('Sample input data loaded');
};

onMounted(() => {
  initializeTable();
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
