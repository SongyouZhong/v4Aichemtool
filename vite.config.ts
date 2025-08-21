import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // 生成文件名包含哈希值，确保每次构建都有唯一的文件名
    rollupOptions: {
      output: {
        // 为JS文件添加哈希
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // 生成源码映射文件（便于调试）
    sourcemap: false
  },
  define: {
    // 定义构建时间，可以在应用中使用
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.VERSION || 'dev')
  },
  server: {
    host: '0.0.0.0', // 允许局域网访问
    port: 3001,      // 前端端口
    strictPort: true // 如果端口被占用，不要自动更换端口
  }
});