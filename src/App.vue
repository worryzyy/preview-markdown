<template>
    <div class="h-screen flex flex-col overflow-hidden" :class="{ 'dark': isDarkMode }">
        <header class="bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
            <Toolbar />
        </header>
        <main class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            <!-- 移动端侧边栏遮罩层 -->
            <div v-if="isMobile && isSidebarOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="toggleSidebar"></div>

            <!-- 移动端侧边栏 (fixed定位完全脱离文档流) -->
            <aside
                v-if="isMobile"
                class="fixed top-0 left-0 z-50 h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col shadow-lg transition-transform duration-300"
                :class="{ 
                    'w-64 translate-x-0': isSidebarOpen,
                    'w-64 -translate-x-full': !isSidebarOpen
                }"
            >
                <!-- 移动端侧边栏标题 -->
                <div class="p-3 bg-blue-500 text-white font-bold flex items-center justify-between sticky top-0 z-10">
                    <span>文档列表</span>
                    <button @click="toggleSidebar" class="p-1 hover:bg-blue-600 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <FileList />
                </div>
            </aside>

            <!-- 桌面端侧边栏 -->
            <aside
                v-else
                class="bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 flex flex-col"
                :class="{ 
                    'w-0': !isSidebarOpen, 
                    'w-64': isSidebarOpen
                }"
            >
                <div class="flex-1 overflow-y-auto">
                    <FileList />
                </div>
            </aside>
            <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div
                    class="overflow-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-1/2 md:h-auto"
                    :class="{ 'w-full': isMobile, 'md:w-auto': true }"
                    :style="isMobile ? {} : { width: editorWidth + '%' }"
                >
                    <Editor />
                </div>
                <div
                    class="hidden md:flex resizer-vertical h-full w-1 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 active:bg-blue-700 cursor-col-resize flex-shrink-0"
                    :class="{ 'active': isResizingEditor }"
                    @mousedown="startResizeEditor"
                ></div>
                <div class="overflow-auto bg-white dark:bg-gray-900 h-1/2 md:h-auto" :class="{ 'w-full': isMobile, 'md:w-auto': true }" :style="isMobile ? {} : { width: (100 - editorWidth) + '%' }">
                    <Preview />
                </div>
            </div>

            <!-- 侧边栏切换按钮 -->
            <button
                class="absolute z-20 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                @click="toggleSidebar"
                :class="{ 
                    'bottom-4': !isMobile, 
                    'left-4': !isMobile && isSidebarOpen, 
                    'left-2': !isMobile && !isSidebarOpen,
                    'top-4 right-4': isMobile
                }"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="{ 'rotate-180': !isSidebarOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import { useDocumentStore } from './store/documentStore'
import { useThemeStore } from './store/themeStore'
import Toolbar from './components/Toolbar.vue'
import Editor from './components/Editor.vue'
import Preview from './components/Preview.vue'
import FileList from './components/FileList.vue'

const documentStore = useDocumentStore()
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)
const isSidebarOpen = ref(true)
const editorWidth = ref(50) // 默认编辑区域宽度百分比
const isResizingEditor = ref(false)
const isMobile = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
    localStorage.setItem('isSidebarOpen', isSidebarOpen.value ? 'true' : 'false')
}

// 开始调整编辑器大小
const startResizeEditor = (e) => {
    isResizingEditor.value = true
    document.body.classList.add('resizing')
    document.addEventListener('mousemove', handleEditorMouseMove)
    document.addEventListener('mouseup', stopResizeEditor)
    // 防止选中文本
    e.preventDefault()
}

// 处理编辑器鼠标移动
const handleEditorMouseMove = (e) => {
    if (!isResizingEditor.value) return

    // 获取主内容区域的宽度
    const sidebarWidth = isSidebarOpen.value ? 256 : 0 // 侧边栏宽度 (w-64 = 256px)
    const mainContentArea = document.querySelector('main').offsetWidth - sidebarWidth

    // 计算鼠标位置相对于主内容区域的百分比
    const editorAreaWidth = e.clientX - sidebarWidth
    const percentage = (editorAreaWidth / mainContentArea) * 100

    // 限制百分比范围（最小20%，最大80%）
    editorWidth.value = Math.max(20, Math.min(80, percentage))
}

// 停止调整编辑器大小
const stopResizeEditor = () => {
    isResizingEditor.value = false
    document.body.classList.remove('resizing')
    document.removeEventListener('mousemove', handleEditorMouseMove)
    document.removeEventListener('mouseup', stopResizeEditor)

    // 保存宽度百分比到本地存储
    localStorage.setItem('editorWidth', editorWidth.value)
}

// 动态加载暗色主题样式
const loadDarkThemeStyles = () => {
    // 检查是否已加载
    if (document.getElementById('hljs-dark-theme')) return

    const darkStyleLink = document.createElement('link')
    darkStyleLink.rel = 'stylesheet'
    darkStyleLink.id = 'hljs-dark-theme'
    darkStyleLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css'
    document.head.appendChild(darkStyleLink)
}

// 检查并加载主题设置
onMounted(() => {
    // 初始化移动设备检测
    checkMobileView()

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)

    // 加载侧边栏状态
    const savedSidebarState = localStorage.getItem('isSidebarOpen')
    if (savedSidebarState !== null) {
        isSidebarOpen.value = savedSidebarState === 'true'
    }

    // 加载编辑器宽度
    const savedEditorWidth = localStorage.getItem('editorWidth')
    if (savedEditorWidth) {
        editorWidth.value = parseFloat(savedEditorWidth)
    }

    // 如果是暗色模式，加载暗色样式
    if (themeStore.isDarkMode) {
        loadDarkThemeStyles()
        document.documentElement.classList.add('dark')
    }

    // 加载文档列表
    documentStore.loadDocuments()

    // 创建默认文档（如果没有文档）
    if (documentStore.documents.length === 0) {
        documentStore.createDocument()
    }

    // 主题初始化
    isDarkMode.value = localStorage.getItem('darkMode') === 'true'
    document.documentElement.classList.toggle('dark', isDarkMode.value)

    // 初始化代码高亮样式
    updateTheme()
})

// 处理窗口大小变化
const handleResize = () => {
    checkMobileView()
}

// 检测是否为移动设备视图
const checkMobileView = () => {
    isMobile.value = window.innerWidth < 768
    console.log('检测到窗口大小:', window.innerWidth, '是否移动设备:', isMobile.value)
}

// 组件卸载时，移除事件监听器
onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
})

// 监听主题变更
watch(
    () => themeStore.isDarkMode,
    (newVal) => {
        // 在切换为暗色模式时加载暗色样式
        if (newVal) {
            loadDarkThemeStyles()
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }
)

// 监听主题变化并更新
watch(isDarkMode, () => {
    localStorage.setItem('darkMode', isDarkMode.value)
    updateTheme()
})

const updateTheme = () => {
    const isDark = isDarkMode.value
    document.documentElement.classList.toggle('dark', isDark)

    // 更新代码高亮样式
    const darkStyleLink = document.getElementById('highlight-dark-style')
    const lightStyleLink = document.getElementById('highlight-light-style')

    // 移除旧的样式链接以确保清理
    if (darkStyleLink) {
        document.head.removeChild(darkStyleLink)
    }
    if (lightStyleLink) {
        document.head.removeChild(lightStyleLink)
    }

    // 创建新的样式链接
    if (isDark) {
        const link = document.createElement('link')
        link.id = 'highlight-dark-style'
        link.rel = 'stylesheet'
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css'
        document.head.appendChild(link)
    } else {
        const link = document.createElement('link')
        link.id = 'highlight-light-style'
        link.rel = 'stylesheet'
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/vs.min.css'
        document.head.appendChild(link)
    }

    // 强制刷新代码高亮样式
    setTimeout(() => {
        const event = new Event('highlight-refresh')
        document.dispatchEvent(event)
    }, 100)
}
</script>

<style>
@import 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css';

/* 添加代码高亮主题样式 */
.dark {
    /* 使用加载的暗黑主题样式 */
    --hljs-bg: #0d1117;
    --hljs-color: #c9d1d9;
}

@media (prefers-color-scheme: dark) {
    :root {
        --hljs-bg: #0d1117;
        --hljs-color: #c9d1d9;
    }
}

/* 防止拖动时文本选择 */
body.resizing {
    user-select: none;
    -webkit-user-select: none;
    cursor: col-resize;
}

html,
body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden; /* 禁止页面滚动 */
}

/* 拖动分隔线样式 */
.resizer {
    cursor: col-resize;
    transition: background-color 0.2s;
    position: relative;
}

.resizer:hover::before,
.resizer.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
    z-index: 10;
}

/* 拖动时应用到body的样式 */
body.resizing {
    cursor: col-resize;
    user-select: none;
}

.resizer-vertical {
    cursor: col-resize;
    transition: background-color 0.2s;
    position: relative;
}

.resizer-vertical:hover::before,
.resizer-vertical.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
    z-index: 10;
}

/* 侧边栏切换按钮样式 */
.sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.sidebar-toggle svg {
    transition: transform 0.3s ease;
}

/* 新的底部切换按钮样式 */
button svg {
    transition: transform 0.3s ease;
}

/* 侧边栏动画 */
aside {
    transition: width 0.3s ease;
}
</style> 