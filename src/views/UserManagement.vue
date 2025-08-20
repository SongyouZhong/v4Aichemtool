<template>
  <div class="user-management">
    <div class="page-header">
      <h1>用户管理</h1>
      <div class="header-actions">
        <Button
          label="新增用户"
          icon="pi pi-plus"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filters">
      <div class="search-row">
        <div class="search-item">
          <label>姓名/手机号</label>
          <InputText
            v-model="searchQuery.keyword"
            placeholder="请输入姓名或手机号"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="search-item">
          <label>部门</label>
          <Dropdown
            v-model="searchQuery.department"
            :options="departmentOptions"
            option-label="label"
            option-value="value"
            placeholder="选择部门"
            show-clear
          />
        </div>
        <div class="search-item">
          <label>状态</label>
          <Dropdown
            v-model="searchQuery.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="选择状态"
            show-clear
          />
        </div>
        <div class="search-item">
          <label>角色</label>
          <Dropdown
            v-model="searchQuery.role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            placeholder="选择角色"
            show-clear
          />
        </div>
      </div>
      <div class="search-actions">
        <Button
          label="搜索"
          icon="pi pi-search"
          @click="handleSearch"
        />
        <Button
          label="重置"
          icon="pi pi-refresh"
          severity="secondary"
          @click="handleReset"
        />
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="table-container">
      <DataTable
        :value="users"
        :loading="loading"
        paginator
        :rows="pageSize"
        :total-records="totalRecords"
        :lazy="true"
        @page="onPageChange"
        show-gridlines
        striped-rows
        responsive-layout="scroll"
      >
        <Column field="name" header="姓名" sortable>
          <template #body="{ data }">
            <span class="user-name">{{ data.name }}</span>
          </template>
        </Column>
        
        <Column field="phone" header="手机号" sortable>
          <template #body="{ data }">
            <span class="user-phone">{{ data.phone }}</span>
          </template>
        </Column>
        
        <Column field="department" header="部门" sortable>
          <template #body="{ data }">
            <span class="user-department">{{ data.department }}</span>
          </template>
        </Column>
        
        <Column field="role" header="角色" sortable>
          <template #body="{ data }">
            <Tag
              :value="getRoleLabel(data.role)"
              :severity="getRoleSeverity(data.role)"
            />
          </template>
        </Column>
        
        <Column field="status" header="状态" sortable>
          <template #body="{ data }">
            <Tag
              :value="getStatusLabel(data.status)"
              :severity="getStatusSeverity(data.status)"
            />
          </template>
        </Column>
        
        <Column field="create_time" header="创建时间" sortable>
          <template #body="{ data }">
            <span>{{ formatDateTime(data.create_time) }}</span>
          </template>
        </Column>
        
        <Column header="操作" :exportable="false">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button
                icon="pi pi-pencil"
                severity="info"
                text
                rounded
                @click="editUser(data)"
                v-tooltip.top="'编辑'"
              />
              <Button
                icon="pi pi-check"
                severity="success"
                text
                rounded
                @click="approveUser(data)"
                v-tooltip.top="'审批'"
                v-if="data.status === UserStatus.PENDING"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                @click="deleteUser(data)"
                v-tooltip.top="'删除'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- 创建/编辑用户对话框 -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="editingUser ? '编辑用户' : '新增用户'"
      modal
      :style="{ width: '500px' }"
    >
      <form @submit.prevent="handleSaveUser" class="user-form">
        <div class="form-group">
          <label for="userName">姓名 *</label>
          <InputText
            id="userName"
            v-model="userForm.name"
            placeholder="请输入姓名"
            :class="{ 'p-invalid': formErrors.name }"
            required
          />
          <small v-if="formErrors.name" class="p-error">{{ formErrors.name }}</small>
        </div>

        <div class="form-group">
          <label for="userPhone">手机号 *</label>
          <InputText
            id="userPhone"
            v-model="userForm.phone"
            placeholder="请输入手机号"
            :class="{ 'p-invalid': formErrors.phone }"
            required
          />
          <small v-if="formErrors.phone" class="p-error">{{ formErrors.phone }}</small>
        </div>

        <div class="form-group">
          <label for="userDepartment">部门 *</label>
          <Dropdown
            id="userDepartment"
            v-model="userForm.department"
            :options="departmentOptions"
            option-label="label"
            option-value="value"
            placeholder="请选择部门"
            :class="{ 'p-invalid': formErrors.department }"
            required
          />
          <small v-if="formErrors.department" class="p-error">{{ formErrors.department }}</small>
        </div>

        <div class="form-group" v-if="!editingUser">
          <label for="userPassword">密码 *</label>
          <Password
            id="userPassword"
            v-model="userForm.password"
            placeholder="请输入密码（至少6位）"
            :class="{ 'p-invalid': formErrors.password }"
            :feedback="false"
            toggle-mask
            required
          />
          <small v-if="formErrors.password" class="p-error">{{ formErrors.password }}</small>
        </div>

        <div class="form-group">
          <label for="userRole">角色</label>
          <Dropdown
            id="userRole"
            v-model="userForm.role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            placeholder="请选择角色"
          />
        </div>

        <div class="dialog-actions">
          <Button
            label="取消"
            severity="secondary"
            @click="showCreateDialog = false"
          />
          <Button
            type="submit"
            :label="editingUser ? '更新' : '创建'"
            :loading="saving"
          />
        </div>
      </form>
    </Dialog>

    <!-- 审批对话框 -->
    <Dialog
      v-model:visible="showApprovalDialog"
      header="用户审批"
      modal
      :style="{ width: '400px' }"
    >
      <div class="approval-form">
        <p>确认审批用户：<strong>{{ approvalUser?.name }}</strong></p>
        
        <div class="form-group">
          <label>审批状态</label>
          <div class="approval-options">
            <div class="approval-option">
              <RadioButton
                v-model="approvalForm.status"
                input-id="approve"
                :value="UserStatus.APPROVED"
              />
              <label for="approve">通过</label>
            </div>
            <div class="approval-option">
              <RadioButton
                v-model="approvalForm.status"
                input-id="reject"
                :value="UserStatus.REJECTED"
              />
              <label for="reject">拒绝</label>
            </div>
          </div>
        </div>

        <div class="form-group" v-if="approvalForm.status === UserStatus.APPROVED">
          <label>分配角色</label>
          <Dropdown
            v-model="approvalForm.role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            placeholder="请选择角色"
          />
        </div>

        <div class="dialog-actions">
          <Button
            label="取消"
            severity="secondary"
            @click="showApprovalDialog = false"
          />
          <Button
            label="确认"
            @click="handleApproval"
            :loading="approving"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Password from 'primevue/password'
import RadioButton from 'primevue/radiobutton'
import { userApi } from '@/services/userApi'
import type { User, UserCreate, UserUpdate } from '@/types/user'
import { UserStatus, UserRole } from '@/types/user'

const toast = useToast()
const confirm = useConfirm()

// 数据状态
const users = ref<User[]>([])
const loading = ref(false)
const saving = ref(false)
const approving = ref(false)
const totalRecords = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 搜索条件
const searchQuery = reactive({
  keyword: '',
  department: '',
  status: '',
  role: ''
})

// 对话框状态
const showCreateDialog = ref(false)
const showApprovalDialog = ref(false)
const editingUser = ref<User | null>(null)
const approvalUser = ref<User | null>(null)

// 表单数据
const userForm = reactive<UserCreate>({
  name: '',
  phone: '',
  department: '',
  password: '',
  role: UserRole.USER
})

const approvalForm = reactive({
  status: UserStatus.APPROVED,
  role: UserRole.USER
})

const formErrors = reactive({
  name: '',
  phone: '',
  department: '',
  password: ''
})

// 选项数据
const departmentOptions = [
  { label: '研发部', value: '研发部' },
  { label: '市场部', value: '市场部' },
  { label: '销售部', value: '销售部' },
  { label: '运营部', value: '运营部' },
  { label: '技术部', value: '技术部' },
  { label: '财务部', value: '财务部' },
  { label: '人事部', value: '人事部' },
  { label: '其他', value: '其他' }
]

const statusOptions = [
  { label: '待审批', value: UserStatus.PENDING },
  { label: '已审批', value: UserStatus.APPROVED },
  { label: '已拒绝', value: UserStatus.REJECTED },
  { label: '活跃', value: UserStatus.ACTIVE }
]

const roleOptions = [
  { label: '用户', value: UserRole.USER },
  { label: '管理员', value: UserRole.ADMIN },
  { label: '经理', value: UserRole.MANAGER }
]

// 工具函数
const getRoleLabel = (role: string) => {
  const option = roleOptions.find(opt => opt.value === role)
  return option?.label || role
}

const getRoleSeverity = (role: string) => {
  switch (role) {
    case UserRole.ADMIN: return 'danger'
    case UserRole.MANAGER: return 'warning'
    default: return 'info'
  }
}

const getStatusLabel = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option?.label || status
}

const getStatusSeverity = (status: string) => {
  switch (status) {
    case UserStatus.PENDING: return 'warning'
    case UserStatus.APPROVED: 
    case UserStatus.ACTIVE: return 'success'
    case UserStatus.REJECTED: return 'danger'
    default: return 'info'
  }
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 数据操作
const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...searchQuery
    }
    const response = await userApi.getUsers(params)
    users.value = response.items
    totalRecords.value = response.total
  } catch (error) {
    console.error('加载用户列表失败:', error)
    toast.add({
      severity: 'error',
      summary: '加载失败',
      detail: '无法加载用户列表',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handleReset = () => {
  Object.keys(searchQuery).forEach(key => {
    searchQuery[key as keyof typeof searchQuery] = ''
  })
  currentPage.value = 1
  loadUsers()
}

const onPageChange = (event: any) => {
  currentPage.value = event.page + 1
  loadUsers()
}

// 用户操作
const resetUserForm = () => {
  userForm.name = ''
  userForm.phone = ''
  userForm.department = ''
  userForm.password = ''
  userForm.role = UserRole.USER
  
  Object.keys(formErrors).forEach(key => {
    formErrors[key as keyof typeof formErrors] = ''
  })
}

const validateUserForm = () => {
  Object.keys(formErrors).forEach(key => {
    formErrors[key as keyof typeof formErrors] = ''
  })

  let isValid = true

  if (!userForm.name.trim()) {
    formErrors.name = '请输入姓名'
    isValid = false
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!userForm.phone.trim()) {
    formErrors.phone = '请输入手机号'
    isValid = false
  } else if (!phoneRegex.test(userForm.phone)) {
    formErrors.phone = '请输入正确的手机号格式'
    isValid = false
  }

  if (!userForm.department) {
    formErrors.department = '请选择部门'
    isValid = false
  }

  if (!editingUser.value && !userForm.password) {
    formErrors.password = '请输入密码'
    isValid = false
  } else if (!editingUser.value && userForm.password.length < 6) {
    formErrors.password = '密码长度至少6位'
    isValid = false
  }

  return isValid
}

const handleSaveUser = async () => {
  if (!validateUserForm()) {
    return
  }

  saving.value = true
  try {
    if (editingUser.value) {
      // 更新用户
      const updateData: UserUpdate = {
        name: userForm.name,
        phone: userForm.phone,
        department: userForm.department,
        role: userForm.role
      }
      await userApi.updateUser(editingUser.value.id, updateData)
      toast.add({
        severity: 'success',
        summary: '更新成功',
        detail: '用户信息更新成功',
        life: 3000
      })
    } else {
      // 创建用户
      await userApi.createUser(userForm)
      toast.add({
        severity: 'success',
        summary: '创建成功',
        detail: '用户创建成功',
        life: 3000
      })
    }
    
    showCreateDialog.value = false
    editingUser.value = null
    resetUserForm()
    loadUsers()
  } catch (error: any) {
    console.error('保存用户失败:', error)
    toast.add({
      severity: 'error',
      summary: '保存失败',
      detail: error.message || '保存用户时发生错误',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  userForm.name = user.name
  userForm.phone = user.phone
  userForm.department = user.department
  userForm.role = user.role
  userForm.password = '' // 编辑时不需要密码
  showCreateDialog.value = true
}

const approveUser = (user: User) => {
  approvalUser.value = user
  approvalForm.status = UserStatus.APPROVED
  approvalForm.role = UserRole.USER
  showApprovalDialog.value = true
}

const handleApproval = async () => {
  if (!approvalUser.value) return

  approving.value = true
  try {
    // 调用审批API
    await userApi.approveUser(approvalUser.value.id, {
      status: approvalForm.status,
      role: approvalForm.role
    })
    
    toast.add({
      severity: 'success',
      summary: '审批成功',
      detail: '用户审批操作完成',
      life: 3000
    })
    
    showApprovalDialog.value = false
    approvalUser.value = null
    loadUsers()
  } catch (error: any) {
    console.error('审批失败:', error)
    toast.add({
      severity: 'error',
      summary: '审批失败',
      detail: error.message || '审批操作失败',
      life: 3000
    })
  } finally {
    approving.value = false
  }
}

const deleteUser = (user: User) => {
  confirm.require({
    message: `确定要删除用户 "${user.name}" 吗？`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await userApi.deleteUser(user.id)
        toast.add({
          severity: 'success',
          summary: '删除成功',
          detail: '用户删除成功',
          life: 3000
        })
        loadUsers()
      } catch (error: any) {
        console.error('删除用户失败:', error)
        toast.add({
          severity: 'error',
          summary: '删除失败',
          detail: error.message || '删除用户时发生错误',
          life: 3000
        })
      }
    }
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: var(--p-primary-color);
  margin: 0;
}

.search-filters {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-item {
  display: flex;
  flex-direction: column;
}

.search-item label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.search-actions {
  display: flex;
  gap: 1rem;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.user-form {
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
  font-weight: 500;
  color: #333;
}

.p-error {
  color: var(--p-red-500);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.approval-form {
  padding: 1rem 0;
}

.approval-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.approval-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  font-weight: 500;
}

.user-phone {
  font-family: monospace;
}

.user-department {
  color: #666;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-row {
    grid-template-columns: 1fr;
  }
  
  .search-actions {
    flex-direction: column;
  }
}
</style>
