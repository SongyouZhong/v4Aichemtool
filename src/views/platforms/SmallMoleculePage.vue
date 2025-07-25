<template>
  <div class="small-molecule-page">
    <div class="container">
      <div class="page-header">
        <h1>Small Molecule Platform</h1>
        <p>Advanced tools for small molecule drug discovery and development</p>
      </div>

      <div class="tools-grid">
        <PlatformCard
          v-for="tool in tools"
          :key="tool.title"
          :title="tool.title"
          :category="tool.category"
          :description="tool.description"
          :button-text="tool.buttonText"
          @click="handleToolClick(tool)"
        />
      </div>

      <div v-if="selectedTool" class="tool-detail">
        <Card>
          <template #title>{{ selectedTool.title }}</template>
          <template #content>
            <p><strong>Category:</strong> {{ selectedTool.category }}</p>
            <p>{{ selectedTool.description }}</p>
            <div class="tool-interface">
              <p>Tool interface would be implemented here based on the selected tool type: {{ selectedTool.type }}</p>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Card from 'primevue/card';
import PlatformCard from '@/components/platform/PlatformCard.vue';
import type { SmallMoleculeTool } from '@/types';

const route = useRoute();
const selectedTool = ref<SmallMoleculeTool | null>(null);

const tools = ref<SmallMoleculeTool[]>([
  {
    title: 'Database Explorer',
    category: 'ChEMBL/pdbBank/BindingDB/Enamine',
    description: 'Chemical databases serve as powerful tools in drug discovery. These databases facilitate virtual screening, drug repurposing, and computational efficiency.',
    buttonText: 'Explore Database',
    type: 'database'
  },
  {
    title: 'Ligand-based AI Generation',
    category: 'Analog generation/Scaffold-hopping',
    description: 'Ligand-based drug design involves designing new molecules based on the information provided by known active compounds. It\'s also known as pharmacophore-based or indirect drug design.',
    buttonText: 'Generate Ligands',
    type: 'ligand-generation'
  },
  {
    title: 'Pocket-based AI Generation',
    category: 'De novo generation/Hit discovery',
    description: 'Pocket-based AI generation is a novel approach that leverages small, self-contained neural networks to generate creative content.',
    buttonText: 'Generate from Pocket',
    type: 'pocket-generation'
  },
  {
    title: 'Interactive Design',
    category: 'Draw/Docking/Prediction',
    description: 'Molecular docking plays a pivotal role in drug discovery by predicting how small molecules (ligands) interact with target proteins.',
    buttonText: 'Start Design',
    type: 'interactive-design'
  }
]);

const handleToolClick = (tool: SmallMoleculeTool) => {
  selectedTool.value = tool;
  
  // Scroll to tool detail section
  setTimeout(() => {
    const element = document.querySelector('.tool-detail');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
};

onMounted(() => {
  // Check if a specific tool was requested via query parameter
  const toolType = route.query.tool as string;
  if (toolType) {
    const tool = tools.value.find(t => t.type === toolType);
    if (tool) {
      selectedTool.value = tool;
    }
  }
});
</script>

<style scoped>
.small-molecule-page {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
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

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.tool-detail {
  margin-top: 3rem;
}

.tool-interface {
  margin-top: 2rem;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  color: #666;
}
</style>
