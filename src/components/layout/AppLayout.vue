<template>
  <div class="app-layout">
    <TopBar />
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- 全局Toast组件 -->
    <Toast />
    
    <!-- 全局确认对话框组件 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import TopBar from './TopBar.vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background-color: #f8f9fa;
}
</style>
