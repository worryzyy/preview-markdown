<template>
    <div class="h-full flex flex-col">
        <div class="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 class="text-gray-800 dark:text-white font-bold">预览</h2>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ documentTitle }}</div>
        </div>
        <div class="flex-1 overflow-auto bg-white dark:bg-gray-900" ref="previewContainer">
            <div class="markdown-preview p-4" v-html="renderedContent"></div>
        </div>

        <!-- 使用图片预览组件 -->
        <ImagePreview :visible="isImagePreviewActive" :src="previewImageSrc" :alt="previewImageAlt" @close="closeImagePreview" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useDocumentStore } from '../store/documentStore'
import { useThemeStore } from '../store/themeStore'
import mermaid from 'mermaid'
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.min.css'
import ImagePreview from './ImagePreview.vue'

const documentStore = useDocumentStore()
const themeStore = useThemeStore()
const previewContainer = ref(null)
const renderedContent = ref('') // 存储渲染后的HTML内容

// 图片预览状态
const isImagePreviewActive = ref(false)
const previewImageSrc = ref('')
const previewImageAlt = ref('')

// 获取当前文档标题
const documentTitle = computed(() => {
    return documentStore.currentDocument?.title || '未命名文档'
})

// 获取当前文档内容
const rawContent = computed(() => documentStore.currentContent || '')

// 监听滚动同步设置
const scrollSyncEnabled = computed(() => documentStore.scrollSyncEnabled)

// 记录上次滚动位置 - 用于避免循环同步
let lastScrollTop = 0
let isScrolling = false

// 监听滚动事件，向编辑器发送滚动位置
const handleScroll = () => {
    if (!scrollSyncEnabled.value || isScrolling || !previewContainer.value) return

    const containerHeight = previewContainer.value.clientHeight
    const scrollHeight = previewContainer.value.scrollHeight
    const scrollTop = previewContainer.value.scrollTop

    // 如果滚动位置没有变化，不处理
    if (scrollTop === lastScrollTop) return

    // 防止循环触发
    isScrolling = true

    // 计算滚动百分比
    const scrollPercentage = scrollTop / (scrollHeight - containerHeight)

    // 通知 documentStore 滚动位置变化
    documentStore.setScrollPosition({
        source: 'preview',
        percentage: scrollPercentage,
    })

    lastScrollTop = scrollTop

    // 短暂延迟后允许再次触发滚动处理
    setTimeout(() => {
        isScrolling = false
    }, 50)
}

// 监听来自编辑器的滚动同步
watch(
    () => documentStore.scrollPosition,
    (position) => {
        if (!scrollSyncEnabled.value || !previewContainer.value || position.source === 'preview' || isScrolling) {
            return
        }

        // 防止循环触发
        isScrolling = true

        // 根据百分比计算滚动位置
        const containerHeight = previewContainer.value.clientHeight
        const scrollHeight = previewContainer.value.scrollHeight
        const newScrollTop = position.percentage * (scrollHeight - containerHeight)

        // 设置滚动位置
        previewContainer.value.scrollTop = newScrollTop
        lastScrollTop = newScrollTop

        // 短暂延迟后允许再次触发滚动处理
        setTimeout(() => {
            isScrolling = false
        }, 50)
    },
    { immediate: true }
)

// 初始化mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: computed(() => (themeStore.isDarkMode ? 'dark' : 'default')),
    securityLevel: 'loose',
    fontFamily: 'sans-serif',
    flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
    },
    gantt: {
        barHeight: 20,
        fontSize: 11,
        useMaxWidth: false,
    },
})

// 简化后的mermaid图表初始化函数
const initMermaid = () => {
    try {
        // 简单直接地渲染所有图表
        mermaid.init(undefined, '.mermaid')
    } catch (e) {
        console.warn('Mermaid渲染失败:', e)
    }
}

// 显示图片预览
const showImagePreview = (src, alt) => {
    previewImageSrc.value = src
    previewImageAlt.value = alt || '图片预览'
    isImagePreviewActive.value = true
}

// 关闭图片预览
const closeImagePreview = () => {
    isImagePreviewActive.value = false
}

// 添加图片点击事件处理函数
const setupImageClickHandlers = () => {
    if (!previewContainer.value) return

    const images = previewContainer.value.querySelectorAll('.markdown-preview img')
    images.forEach((img) => {
        // 添加鼠标样式和点击事件
        img.style.cursor = 'pointer'
        img.addEventListener('click', () => {
            showImagePreview(img.src, img.alt)
        })
    })
}

// 渲染Markdown为HTML
const renderMarkdown = () => {
    if (!rawContent.value) {
        renderedContent.value = ''
        return
    }

    try {
        // 使用documentStore中的Markdown渲染器
        const html = documentStore.renderMarkdown(rawContent.value)
        renderedContent.value = html

        // 等待DOM更新后渲染mermaid和设置图片点击事件
        setTimeout(() => {
            initMermaid()
            setupImageClickHandlers()
        }, 100)
    } catch (error) {
        console.error('渲染Markdown失败:', error)
        renderedContent.value = '<p class="text-red-500">渲染内容时出错</p>'
    }
}

// 监听内容变化，重新渲染
watch(rawContent, renderMarkdown, { immediate: true })

// 初始化
onMounted(() => {
    // 初始化预览内容
    renderedContent.value = documentStore.renderMarkdown(rawContent.value)

    // 等待DOM更新后初始化mermaid和设置图片点击事件
    setTimeout(() => {
        initMermaid()
        setupImageClickHandlers()
    }, 100)

    if (previewContainer.value) {
        previewContainer.value.addEventListener('scroll', handleScroll)
    }

    // 监听代码高亮刷新事件
    document.addEventListener('highlight-refresh', refreshHighlight)

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    if (previewContainer.value) {
        previewContainer.value.removeEventListener('scroll', handleScroll)
    }

    // 移除事件监听
    document.removeEventListener('highlight-refresh', refreshHighlight)

    // 移除窗口大小变化监听
    window.removeEventListener('resize', handleResize)
})

// 添加刷新高亮的方法
const refreshHighlight = () => {
    // 重新渲染内容以刷新代码高亮
    renderedContent.value = documentStore.renderMarkdown(rawContent.value)

    // 在DOM更新后初始化mermaid和设置图片点击事件
    setTimeout(() => {
        initMermaid()
        setupImageClickHandlers()
    }, 100)
}

// 监听主题变化，重新渲染mermaid图表
watch(
    () => themeStore.isDarkMode,
    () => {
        // 主题变化时重新初始化mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: themeStore.isDarkMode ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'sans-serif',
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
            },
            gantt: {
                barHeight: 20,
                fontSize: 11,
                useMaxWidth: false,
            },
        })
        setTimeout(initMermaid, 100)
    }
)

// 添加窗口大小变化监听
let resizeTimer = null
const handleResize = () => {
    // 防抖处理
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
        // 重新初始化mermaid
        initMermaid()
    }, 250)
}
</script>

<style>
@import url('../assets/styles/preview.css');
</style> 