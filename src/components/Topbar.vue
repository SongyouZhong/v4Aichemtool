<template>
  <header>
    <nav class="topbar">
      <div class="topbar-start">
        <a href="/" class="logo">Aichemtool</a>
      </div>
      
      <div class="topbar-end">
        <Button 
          label="Menu" 
          link 
          class="topbar-link"
        />
        <Button 
          label="Pricing" 
          link 
          class="topbar-link"
        />
        <Button 
          label="About" 
          link 
          class="topbar-link"
        />
        <Dropdown placeholder="User" class="topbar-dropdown" />
        <Button 
          label="Sign Up" 
          class="topbar-signup"
        />
        <Button 
          label="Logout" 
          icon="pi pi-sign-out"
          @click="handleLogout"
          text
          size="small"
          class="topbar-logout"
        />
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';

// Define emit for logout event
const emit = defineEmits(['logout']);

const handleLogout = () => {
  emit('logout');
};
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: var(--p-primary-color);
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.topbar-end {
  display: flex;
  align-items: center;
}

.topbar-link {
  color: white;
  margin-right: 1rem;
}

.topbar-link:hover {
  color: #f0f0f0;
}

.topbar-dropdown {
  margin-right: 1rem;
}

.topbar-signup {
  margin-right: 1rem;
}

.topbar-logout {
  color: white;
}
</style>