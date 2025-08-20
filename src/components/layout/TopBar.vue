<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { user, isAuthenticated, logout } = useAuth();

const handleLogout = () => {
  logout();
};

const handleSignUp = () => {
  // In a real app, you would navigate to a registration page
  alert('Sign up functionality would be implemented here');
};

const navigateToLogin = () => {
  router.push({ name: 'Login' });
};

const navigateToHome = () => {
  router.push({ name: 'Home' });
};

const navigateToSmallMolecule = () => {
  router.push({ name: 'SmallMolecule' });
};

const navigateToProtein = () => {
  router.push({ name: 'Protein' });
};
</script>

<template>
  <header>
    <nav class="topbar">
      <div class="topbar-start">
        <a @click="navigateToHome" class="logo">Aichemtool</a>
      </div>
      
      <div class="topbar-end">
        <Button 
          label="Small Molecule" 
          link 
          class="topbar-link"
          @click="navigateToSmallMolecule"
        />
        <Button 
          label="Protein" 
          link 
          class="topbar-link"
          @click="navigateToProtein"
        />
        <Button 
          label="About" 
          link 
          class="topbar-link"
        />
        <div v-if="isAuthenticated && user" class="user-info">
          <span class="username">{{ user.name }}</span>
        </div>
        <Button 
          v-if="!isAuthenticated"
          label="Sign Up" 
          class="topbar-signup"
          @click="handleSignUp"
        />
        <Button 
          v-if="!isAuthenticated"
          label="Login" 
          class="topbar-login"
          @click="navigateToLogin"
        />
        <Button 
          v-else
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
  cursor: pointer;
}

.topbar-end {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar-link {
  color: white;
}

.topbar-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  color: white;
}

.username {
  font-weight: 500;
}

.topbar-signup {
  background-color: var(--p-button-text-primary-color);
  border: 1px solid white;
  color: white;
}

.topbar-login {
  background-color: transparent;
  border: 1px solid white;
  color: white;
}

.topbar-logout {
  color: white;
}
</style>