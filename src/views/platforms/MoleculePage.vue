<template>
  <div class="data-input-page">
    <div class="container">
      <h1 class="page-title">化合物录入</h1>
      
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
          <h3>化合物信息</h3>
          
          <!-- 第1行：1个下拉框 + 1个按钮 -->
        <div class="input-row row-1">
          <div class="input-item">
            <label for="current-project">当前项目:</label>
            <InputText 
              id="current-project"
              :value="currentProjectDisplay"
              readonly
              placeholder="No project selected"
              class="w-full project-display"
            />
          </div>
          <Button 
            label="项目切换" 
            icon="pi pi-refresh" 
            @click="handleProjectManagement"
            class="row-btn"
          />
        </div>          <!-- 第2行：2个输入框 -->
          <div class="input-row row-2">
            <div class="input-item">
              <label for="input2">化合物名称*:</label>
              <InputText v-model="inputs.compoundName" id="input2" placeholder="Enter compound name" />
            </div>
            <div class="input-item">
              <label for="input3">化合物批次:</label>
              <InputText v-model="inputs.compoundBatch" id="input3" placeholder="Enter compound batch" />
            </div>
          </div>
          
          <!-- 第3行：SMILES输入框和Set SMILES按钮 -->
          <div class="input-row row-3">
            <div class="input-item smiles-input-container">
              <label for="input4">SMILES*:</label>
              <InputText v-model="inputs.compoundSmiles" id="input4" placeholder="Enter SMILES or use 'Get SMILES' button" />
              <small class="field-help">Type SMILES (e.g., CCO for ethanol) then click "Set SMILES" button</small>
            </div>
            <div class="smiles-set-button">
              <Button 
                label="显示结构" 
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
              <label for="input5">Note:</label>
              <textarea 
                v-model="inputs.compoundNote" 
                id="input5" 
                placeholder="Enter compound note or description..." 
                class="compound-note-textarea"
                rows="4"
              />
            </div>
          </div>
          
          <!-- 第5行：合成优先级 -->
          <div class="input-row row-5">
            <div class="input-item">
              <label for="synthetic-priority">合成优先级:</label>
              <Dropdown 
                v-model="inputs.syntheticPriority" 
                id="synthetic-priority"
                :options="syntheticPriorityOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Select priority level"
                class="w-full"
              />
            </div>
          </div>
          
          <!-- 第6行：保存按钮 -->
          <div class="input-row row-6">
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
            :rows="pageSize"
            :rowsPerPageOptions="[10, 15, 20, 30, 50]"
            :paginator="true"
            :lazy="true"
            :totalRecords="total"
            :scrollable="scrollable"
            :scrollHeight="scrollHeight"
            tableStyle="min-width: 80rem"
            class="data-table"
            responsiveLayout="scroll"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            @page="onPageChange"
          >
            <!-- 多级表头 -->
            <ColumnGroup type="header">
              <Row>
                <!-- 基础信息列 - 跨行（除了操作列，它需要特殊处理） -->
                <Column 
                  v-for="col in groupedVisibleColumns.basic.filter(c => c.field !== 'action')" 
                  :key="col.field" 
                  :header="col.header" 
                  :rowspan="hasDescriptorColumns ? 2 : 1"
                  :style="col.style"
                />
                
                <!-- 分子描述符一级分类标题 -->
                <Column 
                  v-if="groupedVisibleColumns.structural.length > 0"
                  header="分子结构" 
                  :colspan="groupedVisibleColumns.structural.length"
                  headerStyle="text-align: center; background-color: #e3f2fd; font-weight: bold;"
                />
                <Column 
                  v-if="groupedVisibleColumns.lipinski.length > 0"
                  header="亲脂性" 
                  :colspan="groupedVisibleColumns.lipinski.length"
                  headerStyle="text-align: center; background-color: #f3e5f5; font-weight: bold;"
                />
                <Column 
                  v-if="groupedVisibleColumns.flexibility.length > 0"
                  header="分子柔性和极性" 
                  :colspan="groupedVisibleColumns.flexibility.length"
                  headerStyle="text-align: center; background-color: #e8f5e8; font-weight: bold;"
                />
                <Column 
                  v-if="groupedVisibleColumns.stereochemistry.length > 0"
                  header="立体化学" 
                  :colspan="groupedVisibleColumns.stereochemistry.length"
                  headerStyle="text-align: center; background-color: #fff3e0; font-weight: bold;"
                />
                <Column 
                  v-if="groupedVisibleColumns.druglikeness.length > 0"
                  header="药物性质评价" 
                  :colspan="groupedVisibleColumns.druglikeness.length"
                  headerStyle="text-align: center; background-color: #fce4ec; font-weight: bold;"
                />
                
                <!-- 操作列 - 跨行 -->
                <Column 
                  v-if="groupedVisibleColumns.basic.find(c => c.field === 'action')"
                  header="操作" 
                  :rowspan="hasDescriptorColumns ? 2 : 1"
                  :style="groupedVisibleColumns.basic.find(c => c.field === 'action')?.style"
                  :frozen="groupedVisibleColumns.basic.find(c => c.field === 'action')?.frozen"
                  :alignFrozen="groupedVisibleColumns.basic.find(c => c.field === 'action')?.alignFrozen"
                />
              </Row>
              
              <!-- 第二行：只有在有描述符列时才显示 -->
              <Row v-if="hasDescriptorColumns">
                <!-- 分子描述符二级列标题 -->
                <Column 
                  v-for="col in groupedVisibleColumns.structural" 
                  :key="col.field" 
                  :header="col.header"
                  :style="col.style"
                  headerStyle="background-color: #e3f2fd;"
                />
                <Column 
                  v-for="col in groupedVisibleColumns.lipinski" 
                  :key="col.field" 
                  :header="col.header"
                  :style="col.style"
                  headerStyle="background-color: #f3e5f5;"
                />
                <Column 
                  v-for="col in groupedVisibleColumns.flexibility" 
                  :key="col.field" 
                  :header="col.header"
                  :style="col.style"
                  headerStyle="background-color: #e8f5e8;"
                />
                <Column 
                  v-for="col in groupedVisibleColumns.stereochemistry" 
                  :key="col.field" 
                  :header="col.header"
                  :style="col.style"
                  headerStyle="background-color: #fff3e0;"
                />
                <Column 
                  v-for="col in groupedVisibleColumns.druglikeness" 
                  :key="col.field" 
                  :header="col.header"
                  :style="col.style"
                  headerStyle="background-color: #fce4ec;"
                />
              </Row>
            </ColumnGroup>

            <!-- 数据列 -->
            <Column 
              v-for="col in visibleColumns" 
              :key="col.field" 
              :field="col.field" 
              :style="col.style"
              :frozen="col.frozen"
              :alignFrozen="col.alignFrozen"
            >
              <template #body="slotProps">
                <!-- Name 列 -->
                <span v-if="col.field === 'name'">{{ slotProps.data.name }}</span>
                
                <!-- Batch 列 -->
                <span v-else-if="col.field === 'batch'">{{ slotProps.data.batch ?? '-' }}</span>
                
                <!-- 合并的SMILES列：图像在上，SMILES文本在下 -->
                <div v-else-if="col.field === 'smiles'" class="smiles-combined-container">
                  <div class="smiles-image-section">
                    <img v-if="slotProps.data.smilesImage" 
                         :src="slotProps.data.smilesImage" 
                         :alt="'SMILES: ' + slotProps.data.smiles"
                         class="smiles-image"
                         @error="handleImageError($event)"
                         :title="'SMILES Structure - ' + slotProps.data.name"
                    />
                    <span v-else class="no-image">No Image</span>
                  </div>
                  <div class="smiles-text-section">
                    <span class="smiles-text">{{ slotProps.data.smiles }}</span>
                  </div>
                </div>
                
                <!-- Description 列 -->
                <span v-else-if="col.field === 'description'">{{ slotProps.data.description }}</span>
                
                <!-- Synthetic Priority 列 -->
                <span v-else-if="col.field === 'synthetic_priority'" class="priority-cell">
                  {{ getPriorityLabel(slotProps.data.synthetic_priority) }}
                </span>
                
                <!-- Synthesis Status 列 -->
                <span v-else-if="col.field === 'synthesis_status'" class="synthesis-status-cell">
                  <span :class="getSynthesisStatusClass(slotProps.data.synthesis_status)">
                    {{ getSynthesisStatusLabel(slotProps.data.synthesis_status) }}
                  </span>
                </span>
                
                <!-- Quantity Summary 列 -->
                <span v-else-if="col.field === 'quantity_summary'" class="quantity-cell">
                  <span v-if="slotProps.data.quantity_summary && slotProps.data.quantity_summary !== '-'" 
                        class="quantity-value"
                        v-tooltip.top="`合成记录数：${slotProps.data.synthesis_count || 0}条`"
                  >
                    {{ slotProps.data.quantity_summary }}
                  </span>
                  <span v-else class="no-quantity">-</span>
                </span>
                
                <!-- Has Activity 列 -->
                <span v-else-if="col.field === 'has_activity'" class="activity-status-cell">
                  <i v-if="slotProps.data.has_activity" 
                     class="pi pi-check-circle activity-yes" 
                     v-tooltip.top="'有活性数据'"
                     style="color: #28a745; font-size: 1.2rem;"
                  ></i>
                  <i v-else 
                     class="pi pi-times-circle activity-no" 
                     v-tooltip.top="'无活性数据'"
                     style="color: #dc3545; font-size: 1.2rem;"
                  ></i>
                </span>
                
                <!-- Activity Summary 列 -->
                <span v-else-if="col.field === 'activity_summary'" class="activity-cell">
                  <span v-if="slotProps.data.activity_summary && slotProps.data.activity_summary !== '-'" 
                        class="activity-value"
                        v-tooltip.top="`活性记录数：${slotProps.data.activity_count || 0}条`"
                        v-html="slotProps.data.activity_summary.replace(/\n/g, '<br>')"
                  ></span>
                  <span v-else class="no-activity">-</span>
                </span>
                
                <!-- Attachments 列 -->
                <div v-else-if="col.field === 'attachments'" class="attachments-cell">
                  <span v-if="slotProps.data.attachments && slotProps.data.attachments.length > 0" class="has-attachments">
                    <i class="pi pi-paperclip"></i>
                    {{ slotProps.data.attachments.length }} 个附件
                  </span>
                  <span v-else class="no-attachments">无附件</span>
                </div>
                
                <!-- 分子描述符列 -->
                <!-- 分子结构描述符 -->
                <span v-else-if="col.field === 'maximum_graph_length'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.maximum_graph_length ?? '-' }}
                </span>
                <span v-else-if="col.field === 'number_of_rings'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.number_of_rings ?? '-' }}
                </span>
                <span v-else-if="col.field === 'number_of_aromatic_rings'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.number_of_aromatic_rings ?? '-' }}
                </span>
                <span v-else-if="col.field === 'number_of_aliphatic_rings'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.number_of_aliphatic_rings ?? '-' }}
                </span>
                <span v-else-if="col.field === 'number_atoms_in_largest_ring'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.number_atoms_in_largest_ring ?? '-' }}
                </span>
                
                <!-- Lipinski规则相关描述符 -->
                <span v-else-if="col.field === 'hba_lipinski'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.hba_lipinski ?? '-' }}
                </span>
                <span v-else-if="col.field === 'hbd_lipinski'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.hbd_lipinski ?? '-' }}
                </span>
                <span v-else-if="col.field === 'mol_weight'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.mol_weight ? slotProps.data.descriptors.mol_weight.toFixed(2) : '-' }}
                </span>
                <span v-else-if="col.field === 'lipinski_violations'" class="descriptor-cell">
                  <span :class="getLipinskiViolationClass(slotProps.data.descriptors?.lipinski_violations)">
                    {{ slotProps.data.descriptors?.lipinski_violations ?? '-' }}
                  </span>
                </span>
                <span v-else-if="col.field === 'lipinski_compliant'" class="descriptor-cell">
                  <i v-if="slotProps.data.descriptors?.lipinski_compliant === true" 
                     class="pi pi-check-circle" 
                     style="color: #28a745;"
                     v-tooltip.top="'符合Lipinski规则'"
                  ></i>
                  <i v-else-if="slotProps.data.descriptors?.lipinski_compliant === false" 
                     class="pi pi-times-circle" 
                     style="color: #dc3545;"
                     v-tooltip.top="'不符合Lipinski规则'"
                  ></i>
                  <span v-else>-</span>
                </span>
                
                <!-- 分子柔性和极性描述符 -->
                <span v-else-if="col.field === 'number_of_rotatable_bonds'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.number_of_rotatable_bonds ?? '-' }}
                </span>
                <span v-else-if="col.field === 'slog_p'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.slog_p ? slotProps.data.descriptors.slog_p.toFixed(2) : '-' }}
                </span>
                <span v-else-if="col.field === 'tpsa'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.tpsa ? slotProps.data.descriptors.tpsa.toFixed(2) : '-' }}
                </span>
                
                <!-- 立体化学描述符 -->
                <span v-else-if="col.field === 'number_of_stereo_centers'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.number_of_stereo_centers ?? '-' }}
                </span>
                
                <!-- 药物性质评价描述符 -->
                <span v-else-if="col.field === 'sa'" class="descriptor-cell">
                  {{ slotProps.data.descriptors?.sa ? slotProps.data.descriptors.sa.toFixed(2) : '-' }}
                </span>
                <span v-else-if="col.field === 'qed'" class="descriptor-cell">
                  <span :class="getQEDScoreClass(slotProps.data.descriptors?.qed)">
                    {{ slotProps.data.descriptors?.qed ? slotProps.data.descriptors.qed.toFixed(3) : '-' }}
                  </span>
                </span>
                
                <!-- Create Time 列 -->
                <span v-else-if="col.field === 'create_time'">
                  {{ slotProps.data.create_time ? new Date(slotProps.data.create_time).toLocaleDateString() : '-' }}
                </span>
                
                <!-- Creator 列 -->
                <span v-else-if="col.field === 'creator_id'">{{ slotProps.data.creator_id || '-' }}</span>
                
                <!-- Project Name 列 -->
                <span v-else-if="col.field === 'project_name'">{{ slotProps.data.project_name || '-' }}</span>
                
                <!-- Action 列 -->
                <div v-else-if="col.field === 'action'" class="action-buttons">
                  <Button 
                    icon="pi pi-pencil" 
                    size="small" 
                    outlined
                    @click="editCompound(slotProps.data)"
                    v-tooltip.top="'Edit'"
                    class="action-btn edit-btn"
                  />
                  <Button
                    icon="pi pi-paperclip"
                    size="small"
                    outlined
                    severity="warning"
                    @click="showCompoundUploadDialog(slotProps.data)"
                    v-tooltip.top="'上传附件'"
                    class="action-btn attach-btn"
                  />
                  <Button
                    icon="pi pi-download"
                    size="small"
                    outlined
                    severity="success"
                    @click="downloadCompoundAttachment(slotProps.data)"
                    v-tooltip.top="'下载附件'"
                    v-if="slotProps.data.attachments && slotProps.data.attachments.length > 0"
                    class="action-btn download-btn"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    size="small" 
                    outlined
                    severity="danger"
                    @click="softDeleteCompound(slotProps.data)"
                    v-tooltip.top="'删除（软删除）'"
                    class="action-btn delete-btn"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
    
    <!-- 化合物编辑对话框 -->
    <Dialog 
      v-model:visible="showEditDialog" 
      :header="'编辑化合物 - ' + (editingCompound.name || '')"
      :modal="true" 
      :closable="true"
      :draggable="false"
      :resizable="false"
      class="edit-compound-dialog"
      @hide="closeEditDialog"
    >
      <div class="edit-modal-content">
        <!-- 分子结构图片显示 -->
        <div class="compound-structure-section" v-if="editingCompound.smilesImage">
          <h4>分子结构</h4>
          <div class="structure-image-container">
            <img 
              :src="editingCompound.smilesImage" 
              :alt="'SMILES: ' + editingCompound.smiles"
              class="structure-image"
              @error="handleImageError($event)"
            />
          </div>
        </div>
        
        <!-- 可编辑的化合物属性 -->
        <div class="compound-edit-form">
          <h4>化合物信息</h4>
          
          <div class="edit-field">
            <label for="edit-name">化合物名称 *:</label>
            <InputText 
              id="edit-name"
              v-model="editingCompound.name" 
              placeholder="请输入化合物名称"
              class="edit-input"
            />
          </div>
          
          <div class="edit-field">
            <label for="edit-batch">批次:</label>
            <InputText 
              id="edit-batch"
              v-model="editingCompound.batch" 
              placeholder="请输入批次号"
              class="edit-input"
            />
          </div>
          
          <div class="edit-field">
            <label for="edit-smiles">SMILES分子式</label>
            <InputText 
              id="edit-smiles"
              v-model="editingCompound.smiles" 
              placeholder="请输入SMILES"
              class="edit-input smiles-input"
            />
          </div>
          
          <div class="edit-field">
            <label for="edit-description">描述:</label>
            <textarea 
              id="edit-description"
              v-model="editingCompound.description" 
              placeholder="请输入化合物描述"
              class="edit-textarea"
              rows="3"
            />
          </div>
          
          <div class="edit-field">
            <label for="edit-priority">合成优先级:</label>
            <Dropdown 
              id="edit-priority"
              v-model="editingCompound.synthetic_priority" 
              :options="syntheticPriorityDisplayOptions" 
              optionLabel="label" 
              optionValue="value"
              placeholder="选择优先级"
              class="edit-dropdown"
            />
          </div>
          
          <!-- 只读信息显示 -->
          <div class="readonly-info">
            <h4>其他信息（只读）</h4>
            
            <div class="readonly-field">
              <label>创建时间:</label>
              <span>{{ editingCompound.create_time ? new Date(editingCompound.create_time).toLocaleString() : '-' }}</span>
            </div>
            
            <div class="readonly-field">
              <label>创建者:</label>
              <span>{{ editingCompound.creator_id || '-' }}</span>
            </div>
            
            <div class="readonly-field">
              <label>项目名称:</label>
              <span>{{ editingCompound.project_name || '-' }}</span>
            </div>
            
            <div class="readonly-field">
              <label>化合物ID:</label>
              <span>{{ editingCompound.id || '-' }}</span>
            </div>
            
            <div class="readonly-field" v-if="editingCompound.attachments">
              <label>附件:</label>
              <span>{{ editingCompound.attachments.length || 0 }} 个文件</span>
            </div>
          </div>
        </div>
        
        <div class="edit-modal-actions">
          <Button 
            label="保存修改" 
            icon="pi pi-check"
            @click="saveCompoundChanges"
            class="save-changes-btn"
            :loading="saveLoading"
          />
          <Button 
            label="取消" 
            icon="pi pi-times"
            @click="closeEditDialog"
            severity="secondary"
            :disabled="saveLoading"
          />
        </div>
      </div>
    </Dialog>

    <!-- 编辑确认对话框 -->
    <Dialog 
      v-model:visible="showEditConfirmDialog" 
      header="确认保存修改"
      :modal="true" 
      :closable="true"
      :draggable="false"
      :resizable="false"
      class="edit-confirm-dialog"
      @hide="closeEditConfirmDialog"
    >
      <div class="edit-confirm-content">
        <div class="confirmation-message">
          <i class="pi pi-question-circle question-icon"></i>
          <div class="message-text">
            <h4>确认保存化合物修改</h4>
            <p>您即将保存对化合物的修改，确定要继续吗？</p>
            <div class="compound-summary">
              <div class="summary-row">
                <label>化合物名称:</label>
                <span>{{ editingCompound.name || '未设置' }}</span>
              </div>
              <div class="summary-row">
                <label>批次:</label>
                <span>{{ editingCompound.batch || '未设置' }}</span>
              </div>
              <div class="summary-row">
                <label>SMILES:</label>
                <span class="smiles-value">{{ editingCompound.smiles || '未设置' }}</span>
              </div>
              <div class="summary-row">
                <label>描述:</label>
                <span>{{ editingCompound.description || '未设置' }}</span>
              </div>
              <div class="summary-row">
                <label>合成优先级:</label>
                <span>{{ getPriorityLabel(editingCompound.synthetic_priority) }}</span>
              </div>
            </div>
            <p class="confirm-text">保存后修改将立即生效。</p>
          </div>
        </div>
        
        <div class="dialog-actions">
          <Button 
            label="取消" 
            icon="pi pi-times" 
            severity="secondary"
            @click="closeEditConfirmDialog"
            :disabled="saveLoading"
          />
          <Button 
            label="确认保存" 
            icon="pi pi-check" 
            @click="confirmSaveChanges"
            :loading="saveLoading"
          />
        </div>
      </div>
    </Dialog>
    
    <!-- 项目切换对话框 -->
    <Dialog 
      v-model:visible="showProjectDialog" 
      header="项目切换"
      :modal="true" 
      :closable="true"
      :draggable="false"
      :resizable="false"
      class="project-dialog"
      @hide="closeProjectDialog"
    >
      <div class="project-modal-content">
        <ProjectList 
          :projects="userProjects"
          :loading="projectLoading"
          :selectedProject="selectedProject"
          :showActions="false"
          @select-project="handleSelectProject"
          @refresh="refreshUserProjects"
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
            
            <!-- 化合物结构图片显示 -->
            <div class="compound-preview-section" v-if="currentCompoundImageUrl">
              <div class="preview-image-container">
                <img 
                  :src="currentCompoundImageUrl" 
                  :alt="'SMILES: ' + (inputs.compoundSmiles || '')"
                  class="preview-structure-image"
                  @error="handleImageError($event)"
                  :title="'分子结构预览 - ' + (inputs.compoundName || 'Unnamed Compound')"
                />
              </div>
            </div>
            
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
            label="重置" 
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

    <!-- 化合物附件上传对话框 -->
    <Dialog
      v-model:visible="showCompoundAttachmentDialog"
      modal
      class="compound-attachment-dialog"
      style="width: 700px"
      :closable="true"
    >
      <template #header>
        <h3>化合物附件管理</h3>
      </template>

      <div class="compound-attachment-content">
        <div class="compound-info">
          <h4>化合物信息</h4>
          <p><strong>化合物名称：</strong>{{ uploadingCompound?.name || '未命名' }}</p>
          <p v-if="uploadingCompound?.batch"><strong>批次：</strong>{{ uploadingCompound.batch }}</p>
          <p v-if="uploadingCompound?.description"><strong>描述：</strong>{{ uploadingCompound.description }}</p>
          
          <!-- 化合物结构预览 -->
          <div v-if="uploadingCompound?.smiles" class="compound-structure-preview">
            <label><strong>分子结构：</strong></label>
            <div class="structure-preview-container">
              <img
                :src="`http://localhost:8001/api/v1/smiles/structure-image?smiles=${encodeURIComponent(uploadingCompound.smiles)}&width=200&height=150`"
                alt="化合物结构"
                class="structure-preview-image"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>
        
        <div class="upload-section">
          <h4>附件上传</h4>
          <FileUpload 
            :config="{
              moduleType: 'compound',
              moduleId: uploadingCompound?.id || '',
              uploadedBy: authStore.currentUser?.id || 'current_user',
              multiple: true,
              maxFileSize: 50,
              allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar', 'jpg', 'jpeg', 'png', 'gif']
            }"
            :showExistingFiles="true"
            @uploaded="handleCompoundAttachmentUpload"
            @error="handleCompoundAttachmentError"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-actions">
          <Button
            label="关闭"
            severity="secondary"
            @click="showCompoundAttachmentDialog = false"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Drawer from 'primevue/drawer';

// 导入自定义组件
import ProjectList from '@/components/ProjectList.vue';
import FileUpload from '@/components/FileUpload.vue';

// 导入自定义组合式函数
import { useTableData } from '@/composables/useTableData';
import { useProjectManagement, useFormData } from '@/composables/useProjectManagement';
import { useKetcher } from '@/composables/useKetcher';
import { useCompoundAggregation } from '@/composables/useCompoundAggregation';
import type { Project } from '@/types/data';

// 导入API服务
import { CompoundApiService } from '@/services/compoundApi';
import { SmilesApiService } from '@/services/smilesApi';
import { userApi } from '@/services/userApi';
import { FileApiService } from '@/services/fileApi';

// 导入状态管理
import { useAuthStore } from '@/stores/auth';

// 使用组合式函数
const {
  tableData,
  total,
  currentPage,
  pageSize,
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
  handleImageError,
  aggregateCompoundsInfo,
  aggregatedCompoundToTableRow
} = useTableData();

// 使用聚合功能
const { loading: aggregationLoading } = useCompoundAggregation();

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

// 使用认证状态
const authStore = useAuthStore();

// 计算属性：当前选中项目的显示
const currentProjectDisplay = computed(() => {
  if (selectedProject.value) {
    return `${selectedProject.value.name}${selectedProject.value.description ? ' - ' + selectedProject.value.description : ''}`;
  }
  return 'No project selected';
});

// 计算属性：当前 SMILES 的图片 URL
const currentCompoundImageUrl = computed(() => {
  if (inputs.value.compoundSmiles && inputs.value.compoundSmiles.trim()) {
    return SmilesApiService.getSmilesImageUrl(inputs.value.compoundSmiles.trim());
  }
  return '';
});

// 项目切换确认对话框相关
const showProjectSwitchDialog = ref(false);
const pendingProject = ref<Project | null>(null);

// 用户项目相关
const userProjects = ref<Project[]>([]);

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

// 化合物编辑对话框相关
const showEditDialog = ref(false);
const editingCompound = ref<any>({});
const showEditConfirmDialog = ref(false);

// 化合物附件上传对话框相关
const showCompoundAttachmentDialog = ref(false);
const uploadingCompound = ref<any>(null);

// 定义可用的列配置
interface ColumnConfig {
  field: string;
  header: string;
  style: string;
  visible: boolean;
  required: boolean;
  frozen?: boolean;
  alignFrozen?: string;
  category?: string;
}

const availableColumns = ref<ColumnConfig[]>([
  { field: 'name', header: '化合物名称', style: 'min-width: 150px', visible: true, required: true },
  { field: 'batch', header: '批次', style: 'min-width: 120px', visible: false, required: false },
  { field: 'smiles', header: 'SMILES结构', style: 'min-width: 250px', visible: true, required: false },
  { field: 'description', header: '描述', style: 'min-width: 200px', visible: true, required: false },
  { field: 'synthetic_priority', header: '合成优先级', style: 'min-width: 120px', visible: true, required: false },
  { field: 'synthesis_status', header: '合成状态', style: 'min-width: 120px', visible: false, required: false },
  { field: 'quantity_summary', header: '数量汇总', style: 'min-width: 150px', visible: false, required: false },
  { field: 'has_activity', header: '是否有活性', style: 'min-width: 120px', visible: false, required: false },
  { field: 'activity_summary', header: '活性汇总', style: 'min-width: 200px', visible: false, required: false },
  { field: 'attachments', header: '附件', style: 'min-width: 150px', visible: true, required: false },
  
  // 分子结构描述符
  { field: 'maximum_graph_length', header: '最大图长度', style: 'min-width: 120px', visible: false, required: false, category: 'structural' },
  { field: 'number_of_rings', header: '环数', style: 'min-width: 100px', visible: false, required: false, category: 'structural' },
  { field: 'number_of_aromatic_rings', header: '芳香环数', style: 'min-width: 120px', visible: false, required: false, category: 'structural' },
  { field: 'number_of_aliphatic_rings', header: '脂肪环数', style: 'min-width: 120px', visible: false, required: false, category: 'structural' },
  { field: 'number_atoms_in_largest_ring', header: '最大环原子数', style: 'min-width: 140px', visible: false, required: false, category: 'structural' },
  
  // Lipinski规则相关描述符
  { field: 'hba_lipinski', header: '氢键受体数', style: 'min-width: 120px', visible: false, required: false, category: 'lipinski' },
  { field: 'hbd_lipinski', header: '氢键供体数', style: 'min-width: 120px', visible: false, required: false, category: 'lipinski' },
  { field: 'mol_weight', header: '分子量', style: 'min-width: 100px', visible: false, required: false, category: 'lipinski' },
  { field: 'lipinski_violations', header: 'Lipinski违反数', style: 'min-width: 140px', visible: false, required: false, category: 'lipinski' },
  { field: 'lipinski_compliant', header: 'Lipinski符合性', style: 'min-width: 140px', visible: false, required: false, category: 'lipinski' },
  
  // 分子柔性和极性描述符
  { field: 'number_of_rotatable_bonds', header: '可旋转键数', style: 'min-width: 120px', visible: false, required: false, category: 'flexibility' },
  { field: 'slog_p', header: 'SlogP', style: 'min-width: 100px', visible: false, required: false, category: 'flexibility' },
  { field: 'tpsa', header: 'TPSA', style: 'min-width: 100px', visible: false, required: false, category: 'flexibility' },
  
  // 立体化学描述符
  { field: 'number_of_stereo_centers', header: '立体中心数', style: 'min-width: 120px', visible: false, required: false, category: 'stereochemistry' },
  
  // 药物性质评价描述符
  { field: 'sa', header: '合成可及性', style: 'min-width: 120px', visible: false, required: false, category: 'druglikeness' },
  { field: 'qed', header: '药物性质评分', style: 'min-width: 140px', visible: false, required: false, category: 'druglikeness' },
  
  { field: 'create_time', header: '创建时间', style: 'min-width: 140px', visible: false, required: false },
  { field: 'creator_id', header: '创建者', style: 'min-width: 120px', visible: false, required: false },
  { field: 'project_name', header: '项目名称', style: 'min-width: 120px', visible: false, required: false },
  { field: 'action', header: '操作', style: 'min-width: 150px', visible: true, required: true, frozen: true, alignFrozen: 'right' }
]);

// 默认列配置（用于重置）
const defaultColumnSettings = [
  { field: 'name', visible: true },
  { field: 'batch', visible: false },
  { field: 'smiles', visible: true },
  { field: 'description', visible: true },
  { field: 'synthetic_priority', visible: true },
  { field: 'quantity_summary', visible: false },
  { field: 'has_activity', visible: false },
  { field: 'activity_summary', visible: false },
  { field: 'attachments', visible: true },
  
  // 分子结构描述符 - 默认显示部分关键指标
  { field: 'maximum_graph_length', visible: false },
  { field: 'number_of_rings', visible: false },
  { field: 'number_of_aromatic_rings', visible: false },
  { field: 'number_of_aliphatic_rings', visible: false },
  { field: 'number_atoms_in_largest_ring', visible: false },
  
  // Lipinski规则相关描述符 - 显示关键药物性质
  { field: 'hba_lipinski', visible: false },
  { field: 'hbd_lipinski', visible: false },
  { field: 'mol_weight', visible: false },
  { field: 'lipinski_violations', visible: false },
  { field: 'lipinski_compliant', visible: false },
  
  // 分子柔性和极性描述符
  { field: 'number_of_rotatable_bonds', visible: false },
  { field: 'slog_p', visible: false },
  { field: 'tpsa', visible: false },
  
  // 立体化学描述符
  { field: 'number_of_stereo_centers', visible: false },
  
  // 药物性质评价描述符
  { field: 'sa', visible: false },
  { field: 'qed', visible: false },
  
  { field: 'create_time', visible: true },
  { field: 'creator_id', visible: true },
  { field: 'project_name', visible: false },
  { field: 'action', visible: true }
];

// 计算属性：当前可见的列
const visibleColumns = computed(() => {
  return availableColumns.value.filter(col => col.visible);
});

// 计算属性：按分类分组的可见列
const groupedVisibleColumns = computed(() => {
  const grouped = {
    basic: [] as ColumnConfig[],
    structural: [] as ColumnConfig[],
    lipinski: [] as ColumnConfig[],
    flexibility: [] as ColumnConfig[],
    stereochemistry: [] as ColumnConfig[],
    druglikeness: [] as ColumnConfig[],
    other: [] as ColumnConfig[]
  };
  
  visibleColumns.value.forEach(col => {
    if (col.category) {
      grouped[col.category as keyof typeof grouped].push(col);
    } else {
      grouped.basic.push(col);
    }
  });
  
  return grouped;
});

// 计算属性：检查是否有描述符列可见
const hasDescriptorColumns = computed(() => {
  const group = groupedVisibleColumns.value;
  return group.structural.length > 0 || 
         group.lipinski.length > 0 || 
         group.flexibility.length > 0 || 
         group.stereochemistry.length > 0 || 
         group.druglikeness.length > 0;
});

// 合成优先级选项（录入时包含"不合成"选项）
const syntheticPriorityOptions = ref([
  { label: '高 (High)', value: 3 },
  { label: '中 (Medium)', value: 2 },
  { label: '低 (Low)', value: 1 },
  { label: '不合成 (No Synthesis)', value: 0 }
]);

// 合成优先级选项（包含"不合成"，用于显示）
const syntheticPriorityDisplayOptions = ref([
  { label: '高 (High)', value: 3 },
  { label: '中 (Medium)', value: 2 },
  { label: '低 (Low)', value: 1 },
  { label: '不合成 (No Synthesis)', value: 0 }
]);

// 获取优先级显示文本的辅助函数
const getPriorityLabel = (priority: number | null | undefined) => {
  if (priority === null || priority === undefined) return '-';
  const option = syntheticPriorityDisplayOptions.value.find(opt => opt.value === priority);
  return option ? option.label : `${priority}`;
};

// 获取合成状态显示文本
const getSynthesisStatusLabel = (status: number | null | undefined) => {
  if (status === null || status === undefined) return '未合成';
  switch (status) {
    case -1: return '未合成';
    case 0: return '合成中';
    case 1: return '已合成';
    default: return '未知状态';
  }
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

// 获取Lipinski违反数的样式类
const getLipinskiViolationClass = (violations: number | undefined) => {
  if (violations === undefined) return '';
  if (violations === 0) return 'lipinski-good';
  if (violations <= 1) return 'lipinski-warning';
  return 'lipinski-poor';
};

// 获取QED评分的样式类
const getQEDScoreClass = (qed: number | undefined) => {
  if (qed === undefined) return '';
  if (qed >= 0.7) return 'qed-excellent';
  if (qed >= 0.5) return 'qed-good';
  if (qed >= 0.3) return 'qed-fair';
  return 'qed-poor';
};

// 计算属性：验证过滤器是否有效
const isFilterValid = computed(() => {
  if (!filterOptions.value.smiles.trim()) return false;
  if (!filterOptions.value.similarity.trim()) return false;
  if (similarityError.value) return false;
  return true;
});

// 业务逻辑方法
// 分页事件处理
const onPageChange = async (event: any) => {
  console.log('Page change event:', event);
  const newPage = event.page + 1; // PrimeVue 分页器是从 0 开始的
  const newSize = event.rows;
  
  // 更新分页状态
  pageSize.value = newSize;
  
  // 使用当前选中的项目ID加载数据
  await loadTableData(newPage, newSize, selectedProject.value?.id, true);
};

const handleSave = () => {
  console.log('Save clicked');
  // 先获取最新的SMILES数据，然后显示确认对话框
  showSaveConfirmDialog.value = true;
};

const handleRefreshTable = async () => {
  await loadTableData(currentPage.value, pageSize.value, selectedProject.value?.id, true); // 包含不合成的化合物
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
    // 加载该项目的化合物数据（重置到第一页）
    await loadTableData(1, pageSize.value, project.id, true);
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
    
    // 重新加载表格数据以显示新项目的化合物（重置到第一页）
    await loadTableData(1, pageSize.value, pendingProject.value.id, true);
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
      synthetic_priority: inputs.value.syntheticPriority || undefined,
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

// 用户项目相关方法
const refreshUserProjects = async () => {
  if (!authStore.currentUser?.id) {
    console.warn('用户未登录，无法加载用户项目');
    userProjects.value = [];
    return;
  }
  
  // 如果是访客用户，不调用API，直接返回空列表
  if (authStore.currentUser.id.startsWith('guest-')) {
    console.log('访客用户，不加载项目列表');
    userProjects.value = [];
    return;
  }
  
  try {
    const projects = await userApi.getUserProjects(authStore.currentUser.id);
    userProjects.value = projects;
    console.log('用户项目加载成功:', projects);
  } catch (error) {
    console.error('加载用户项目失败:', error);
    userProjects.value = [];
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
  
  try {
    // 调用后端相似度搜索API
    const response = await CompoundApiService.searchSimilarCompounds({
      target_smiles: filterOptions.value.smiles,
      similarity_threshold: parseFloat(filterOptions.value.similarity),
      project_id: selectedProject.value?.id
    });
    
    console.log('相似度搜索结果:', response);
    
    // 更新表格数据为搜索结果
    if (response.results && response.results.length > 0) {
      // 1. 先聚合合成和活性信息
      const aggregatedResults = await aggregateCompoundsInfo(response.results);
      
      // 2. 获取项目名称映射并转换为TableRow格式
      const projectNameMap = new Map<string, string>();
      projects.value.forEach(project => {
        projectNameMap.set(project.id, project.name);
      });
      
      tableData.value = aggregatedResults.map(result => 
        aggregatedCompoundToTableRow(result, projectNameMap)
      );
      
      // 显示搜索结果信息
      alert(`相似度搜索完成！\n找到 ${response.total_found} 个相似化合物\n相似度阈值: ${response.similarity_threshold}\n目标分子: ${response.target_smiles}`);
    } else {
      // 没有找到相似化合物
      tableData.value = [];
      alert(`未找到相似度大于 ${response.similarity_threshold} 的化合物\n目标分子: ${response.target_smiles}`);
    }
    
    // 关闭抽屉
    closeFilterDrawer();
    
  } catch (error) {
    console.error('相似度搜索失败:', error);
    alert('相似度搜索失败，请检查输入参数或稍后重试');
  }
};

const clearFilter = async () => {
  console.log('清除过滤器');
  
  // 重置过滤选项
  filterOptions.value.smiles = '';
  filterOptions.value.similarity = '';
  similarityError.value = '';
  
  // 重新加载所有数据（重置到第一页）
  await loadTableData(1, pageSize.value, selectedProject.value?.id, true);
  
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

// 化合物编辑相关方法
const editCompound = (compound: any) => {
  console.log('编辑化合物原始数据:', compound);
  console.log('SMILES字段值:', compound.smiles);
  console.log('所有字段名:', Object.keys(compound));
  
  // 深拷贝化合物数据以避免直接修改原始数据
  editingCompound.value = {
    id: compound.id,
    name: compound.name || '',
    batch: compound.batch || '',
    smiles: compound.smiles || '',
    description: compound.description || '',
    synthetic_priority: compound.synthetic_priority || null,
    smilesImage: compound.smilesImage || '',
    create_time: compound.create_time,
    creator_id: compound.creator_id,
    project_id: compound.project_id,
    attachments: compound.attachments || []
  };
  
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  editingCompound.value = {};
};

const saveCompoundChanges = () => {
  // 验证必要字段
  if (!editingCompound.value.name?.trim()) {
    alert('化合物名称不能为空');
    return;
  }
  
  if (!editingCompound.value.smiles?.trim()) {
    alert('SMILES不能为空');
    return;
  }
  
  // 显示确认对话框
  showEditConfirmDialog.value = true;
};

const closeEditConfirmDialog = () => {
  showEditConfirmDialog.value = false;
};

const confirmSaveChanges = async () => {
  console.log('确认保存化合物修改');
  saveLoading.value = true;
  
  try {
    // 准备更新数据
    const updateData = {
      name: editingCompound.value.name.trim(),
      batch: editingCompound.value.batch ? parseInt(editingCompound.value.batch) : undefined,
      smiles: editingCompound.value.smiles.trim(),
      description: editingCompound.value.description?.trim() || undefined,
      synthetic_priority: editingCompound.value.synthetic_priority || undefined
    };
    
    console.log('更新化合物数据:', updateData);
    
    // 调用API更新化合物
    const updatedCompound = await CompoundApiService.updateCompound(editingCompound.value.id, updateData);
    
    console.log('化合物更新成功:', updatedCompound);
    alert(`化合物 "${updatedCompound.name}" 更新成功！`);
    
    // 关闭对话框
    closeEditConfirmDialog();
    closeEditDialog();
    
    // 刷新表格数据
    await loadTableData(1, 10, selectedProject.value?.id);
    
  } catch (error) {
    console.error('更新化合物失败:', error);
    alert('更新化合物失败，请稍后重试。');
  } finally {
    saveLoading.value = false;
  }
};

// 软删除化合物（设置合成优先级为0）
const softDeleteCompound = async (compound: any) => {
  const confirmed = confirm(`确定要删除化合物 "${compound.name}" 吗？\n\n删除后，该化合物将被标记为"不合成"状态，不会从数据库中彻底删除。`);
  
  if (!confirmed) {
    return;
  }
  
  try {
    console.log('软删除化合物:', compound);
    
    // 调用API更新化合物，将合成优先级设置为0
    const updateData = {
      synthetic_priority: 0  // 设置为"不合成"
    };
    
    const updatedCompound = await CompoundApiService.updateCompound(compound.id, updateData);
    
    console.log('化合物软删除成功:', updatedCompound);
    alert(`化合物 "${compound.name}" 已删除（标记为不合成状态）`);
    
    // 刷新表格数据以移除该化合物（因为列表只显示非0优先级的化合物）
    await loadTableData(1, 10, selectedProject.value?.id);
    
  } catch (error) {
    console.error('删除化合物失败:', error);
    alert('删除化合物失败，请稍后重试。');
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

// 化合物附件相关方法
const showCompoundUploadDialog = (compound: any) => {
  console.log('打开化合物附件上传对话框:', compound);
  uploadingCompound.value = compound;
  showCompoundAttachmentDialog.value = true;
};

const handleCompoundAttachmentUpload = async (uploadResults: any[]) => {
  if (!uploadingCompound.value || !uploadResults.length) return;
  
  try {
    console.log('化合物附件上传成功:', uploadResults);
    
    // 可以在这里更新化合物的附件信息，或者重新加载表格数据
    await loadTableData(currentPage.value, pageSize.value, selectedProject.value?.id, true);
    
    alert(`成功上传 ${uploadResults.length} 个附件到化合物 "${uploadingCompound.value.name}"`);
  } catch (error: any) {
    console.error('处理化合物附件上传失败:', error);
    alert('处理化合物附件上传时发生错误');
  }
};

const handleCompoundAttachmentError = (error: string) => {
  console.error('化合物附件上传失败:', error);
  alert('化合物附件上传失败: ' + error);
};

const downloadCompoundAttachment = (compound: any) => {
  console.log('下载化合物附件:', compound);
  
  if (!compound.attachments || compound.attachments.length === 0) {
    alert('该化合物没有附件');
    return;
  }
  
  // 如果只有一个附件，直接下载
  if (compound.attachments.length === 1) {
    const attachment = compound.attachments[0];
    try {
      const downloadUrl = `http://localhost:8001/api/v1/attachments/download/${attachment.id}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.file_name || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载附件失败:', error);
      alert('下载附件失败');
    }
  } else {
    // 如果有多个附件，提示用户选择或打开附件管理对话框
    alert(`该化合物有 ${compound.attachments.length} 个附件，请点击"上传附件"按钮查看和管理所有附件。`);
  }
};

// 初始化
const initialize = async () => {
  // 先加载列设置
  loadColumnSettings();
  
  // 确保用户已经认证
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth();
  }
  
  // 并行加载所有必要的数据
  await Promise.all([
    loadMainParameterOptions(),
    loadProjectTableData(),
    refreshUserProjects() // 加载用户项目列表而不是所有项目
  ]);
  
  // 默认加载所有化合物数据（不依赖项目筛选，包含不合成的化合物）
  await loadTableData(currentPage.value, pageSize.value, undefined, true);
  
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
  color: #495057;
  word-break: break-all;
  display: block;
  max-width: 100%;
}

.smiles-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
}

.smiles-image {
  max-width: 180px;
  max-height: 120px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 120px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  color: #666;
  font-style: italic;
  font-size: 0.8rem;
}

.attachments-cell {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.priority-cell {
  text-align: center;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

/* 合成状态显示样式 */
.synthesis-status-cell .status-not-started {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  min-width: 80px;
}

.synthesis-status-cell .status-in-progress {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  min-width: 80px;
}

.synthesis-status-cell .status-completed {
  background-color: #d1edff;
  color: #0c5460;
  border: 1px solid #bee5eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  min-width: 80px;
}

.synthesis-status-cell .status-unknown {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  min-width: 80px;
}

/* 合成状态列样式 */
.synthesis-status-cell {
  text-align: center;
  padding: 0.5rem;
}

.synthesis-yes {
  color: #28a745 !important;
  font-size: 1.2rem !important;
}

.synthesis-no {
  color: #dc3545 !important;
  font-size: 1.2rem !important;
}

.synthesis-yes:hover,
.synthesis-no:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* 数量汇总列样式 */
.quantity-cell {
  text-align: center;
  padding: 0.25rem 0.5rem;
}

.quantity-value {
  font-weight: 500;
  color: #495057;
  background-color: #e3f2fd;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  border: 1px solid #bbdefb;
  display: inline-block;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.quantity-value:hover {
  background-color: #bbdefb;
  border-color: #2196f3;
  cursor: help;
}

.no-quantity {
  color: #6c757d;
  font-style: italic;
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

/* 合并的SMILES列样式 */
.smiles-combined-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
  padding: 0.5rem;
}

.smiles-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60px;
  width: 100%;
}

.smiles-image-section .smiles-image {
  max-width: 180px;
  max-height: 120px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.smiles-image-section .no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 120px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  color: #666;
  font-style: italic;
  font-size: 0.8rem;
}

.smiles-text-section {
  text-align: center;
}

.smiles-text-section .smiles-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  word-break: break-all;
  text-align: center;
  color: #495057;
  line-height: 1.2;
  max-width: 153px; /* 85% of smiles image width (180px * 0.85) */
  overflow-wrap: break-word;
  white-space: normal; /* Allow line breaks */
}

/* 化合物编辑对话框样式 */
.edit-compound-dialog {
  max-width: 90vw;
  max-height: 90vh;
}

.edit-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.compound-structure-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
}

.compound-structure-section h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
  text-align: center;
}

.structure-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
}

.structure-image {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.compound-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.compound-edit-form h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-field label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.edit-input,
.edit-dropdown {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.edit-input:focus,
.edit-dropdown:focus {
  outline: 0;
  border-color: var(--p-primary-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.edit-input.smiles-input {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
}

.edit-textarea {
  width: 100%;
  min-height: 80px;
  max-height: 150px;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.edit-textarea:focus {
  outline: 0;
  border-color: var(--p-primary-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.readonly-info {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.readonly-info h4 {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 1rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.readonly-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f5;
}

.readonly-field:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.readonly-field label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.85rem;
  min-width: 100px;
}

.readonly-field span {
  color: #495057;
  font-size: 0.85rem;
  text-align: right;
  word-break: break-word;
  max-width: 60%;
}

.edit-modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.save-changes-btn {
  min-width: 140px;
}

/* 编辑确认对话框样式 */
.edit-confirm-dialog {
  max-width: 600px;
}

.edit-confirm-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 500px;
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

/* 化合物预览图片样式 */
.compound-preview-section {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  padding: 1rem;
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview-structure-image {
  max-width: 300px;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  object-fit: contain;
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

/* 描述符相关样式 */
.descriptor-cell {
  text-align: center;
  padding: 0.25rem 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

/* Lipinski违反数样式 */
.lipinski-good {
  color: #28a745;
  font-weight: 600;
}

.lipinski-warning {
  color: #ffc107;
  font-weight: 600;
}

.lipinski-poor {
  color: #dc3545;
  font-weight: 600;
}

/* QED评分样式 */
.qed-excellent {
  color: #28a745;
  font-weight: 600;
  background-color: #d4edda;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.qed-good {
  color: #155724;
  font-weight: 500;
  background-color: #d1ecf1;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.qed-fair {
  color: #856404;
  font-weight: 500;
  background-color: #fff3cd;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.qed-poor {
  color: #721c24;
  font-weight: 600;
  background-color: #f8d7da;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

/* 多级表头样式 */
.data-table ::v-deep(.p-datatable-thead > tr:first-child > th) {
  border-bottom: 1px solid #dee2e6;
  font-weight: bold;
  font-size: 0.95rem;
}

.data-table ::v-deep(.p-datatable-thead > tr:last-child > th) {
  border-top: none;
  font-size: 0.85rem;
}

/* 分类表头背景色调整 */
.data-table ::v-deep(.p-datatable-thead th[style*="background-color: #e3f2fd"]) {
  background-color: #e3f2fd !important;
  border-color: #bbdefb;
}

.data-table ::v-deep(.p-datatable-thead th[style*="background-color: #f3e5f5"]) {
  background-color: #f3e5f5 !important;
  border-color: #e1bee7;
}

.data-table ::v-deep(.p-datatable-thead th[style*="background-color: #e8f5e8"]) {
  background-color: #e8f5e8 !important;
  border-color: #c8e6c9;
}

.data-table ::v-deep(.p-datatable-thead th[style*="background-color: #fff3e0"]) {
  background-color: #fff3e0 !important;
  border-color: #ffcc02;
}

.data-table ::v-deep(.p-datatable-thead th[style*="background-color: #fce4ec"]) {
  background-color: #fce4ec !important;
  border-color: #f8bbd9;
}

/* 化合物附件对话框样式 */
.compound-attachment-dialog {
  max-width: 700px;
}

.compound-attachment-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.compound-info {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid var(--p-primary-color);
}

.compound-info h4 {
  margin: 0 0 0.75rem 0;
  color: var(--p-primary-color);
}

.compound-info p {
  margin: 0.5rem 0;
  color: #333;
}

.compound-structure-preview {
  margin-top: 1rem;
}

.compound-structure-preview label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--p-primary-color);
}

.structure-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.structure-preview-image {
  max-width: 200px;
  max-height: 150px;
  border-radius: 4px;
}

.upload-section h4 {
  margin: 0 0 1rem 0;
  color: var(--p-primary-color);
}

/* 附件列样式 */
.attachments-cell {
  text-align: center;
  font-size: 0.9rem;
}

.has-attachments {
  color: #28a745;
  font-weight: 500;
}

.has-attachments .pi {
  margin-right: 0.25rem;
}

.no-attachments {
  color: #6c757d;
  font-style: italic;
}

/* 附件按钮样式 */
.attach-btn {
  color: #f57c00 !important;
  border-color: #f57c00 !important;
}

.attach-btn:hover {
  background-color: #f57c00 !important;
  color: white !important;
}

.download-btn {
  color: #388e3c !important;
  border-color: #388e3c !important;
}

.download-btn:hover {
  background-color: #388e3c !important;
  color: white !important;
}

/* 操作按钮间距调整 */
.action-buttons {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
}

.action-btn {
  min-width: 2rem;
  height: 2rem;
}
</style>
