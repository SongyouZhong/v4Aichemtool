<template>
  <div class="homepage">
    <!-- Main Content -->
    <main>
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <h1 class="hero-title">Welcome to Aichemtool</h1>
          <p class="hero-subtitle">Advanced Chemical and Molecular Platform</p>
        </div>
      </section>

      <!-- Small Molecule Platform -->
      <section class="small-molecule-platform">
        <div class="container section-title">
          <h2>Small Molecule Platform</h2>
        </div>
        
        <div class="container card-container">
          <div class="card-grid">
            <PlatformCard
              v-for="tool in smallMoleculeTools"
              :key="tool.title"
              :title="tool.title"
              :category="tool.category"
              :description="tool.description"
              :button-text="tool.buttonText"
              @click="handleToolClick(tool)"
            />
          </div>
        </div>
      </section>
      
      <!-- Protein Platform -->
      <section class="protein-platform">
        <div class="container section-title">
          <h2>Protein Platform</h2>
        </div>
        
        <div class="container">
          <div class="platform-preview">
            <p>Protein platform tools coming soon...</p>
            <Button 
              label="Explore Protein Platform" 
              @click="navigateToProtein"
              size="large"
            />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import PlatformCard from '@/components/platform/PlatformCard.vue';
import type { SmallMoleculeTool } from '@/types';

const router = useRouter();

const smallMoleculeTools = ref<SmallMoleculeTool[]>([
  {
    title: 'Database explorer',
    category: 'ChEMBL/pdbBank/BindingDB/Enamine',
    description: 'Chemical databases serve as powerful tools in drug discovery. These databases facilitate virtual screening, drug repurposing, and computational efficiency.',
    buttonText: 'Explore now',
    type: 'database'
  },
  {
    title: 'Ligand-based AI generation',
    category: 'Analog generation/Scaffold-hopping',
    description: 'Ligand-based drug design involves designing new molecules based on the information provided by known active compounds. It\'s also known as pharmacophore-based or indirect drug design.',
    buttonText: 'Explore now',
    type: 'ligand-generation'
  },
  {
    title: 'Pocket-based AI generation',
    category: 'De novo generation/Hit discovery',
    description: 'Pocket-based AI generation is a novel approach that leverages small, self-contained neural networks to generate creative content.',
    buttonText: 'Explore now',
    type: 'pocket-generation'
  },
  {
    title: 'Interactive design',
    category: 'Draw/Docking/Prediction',
    description: 'Molecular docking plays a pivotal role in drug discovery by predicting how small molecules (ligands) interact with target proteins.',
    buttonText: 'Explore now',
    type: 'interactive-design'
  },
  {
    title: '化合物录入平台',
    category: 'Data Management/Input/Analysis',
    description: 'Comprehensive data input and management platform for chemical and molecular data. Features customizable input forms and structured data tables for efficient data organization.',
    buttonText: 'Access Platform',
    type: 'data-input'
  },
  {
    title: '合成录入平台',
    category: '合成结果数据录入',
    description: 'Comprehensive data input and management platform for chemical and molecular data. Features customizable input forms and structured data tables for efficient data organization.',
    buttonText: 'Access Platform',
    type: 'synthetic-input'
  },
  {
    title: '用户管理平台',
    category: 'User Management/Administration',
    description: '用户信息管理系统，支持用户的创建、编辑、删除和查询功能。提供完整的用户生命周期管理，包括部门分组和权限管理。',
    buttonText: '进入管理',
    type: 'user-management'
  }
]);

const handleToolClick = (tool: SmallMoleculeTool) => {
  // 根据工具类型导航到相应页面
  if (tool.type === 'data-input') {
    router.push({ name: 'DataInput' });
  } else if (tool.type === 'synthetic-input') {
    router.push({ name: 'SyntheticInput' });
  } else if (tool.type === 'user-management') {
    router.push({ name: 'UserManagement' });
  } else {
    router.push({ name: 'SmallMolecule', query: { tool: tool.type } });
  }
};

const navigateToProtein = () => {
  router.push({ name: 'Protein' });
};
</script>

<style scoped>
.homepage {
  font-family: Arial, sans-serif;
  color: #333;
}

.hero-section {
  background: linear-gradient(135deg, var(--p-primary-color) 0%, #667eea 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
}

.section-title {
  text-align: center;
  margin: 3rem 0 2rem;
}

.section-title h2 {
  font-size: 2.5rem;
  color: var(--p-primary-color);
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
  margin-bottom: 3rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  width: 100%;
}

.platform-preview {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.platform-preview p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #666;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
