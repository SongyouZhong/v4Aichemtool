<script setup lang="ts">
import { ref } from 'vue';
import Topbar from './Topbar.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';

// Define emit for logout event
const emit = defineEmits(['logout']);
</script>

<template>
  <div class="homepage">
    <!-- Header/Navigation -->
    <header id="header">
      <Topbar @logout="emit('logout')" />
    </header>

    <!-- Main Content -->
    <main>
      <!-- Small Molecule Platform -->
      <section class="small-molecule-platform">
        <div class="container section-title">
          <h2>Small Molecule Platform</h2>
        </div>
        
        <!-- First section of Small Molecule tools -->
        <div class="container card-container">
          <div class="card-grid">
            <Card class="custom-card">
              <template #title>Database explorer</template>
              <template #content>
                <p>ChEMBL/pdbBank/BindingDB/Enamine</p>
                <p>Chemical databases serve as powerful tools in drug discovery. These databases facilitate virtual screening, drug repurposing, and computational efficiency.</p>
              </template>
              <template #footer>
                <Button label="Explore now" />
              </template>
            </Card>
            <Card class="custom-card">
              <template #title>Ligand-based AI generation</template>
              <template #content>
                <p>Analog generation/Scaffold-hopping</p>
                <p>Ligand-based drug design involves designing new molecules based on the information provided by known active compounds. It's also known as pharmacophore-based or indirect drug design.</p>
              </template>
              <template #footer>
                <Button label="Explore now" />
              </template>
            </Card>
            <Card class="custom-card">
              <template #title>Pocket-based AI generation</template>
              <template #content>
                <p>De novo generation/Hit discovery</p>
                <p>Pocket-based AI generation is a novel approach that leverages small, self-contained neural networks to generate creative content.</p>
              </template>
              <template #footer>
                <Button label="Explore now" />
              </template>
            </Card>
            <Card class="custom-card">
              <template #title>Interactive design</template>
              <template #content>
                <p>Draw/Docking/Prediction</p>
                <p>Molecular docking plays a pivotal role in drug discovery by predicting how small molecules (ligands) interact with target proteins.</p>
              </template>
              <template #footer>
                <Button label="Explore now" />
              </template>
            </Card>
          </div>
        </div>
      </section>
      
      <!-- Protein Platform -->
      <section class="protein-platform">
        <div class="container section-title">
          <h2>Protein Platform</h2>
        </div>
        
        <div class="container">
          <div class="row">
            <div class="col-lg-6">
              <!-- PROTAC tools -->
            </div>
            <div class="col-lg-6">
              <!-- Protein structure prediction tools -->
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <!-- Footer -->
    <footer>
      <!-- Contact information -->
      <!-- Links -->
      <!-- Copyright information -->
    </footer>
  </div>
</template>

<style scoped>
.homepage {
  font-family: Arial, sans-serif;
  color: #333;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.custom-card {
  /* Add custom styles for cards if needed */
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -1rem;
}

.col-lg-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .col-lg-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>