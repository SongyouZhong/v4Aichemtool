<template>
  <div class="homepage">
    <!-- Navigation Bar -->
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

    <!-- Hero Section -->
    <section class="hero placeholder">
      <h1>Page Title</h1>
      <h2>Subtitle goes here</h2>
    </section>

    <!-- Feature Grid -->
    <section class="features">
      <div class="feature-card placeholder" v-for="n in 4" :key="n">
        <div class="card-body">
          <Avatar shape="circle" size="large" class="image" />
          <div class="text">
            <h3>Title</h3>
            <h4>Subtitle</h4>
            <p>Description text</p>
          </div>
        </div>
        <a href="#" class="explore">Explore now</a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Avatar from 'primevue/avatar'
</script>

<style scoped>
.homepage {
  font-family: Arial, sans-serif;
  color: #333;
}
.placeholder {
  border: 1px solid #d0d0d0;
  background: #f9f9f9;
}
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
.hero {
  text-align: center;
  padding: 4rem 1rem;
}
.features {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
}
.feature-card {
  padding: 1rem;
}
.card-body {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}
.image {
  width: 60px;
  height: 60px;
}
.text h3,
.text h4,
.text p {
  margin: 0;
}
.explore {
  font-size: 0.9rem;
  color: #6c757d;
}
</style>
