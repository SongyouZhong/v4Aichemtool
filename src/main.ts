import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';        // styled-mode 主题预设
import 'primeicons/primeicons.css';                // 图标样式

import App from './App.vue';
import router from './router';

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

app.mount('#app');
