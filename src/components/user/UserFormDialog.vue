<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="mode === 'create' ? '新增用户' : '编辑用户'"
    :modal="true"
    :style="{ width: '450px' }"
    class="user-form-dialog"
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
          :options="departmentOptions"
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
          :loading="loading"
          class="p-button-primary"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserManagement } from '@/composables/useUserManagement'
import type { User, UserCreate, UserUpdate } from '@/types/user'

interface Props {
  visible: boolean
  user?: User | null
  mode: 'create' | 'edit'
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: UserCreate | UserUpdate): void
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  mode: 'create'
})

const emit = defineEmits<Emits>()

// 组合式函数
const { departmentOptions, checkPhoneExists } = useUserManagement()

// 响应式数据
const loading = ref(false)
const formData = ref<UserCreate>({
  name: '',
  phone: '',
  department: ''
})

const errors = ref<Record<string, string>>({})

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const filteredDepartmentOptions = computed(() => 
  departmentOptions.filter(option => option.value !== '')
)

/**
 * 重置表单
 */
const resetForm = () => {
  formData.value = {
    name: '',
    phone: '',
    department: ''
  }
  errors.value = {}
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
  } else {
    // 检查手机号是否已存在（编辑模式下排除当前用户）
    const phoneExists = await checkPhoneExists(formData.value.phone.trim())
    if (phoneExists && (props.mode === 'create' || formData.value.phone !== props.user?.phone)) {
      errors.value.phone = '该手机号已存在'
      isValid = false
    }
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
  loading.value = true
  
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

    emit('save', submitData)
  } finally {
    loading.value = false
  }
}

/**
 * 处理取消
 */
const handleCancel = () => {
  dialogVisible.value = false
}

// 监听用户数据变化
watch(
  () => props.user,
  (newUser) => {
    if (newUser && props.mode === 'edit') {
      formData.value = {
        name: newUser.name,
        phone: newUser.phone,
        department: newUser.department
      }
    }
  },
  { immediate: true }
)

// 监听对话框显示状态
watch(dialogVisible, (visible) => {
  if (visible) {
    if (props.mode === 'create') {
      resetForm()
    }
  }
})
</script>

<style scoped>
.user-form-dialog {
  font-family: var(--font-family);
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
</style>
