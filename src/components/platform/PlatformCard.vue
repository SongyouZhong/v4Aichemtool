<template>
  <Card class="platform-card">
    <template #title>{{ title }}</template>
    <template #content>
      <p class="category">{{ category }}</p>
      <p class="description">{{ description }}</p>
    </template>
    <template #footer>
      <Button :label="buttonText" @click="handleClick" />
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';

interface Props {
  title: string;
  category: string;
  description: string;
  buttonText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Explore now'
});

const emit = defineEmits<{
  click: []
}>();

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.platform-card {
  transition: all 0.3s ease;
  box-shadow: 0 2px 1px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.platform-card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.category {
  font-weight: 600;
  color: var(--p-primary-color);
  margin-bottom: 0.5rem;
}

.description {
  color: #666;
  line-height: 1.5;
}
</style>
