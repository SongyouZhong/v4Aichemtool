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
              />
              <Button 
                label="Set Sample" 
                size="small" 
                severity="info"
                @click="setSampleMolecule"
                class="control-btn"
              />
              <Button 
                label="Clear" 
                size="small" 
                severity="secondary"
                @click="clearMolecule"
                class="control-btn"
              />
            </div>
            <div class="smiles-display" v-if="currentSmiles">
              <label>Current SMILES:</label>
              <InputText 
                v-model="currentSmiles" 
                readonly 
                size="small"
                class="smiles-input"
              />
            </div>
          </div>
        </div>
        
        <!-- 右边输入框区域 -->
        <div class="right-inputs">
          <h3>Input Parameters</h3>
          <div class="input-group">
            <label for="input1">Parameter 1:</label>
            <InputText v-model="inputs.parameter1" id="input1" placeholder="Enter parameter 1" />
          </div>
          
          <div class="input-group">
            <label for="input2">Parameter 2:</label>
            <InputText v-model="inputs.parameter2" id="input2" placeholder="Enter parameter 2" />
          </div>
          
          <div class="input-group">
            <label for="input3">Parameter 3:</label>
            <InputText v-model="inputs.parameter3" id="input3" placeholder="Enter parameter 3" />
          </div>
          
          <div class="input-group">
            <label for="input4">Parameter 4:</label>
            <InputText v-model="inputs.parameter4" id="input4" placeholder="Enter parameter 4" />
          </div>
          
          <div class="input-group">
            <label for="input5">Parameter 5:</label>
            <InputText v-model="inputs.parameter5" id="input5" placeholder="Enter parameter 5" />
          </div>
        </div>
      </div>
      
      <!-- 下半部分 - 10x7表格 -->
      <div class="bottom-section">
        <h3>Data Table (10x7)</h3>
        <div class="table-container">
          <DataTable 
            :value="tableData" 
            :rows="10" 
            :rowsPerPageOptions="[10, 20, 50]"
            :paginator="false"
            tableStyle="min-width: 50rem"
            class="data-table"
          >
            <Column 
              v-for="(col, index) in tableColumns" 
              :key="index"
              :field="col.field" 
              :header="col.header"
              style="width: 14.28%"
            >
              <template #body="slotProps">
                <InputText 
                  v-model="slotProps.data[col.field]" 
                  size="small"
                  class="table-input"
                />
              </template>
            </Column>
          </DataTable>
        </div>
        
        <div class="action-buttons">
          <Button 
            label="Clear All" 
            severity="secondary" 
            @click="clearAllData"
            class="action-btn"
          />
          <Button 
            label="Save Data" 
            @click="saveData"
            class="action-btn"
          />
          <Button 
            label="Load Sample" 
            severity="info" 
            @click="loadSampleData"
            class="action-btn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

// 输入框数据
const inputs = ref({
  parameter1: '',
  parameter2: '',
  parameter3: '',
  parameter4: '',
  parameter5: ''
});

// Ketcher相关
const ketcherFrame = ref<HTMLIFrameElement | null>(null);
const currentSmiles = ref('');
const ketcherReady = ref(false);

// 表格列定义
const tableColumns = ref([
  { field: 'col1', header: 'Column 1' },
  { field: 'col2', header: 'Column 2' },
  { field: 'col3', header: 'Column 3' },
  { field: 'col4', header: 'Column 4' },
  { field: 'col5', header: 'Column 5' },
  { field: 'col6', header: 'Column 6' },
  { field: 'col7', header: 'Column 7' }
]);

// 表格数据 (10行7列)
const tableData = ref<any[]>([]);

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
  }, 3000);
};

const getSmiles = async () => {
  if (!ketcherReady.value) {
    console.warn('Ketcher not ready');
    return;
  }
  
  try {
    const smiles = await sendKetcherMessage('getSmiles');
    currentSmiles.value = smiles || '';
    console.log('Current SMILES:', smiles);
  } catch (error) {
    console.error('Error getting SMILES:', error);
    // 回退到直接访问方法
    try {
      const ketcher = getKetcherInstance();
      if (ketcher) {
        const smiles = await ketcher.getSmiles();
        currentSmiles.value = smiles || '';
      }
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
    }
  }
};

const setSampleMolecule = async () => {
  if (!ketcherReady.value) {
    console.warn('Ketcher not ready');
    return;
  }
  
  try {
    // 设置一个示例分子 (咖啡因的SMILES)
    const sampleSmiles = 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C';
    await sendKetcherMessage('setMolecule', sampleSmiles);
    currentSmiles.value = sampleSmiles;
    console.log('Sample molecule set');
  } catch (error) {
    console.error('Error setting sample molecule:', error);
    // 回退到直接访问方法
    try {
      const ketcher = getKetcherInstance();
      if (ketcher) {
        const sampleSmiles = 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C';
        await ketcher.setMolecule(sampleSmiles);
        currentSmiles.value = sampleSmiles;
      }
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
    }
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

// 初始化表格数据
const initializeTable = () => {
  tableData.value = Array.from({ length: 10 }, (_, rowIndex) => {
    const row: any = { id: rowIndex + 1 };
    tableColumns.value.forEach(col => {
      row[col.field] = '';
    });
    return row;
  });
};

// 清空所有数据
const clearAllData = () => {
  // 清空输入框
  Object.keys(inputs.value).forEach(key => {
    inputs.value[key as keyof typeof inputs.value] = '';
  });
  
  // 清空表格
  initializeTable();
  
  // 清空Ketcher分子结构
  clearMolecule();
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

// 加载示例数据
const loadSampleData = () => {
  // 填充输入框示例数据
  inputs.value = {
    parameter1: 'Sample Value 1',
    parameter2: 'Sample Value 2',
    parameter3: 'Sample Value 3',
    parameter4: 'Sample Value 4',
    parameter5: 'Sample Value 5'
  };
  
  // 填充表格示例数据
  tableData.value = Array.from({ length: 10 }, (_, rowIndex) => {
    const row: any = { id: rowIndex + 1 };
    tableColumns.value.forEach((col, colIndex) => {
      row[col.field] = `Row${rowIndex + 1}Col${colIndex + 1}`;
    });
    return row;
  });
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

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.input-group .p-inputtext {
  width: 100%;
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
}

.data-table {
  border: 1px solid #e0e0e0;
}

.table-input {
  width: 100%;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 120px;
}

@media (max-width: 768px) {
  .top-section {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 200px;
  }
}
</style>
