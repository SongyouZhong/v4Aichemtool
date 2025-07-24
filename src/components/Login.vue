<template>
  <div class="login-container">
    <Card class="login-card">
      <template #header>
        <div class="login-header">
          <h2>Login</h2>
          <p>Please enter your credentials to continue</p>
        </div>
      </template>
      
      <template #content>
        <div class="login-form">
          <div class="field">
            <label for="username">Username</label>
            <InputText 
              id="username" 
              v-model="loginForm.username" 
              :class="{ 'p-invalid': errors.username }"
              placeholder="Enter your username"
            />
            <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
          </div>
          
          <div class="field">
            <label for="password">Password</label>
            <Password 
              id="password" 
              v-model="loginForm.password" 
              :class="{ 'p-invalid': errors.password }"
              :feedback="false"
              :toggle-mask="true"
              placeholder="Enter your password"
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>
          
          <div class="field-checkbox">
            <Checkbox id="remember" v-model="loginForm.remember" binary />
            <label for="remember">Remember me</label>
          </div>
          
          <Button 
            label="Sign In" 
            icon="pi pi-sign-in"
            @click="handleLogin"
            :loading="loading"
            class="w-full"
          />
        </div>
      </template>
      
      <template #footer>
        <div class="login-footer">
          <p>
            <a href="#" @click.prevent="forgotPassword">Forgot your password?</a>
          </p>
          <p>
            Don't have an account? <a href="#" @click.prevent="signUp">Sign up</a>
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineEmits } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

// 定义事件发射器
const emit = defineEmits(['loginSuccess']);

// Form data
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

// Validation errors
const errors = reactive({
  username: '',
  password: ''
});

// Loading state
const loading = ref(false);

// Validate form
const validateForm = () => {
  // Clear previous errors
  errors.username = '';
  errors.password = '';
  
  let isValid = true;
  
  // Check username
  if (!loginForm.username.trim()) {
    errors.username = 'Username is required';
    isValid = false;
  }
  
  // Check password
  if (!loginForm.password) {
    errors.password = 'Password is required';
    isValid = false;
  }
  
  return isValid;
};

// Handle login
const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  
  try {
    // This is where you would integrate with your backend API
    // For now, we'll simulate an API call
    await loginAPI(loginForm.username, loginForm.password);
    
    // On successful login, notify parent component
    // Store auth state in localStorage if "remember me" is checked
    if (loginForm.remember) {
      localStorage.setItem('user', JSON.stringify({ username: loginForm.username }));
    }
    
    // Emit login success event
    emit('loginSuccess', { username: loginForm.username });
  } catch (error) {
    // Handle login error
    console.error('Login failed:', error);
    // You would show an error message to the user here
  } finally {
    loading.value = false;
  }
};

// Simulate API call - this is where you would integrate with your backend
const loginAPI = (username: string, password: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // In a real app, you would make an HTTP request to your backend
      // For demo purposes, we'll accept any non-empty username and password
      if (username && password) {
        // Store auth state in localStorage if "remember me" is checked
        if (loginForm.remember) {
          localStorage.setItem('user', JSON.stringify({ username }));
        }
        resolve();
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

// Forgot password handler
const forgotPassword = () => {
  // In a real app, you would navigate to a forgot password page or show a dialog
  alert('Forgot password functionality would be implemented here');
};

// Sign up handler
const signUp = () => {
  // In a real app, you would navigate to a registration page
  alert('Sign up functionality would be implemented here');
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: var(--p-surface-ground);
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  padding: 1.5rem 1rem 0;
}

.login-header h2 {
  margin-bottom: 0.5rem;
  color: var(--p-text-color);
}

.login-header p {
  color: var(--p-text-muted-color);
  margin: 0;
}

.login-form {
  padding: 1rem;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.field-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.field-checkbox label {
  margin-left: 0.5rem;
  margin-bottom: 0;
}

.login-footer {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid var(--p-content-border-color);
}

.login-footer p {
  margin: 0.5rem 0;
  color: var(--p-text-muted-color);
}

.login-footer a {
  color: var(--p-primary-color);
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

.p-error {
  display: block;
  margin-top: 0.25rem;
}

.w-full {
  width: 100%;
}
</style>