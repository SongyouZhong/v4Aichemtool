<template>
  <div class="navbar placeholder">
    <div class="nav-left">LOGO</div>
    <div class="nav-center">
      <Button label="Menu" link />
      <Button label="Pricing" link />
      <Button label="About" link />
    </div>
    <div class="nav-right">
      <Dropdown placeholder="User" />
      <Button label="Sign Up" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}
.nav-center,
.nav-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.placeholder {
  border: 1px solid #d0d0d0;
  background: #f9f9f9;
}
</style>