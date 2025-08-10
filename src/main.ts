import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Aura from '@primeuix/themes/aura';        // styled-mode 主题预设
import 'primeicons/primeicons.css';                // 图标样式

import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    // 如果你想开启深色模式或自定义 cssLayer，可以加上：
    // options: {
    //   darkModeSelector: 'system',
    //   cssLayer: true,
    //   prefix: 'p'
    // }
  }
});
app.use(ToastService);
app.use(ConfirmationService);

// 在应用挂载前进行认证检查
const initializeApp = async () => {
  const authStore = useAuthStore();
  
  try {
    // 进行认证检查（包含自动登录）
    await authStore.checkAuth();
    console.log('App initialized with authentication status:', authStore.isAuthenticated);
  } catch (error) {
    console.error('Failed to initialize authentication:', error);
  } finally {
    // 无论认证是否成功，都挂载应用
    app.mount('#app');
  }
};

initializeApp();
