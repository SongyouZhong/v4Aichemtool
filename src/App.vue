<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Homepage from './components/Homepage.vue'
import Login from './components/Login.vue'

// Check if user is authenticated
const isAuthenticated = ref(false);
const checkingAuth = ref(true);

onMounted(() => {
  // Check if user data exists in localStorage
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      JSON.parse(userData);
      isAuthenticated.value = true;
    } catch (e) {
      // Invalid user data, remove it
      localStorage.removeItem('user');
    }
  }
  checkingAuth.value = false;
});

const handleLoginSuccess = (userData: { username: string }) => {
  // Update authentication state
  isAuthenticated.value = true;
};

const handleLogout = () => {
  localStorage.removeItem('user');
  isAuthenticated.value = false;
};
</script>

<template>
  <div v-if="checkingAuth" class="loading-container">
    <div class="loading-spinner">Loading...</div>
  </div>
  <template v-else>
    <Login v-if="!isAuthenticated" @login-success="handleLoginSuccess" />
    <Homepage v-else @logout="handleLogout" />
  </template>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.loading-spinner {
  font-size: 1.2rem;
  color: var(--p-primary-color);
}
</style>