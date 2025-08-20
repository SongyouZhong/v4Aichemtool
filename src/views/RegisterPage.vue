<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h2>用户注册</h2>
          <p>请填写您的基本信息完成注册</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="name">姓名 *</label>
            <InputText
              id="name"
              v-model="registerForm.name"
              placeholder="请输入您的姓名"
              :class="{ 'p-invalid': errors.name }"
              required
            />
            <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
          </div>

          <div class="form-group">
            <label for="phone">手机号 *</label>
            <InputText
              id="phone"
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              :class="{ 'p-invalid': errors.phone }"
              required
            />
            <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
          </div>

          <div class="form-group">
            <label for="department">部门 *</label>
            <Dropdown
              id="department"
              v-model="registerForm.department"
              :options="departmentOptions"
              option-label="label"
              option-value="value"
              placeholder="请选择部门"
              :class="{ 'p-invalid': errors.department }"
              required
            />
            <small v-if="errors.department" class="p-error">{{ errors.department }}</small>
          </div>

          <div class="form-group">
            <label for="password">密码 *</label>
            <Password
              id="password"
              v-model="registerForm.password"
              placeholder="请输入密码（至少6位）"
              :class="{ 'p-invalid': errors.password }"
              :feedback="false"
              toggle-mask
              required
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">确认密码 *</label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="请再次输入密码"
              :class="{ 'p-invalid': errors.confirmPassword }"
              :feedback="false"
              toggle-mask
              required
            />
            <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
          </div>

          <div class="form-actions">
            <Button
              type="submit"
              label="注册"
              :loading="loading"
              class="register-button"
            />
            <Button
              type="button"
              label="返回登录"
              severity="secondary"
              text
              @click="goToLogin"
              class="login-link"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { userApi } from '@/services/userApi'
import type { UserRegister } from '@/types/user'

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const confirmPassword = ref('')

const registerForm = reactive<UserRegister>({
  name: '',
  phone: '',
  department: '',
  password: ''
})

const errors = reactive({
  name: '',
  phone: '',
  department: '',
  password: '',
  confirmPassword: ''
})

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

const validateForm = () => {
  // 清空错误信息
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // 验证姓名
  if (!registerForm.name.trim()) {
    errors.name = '请输入姓名'
    isValid = false
  }

  // 验证手机号
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!registerForm.phone.trim()) {
    errors.phone = '请输入手机号'
    isValid = false
  } else if (!phoneRegex.test(registerForm.phone)) {
    errors.phone = '请输入正确的手机号格式'
    isValid = false
  }

  // 验证部门
  if (!registerForm.department) {
    errors.department = '请选择部门'
    isValid = false
  }

  // 验证密码
  if (!registerForm.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (registerForm.password.length < 6) {
    errors.password = '密码长度至少6位'
    isValid = false
  }

  // 验证确认密码
  if (!confirmPassword.value) {
    errors.confirmPassword = '请确认密码'
    isValid = false
  } else if (confirmPassword.value !== registerForm.password) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // 检查手机号是否已存在
    const phoneExists = await userApi.checkPhoneExists(registerForm.phone)
    if (phoneExists) {
      errors.phone = '该手机号已被注册'
      loading.value = false
      return
    }

    // 注册用户
    await userApi.registerUser(registerForm)

    toast.add({
      severity: 'success',
      summary: '注册成功',
      detail: '您的注册申请已提交，请等待管理员审批',
      life: 3000
    })

    // 跳转到登录页面
    router.push('/login')
  } catch (error: any) {
    console.error('注册失败:', error)
    toast.add({
      severity: 'error',
      summary: '注册失败',
      detail: error.message || '注册过程中发生错误，请稍后重试',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--p-primary-color) 0%, #667eea 100%);
  padding: 2rem;
}

.register-container {
  width: 100%;
  max-width: 500px;
}

.register-card {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h2 {
  color: var(--p-primary-color);
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 600;
}

.register-header p {
  color: #666;
  font-size: 0.95rem;
}

.register-form {
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

.form-group :deep(.p-inputtext),
.form-group :deep(.p-password),
.form-group :deep(.p-dropdown) {
  height: 48px;
}

.form-group :deep(.p-password-input) {
  width: 100%;
}

.p-error {
  color: var(--p-red-500);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 500;
}

.login-link {
  color: var(--p-primary-color);
  text-decoration: none;
  font-size: 0.95rem;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-page {
    padding: 1rem;
  }
  
  .register-card {
    padding: 2rem;
  }
  
  .register-header h2 {
    font-size: 1.5rem;
  }
}
</style>
