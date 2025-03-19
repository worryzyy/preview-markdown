import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles/style.css'

// 创建Pinia状态管理
const pinia = createPinia()

// 创建Vue应用
const app = createApp(App)

// 使用插件
app.use(pinia)

// 挂载应用
app.mount('#app') 