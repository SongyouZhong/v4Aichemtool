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
          <h2>小分子信息管理</h2>
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
    title: '化合物录入模块',
    category: '化合物管理、输入与分析',
    description: '用于录入化合物信息的模块，支持化合物的基本信息录入、编辑和查询。包括化学结构、分子式、分子量等信息的管理功能。',
    buttonText: '访问',
    type: 'data-input'
  },
  {
    title: '合成录入模块',
    category: '合成结果数据录入',
    description: '用于录入合成结果信息的模块，支持合成结果的基本信息录入、编辑和查询等信息的管理功能。',
    buttonText: '访问',
    type: 'synthetic-input'
  },
  {
    title: '活性录入模块',
    category: '活性数据录入与管理',
    description: '活性数据录入和管理系统，支持化合物活性数据的录入、编辑和查询。包括Ki、IC50、EC50等活性类型的数据管理功能。',
    buttonText: '录入活性',
    type: 'activity-input'
  },
  {
    title: '检测方法管理模块',
    category: '检测方法管理/配置',
    description: '检测方法管理系统，支持检测方法的创建、编辑、删除和查询功能。为活性数据录入提供检测方法配置支持。',
    buttonText: '管理检测方法',
    type: 'assay-management'
  },
  {
    title: '管理模块',
    category: '用户和项目管理',
    description: '用户与项目管理系统，支持用户的创建、编辑、删除和查询功能。包括用户注册审批、角色分配和权限管理功能。',
    buttonText: '管理用户',
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
  } else if (tool.type === 'activity-input') {
    router.push({ name: 'ActivityInput' });
  } else if (tool.type === 'assay-management') {
    router.push({ name: 'AssayManagement' });
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
