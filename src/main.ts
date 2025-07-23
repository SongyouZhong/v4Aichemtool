import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'     // 可换成 lara / material 等
import 'primeicons/primeicons.css'           // 图标
// 下面两行仅在使用 styled-mode 主题时需要
import '@primevue/themes/aura/theme.css'     // 主题
import 'primevue/resources/primevue.min.css' // 核心样式

import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue, {                        // 统一全局配置
  theme: { preset: Aura }
})

app.mount('#app')
