<template>
  <div class="protein-page">
    <div class="container">
      <div class="page-header">
        <h1>Protein Platform</h1>
        <p>Advanced tools for protein analysis and drug design</p>
      </div>

      <div class="coming-soon">
        <Card>
          <template #title>Protein Platform Coming Soon</template>
          <template #content>
            <div class="placeholder-content">
              <i class="pi pi-cog" style="font-size: 4rem; color: var(--p-primary-color); margin-bottom: 2rem;"></i>
              <p>We are working hard to bring you the most advanced protein analysis tools.</p>
              <p>Features will include:</p>
              <ul>
                <li>PROTAC design and optimization</li>
                <li>Protein structure prediction</li>
                <li>Protein-protein interaction analysis</li>
                <li>Binding site identification</li>
                <li>Allosteric site discovery</li>
              </ul>
            </div>
          </template>
          <template #footer>
            <div class="footer-actions">
              <Button 
                label="Notify Me When Ready" 
                icon="pi pi-bell"
                @click="notifyWhenReady"
              />
              <Button 
                label="Back to Home" 
                icon="pi pi-home"
                @click="goHome"
                text
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';

const router = useRouter();

const notifyWhenReady = () => {
  // In a real app, this would open a subscription form
  alert('Notification feature would be implemented here');
};

const goHome = () => {
  router.push({ name: 'Home' });
};
</script>

<style scoped>
.protein-page {
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--p-primary-color);
  margin-bottom: 1rem;
}

.page-header p {
  font-size: 1.1rem;
  color: #666;
}

.placeholder-content {
  text-align: center;
}

.placeholder-content ul {
  text-align: left;
  max-width: 400px;
  margin: 2rem auto;
}

.placeholder-content li {
  margin-bottom: 0.5rem;
  color: #666;
}

.footer-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .footer-actions {
    flex-direction: column;
  }
}
</style>
