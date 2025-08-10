<template>
  <div class="user-management-simple">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <p class="page-description">管理系统用户信息</p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <Button
          label="新增用户"
          icon="pi pi-plus"
          @click="showCreateDialog = true"
          class="p-button-primary"
        />
        <Button
          label="刷新"
          icon="pi pi-refresh"
          @click="fetchUsers"
          class="p-button-outlined"
        />
      </div>
      
      <div class="toolbar-right">
        <Dropdown
          v-model="queryParams.department"
          :options="departmentOptions"
          option-label="label"
          option-value="value"
          placeholder="选择部门"
          @change="onDepartmentChange"
          class="department-filter"
        />
      </div>
    </div>

    <!-- 数据表格 -->
    <Card class="table-card">
      <template #content>
        <DataTable
          :value="users"
          :loading="loading"
          responsive-layout="scroll"
          class="user-table"
        >
          <Column field="name" header="姓名" sortable>
            <template #body="{ data }">
              <div class="user-name">
                <Avatar 
                  :label="data.name.charAt(0)" 
                  class="user-avatar"
                  shape="circle"
                />
                <span>{{ data.name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="phone" header="手机号码" sortable />
          
          <Column field="department" header="部门" sortable>
            <template #body="{ data }">
              <Tag :value="data.department" class="department-tag" />
            </template>
          </Column>
          
          <Column field="create_time" header="创建时间" sortable>
            <template #body="{ data }">
              <span class="create-time">{{ formatDateTime(data.create_time) }}</span>
            </template>
          </Column>
          
          <Column header="操作" :style="{ width: '12rem' }">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  @click="editUser(data)"
                  class="p-button-rounded p-button-text p-button-primary"
                  v-tooltip.top="'编辑'"
                />
                <Button
                  icon="pi pi-trash"
                  @click="confirmDeleteUser(data)"
                  class="p-button-rounded p-button-text p-button-danger"
                  v-tooltip.top="'删除'"
                />
              </div>
            </template>
          </Column>
          
          <template #empty>
            <div class="empty-state">
              <i class="pi pi-users empty-icon"></i>
              <p>暂无用户数据</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- 用户表单对话框 -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="dialogMode === 'create' ? '新增用户' : '编辑用户'"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <form @submit.prevent="handleSubmit" class="user-form">
        <div class="form-group">
          <label for="name" class="form-label">姓名 <span class="required">*</span></label>
          <InputText
            id="name"
            v-model="formData.name"
            placeholder="请输入用户姓名"
            :class="{ 'p-invalid': errors.name }"
            class="form-input"
          />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>

        <div class="form-group">
          <label for="phone" class="form-label">手机号码 <span class="required">*</span></label>
          <InputText
            id="phone"
            v-model="formData.phone"
            placeholder="请输入手机号码"
            :class="{ 'p-invalid': errors.phone }"
            class="form-input"
            maxlength="11"
          />
          <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
        </div>

        <div class="form-group">
          <label for="department" class="form-label">部门 <span class="required">*</span></label>
          <Dropdown
            id="department"
            v-model="formData.department"
            :options="filteredDepartmentOptions"
            option-label="label"
            option-value="value"
            placeholder="请选择部门"
            :class="{ 'p-invalid': errors.department }"
            class="form-input"
          />
          <small v-if="errors.department" class="p-error">{{ errors.department }}</small>
        </div>
      </form>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="取消"
            icon="pi pi-times"
            @click="handleCancel"
            class="p-button-text"
          />
          <Button
            label="保存"
            icon="pi pi-check"
            @click="handleSubmit"
            :loading="submitLoading"
            class="p-button-primary"
          />
        </div>
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import userApi from '@/services/userApi'
import type { User, UserCreate, UserUpdate } from '@/types/user'

const toast = useToast()
const confirm = useConfirm()

// 响应式数据
const users = ref<User[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const showCreateDialog = ref(false)
const selectedUser = ref<User | null>(null)
const dialogMode = ref<'create' | 'edit'>('create')

const queryParams = reactive({
  page: 1,
  size: 10,
  department: undefined as string | undefined
})

const formData = ref<UserCreate>({
  name: '',
  phone: '',
  department: ''
})

const errors = ref<Record<string, string>>({})

// 部门选项
const departmentOptions = [
  { label: '全部部门', value: '' },
  { label: '技术部', value: '技术部' },
  { label: '研发部', value: '研发部' },
  { label: '市场部', value: '市场部' },
  { label: '销售部', value: '销售部' },
  { label: '人事部', value: '人事部' },
  { label: '财务部', value: '财务部' },
  { label: '运营部', value: '运营部' },
  { label: '客服部', value: '客服部' }
]

// 计算属性
const filteredDepartmentOptions = computed(() => 
  departmentOptions.filter(option => option.value !== '')
)

/**
 * 获取用户列表
 */
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await userApi.getUsers(queryParams)
    users.value = response.items
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: `获取用户列表失败: ${error.message}`,
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

/**
 * 编辑用户
 */
const editUser = (user: User) => {
  selectedUser.value = user
  dialogMode.value = 'edit'
  formData.value = {
    name: user.name,
    phone: user.phone,
    department: user.department
  }
  showCreateDialog.value = true
}

/**
 * 确认删除用户
 */
const confirmDeleteUser = (user: User) => {
  confirm.require({
    message: `确定要删除用户 "${user.name}" 吗？`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: '删除',
    rejectLabel: '取消',
    accept: async () => {
      try {
        await userApi.deleteUser(user.id)
        toast.add({
          severity: 'success',
          summary: '成功',
          detail: '用户删除成功',
          life: 3000
        })
        await fetchUsers()
      } catch (error: any) {
        toast.add({
          severity: 'error',
          summary: '错误',
          detail: `删除用户失败: ${error.message}`,
          life: 3000
        })
      }
    }
  })
}

/**
 * 验证表单
 */
const validateForm = async (): Promise<boolean> => {
  errors.value = {}
  let isValid = true

  // 验证姓名
  if (!formData.value.name.trim()) {
    errors.value.name = '请输入用户姓名'
    isValid = false
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = '姓名至少2个字符'
    isValid = false
  }

  // 验证手机号
  if (!formData.value.phone.trim()) {
    errors.value.phone = '请输入手机号码'
    isValid = false
  } else if (!/^1[3-9]\d{9}$/.test(formData.value.phone.trim())) {
    errors.value.phone = '请输入正确的手机号码'
    isValid = false
  }

  // 验证部门
  if (!formData.value.department.trim()) {
    errors.value.department = '请选择部门'
    isValid = false
  }

  return isValid
}

/**
 * 处理提交
 */
const handleSubmit = async () => {
  submitLoading.value = true
  
  try {
    const isValid = await validateForm()
    if (!isValid) {
      return
    }

    const submitData = {
      name: formData.value.name.trim(),
      phone: formData.value.phone.trim(),
      department: formData.value.department.trim()
    }

    if (dialogMode.value === 'create') {
      await userApi.createUser(submitData)
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '用户创建成功',
        life: 3000
      })
    } else {
      await userApi.updateUser(selectedUser.value!.id, submitData)
      toast.add({
        severity: 'success',
        summary: '成功',
        detail: '用户信息更新成功',
        life: 3000
      })
    }

    showCreateDialog.value = false
    selectedUser.value = null
    await fetchUsers()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: `操作失败: ${error.message}`,
      life: 3000
    })
  } finally {
    submitLoading.value = false
  }
}

/**
 * 处理取消
 */
const handleCancel = () => {
  showCreateDialog.value = false
  selectedUser.value = null
  formData.value = {
    name: '',
    phone: '',
    department: ''
  }
  errors.value = {}
}

/**
 * 部门筛选变化处理
 */
const onDepartmentChange = () => {
  queryParams.page = 1
  fetchUsers()
}

// 初始化
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management-simple {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: var(--text-color-secondary);
  margin: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.toolbar-left {
  display: flex;
  gap: 0.5rem;
}

.department-filter {
  min-width: 150px;
}

.table-card {
  margin: 0;
}

.user-table {
  font-size: 0.9rem;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  font-size: 0.8rem;
}

.department-tag {
  font-size: 0.8rem;
}

.create-time {
  color: var(--text-color-secondary);
  font-size: 0.85rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-color-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.user-form {
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.required {
  color: var(--red-500);
}

.form-input {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 1rem;
}

.p-error {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-left {
    justify-content: center;
  }
}
</style>
