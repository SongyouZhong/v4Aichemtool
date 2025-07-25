<script setup lang="ts">
import { onMounted } from 'vue';
import AppLayout from './components/layout/AppLayout.vue';
import { useAuth } from './composables/useAuth';

const { checkAuth, isLoading } = useAuth();

onMounted(() => {
  checkAuth();
});
</script>

<template>
  <div v-if="isLoading" class="loading-container">
    <div class="loading-spinner">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Loading...</p>
    </div>
  </div>
  <template v-else>
    <AppLayout />
  </template>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner p {
  font-size: 1.2rem;
  color: var(--p-primary-color);
  margin: 0;
}
</style>