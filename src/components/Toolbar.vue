<template>
    <div class="flex items-center justify-between px-4 py-2">
        <div class="flex items-center space-x-2">
            <button class="md:hidden text-gray-600 dark:text-gray-300 focus:outline-none" @click="toggleMobileMenu">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                    <path d="M7 16V8l4 4 4-4v8" />
                </svg>
                <h1 class="text-lg font-bold text-gray-800 dark:text-white">Markdown预览网站</h1>
            </div>
        </div>

        <div class="flex items-center space-x-2">
            <button
                class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none"
                @click="createNewDocument" title="新建文档">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none"
                @click="saveDocument" title="保存文档">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none"
                @click="exportPDF" title="导出PDF">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    <text x="8.5" y="16" font-size="8" stroke-width="0" fill="currentColor">PDF</text>
                </svg>
            </button>

            <button
                class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none"
                @click="toggleTheme" title="切换主题">
                <svg v-if="!documentStore.isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </button>
        </div>

        <!-- 新建文档对话框 -->
        <div v-if="showNewDocDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80">
                <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">新建文档</h2>
                <input type="text" v-model="newDocTitle" placeholder="输入文档标题"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    @keyup.enter="confirmNewDocument" />
                <div class="flex justify-end space-x-2">
                    <button @click="cancelNewDocument"
                        class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">取消</button>
                    <button @click="confirmNewDocument"
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">创建</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDocumentStore } from '../store/documentStore'
import html2pdf from 'html2pdf.js'
import { useThemeStore } from '../store/themeStore'

const documentStore = useDocumentStore()
const showNewDocDialog = ref(false)
const newDocTitle = ref('')
const isMobileMenuOpen = ref(false)
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

// 切换移动端菜单
function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 显示新建文档对话框
function createNewDocument() {
    showNewDocDialog.value = true
    newDocTitle.value = ''

    // 自动聚焦输入框
    setTimeout(() => {
        document.querySelector('input').focus()
    }, 100)
}

// 确认创建新文档
function confirmNewDocument() {
    if (newDocTitle.value.trim()) {
        documentStore.createDocument(newDocTitle.value.trim(), '')
        showNewDocDialog.value = false
    }
}

// 取消新建文档
function cancelNewDocument() {
    showNewDocDialog.value = false
}

// 保存文档
function saveDocument() {
    const result = documentStore.saveCurrentDocument()
    if (result) {
        showToast('文档已保存', 'success')
    } else {
        showToast('保存失败，请稍后再试', 'error')
    }
}

// 切换深色/浅色主题
function toggleTheme() {
    themeStore.toggleTheme()
}

// 显示消息提示
const showToast = (message, type = 'success') => {
    const toast = document.createElement('div')
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } shadow-lg z-50 transition-opacity duration-300`
    toast.textContent = message

    document.body.appendChild(toast)

    // 2秒后淡出
    setTimeout(() => {
        toast.style.opacity = '0'
        setTimeout(() => {
            document.body.removeChild(toast)
        }, 300)
    }, 2000)
}

// 导出为PDF
function exportPDF() {
    if (!documentStore.currentDocument) {
        alert('请先选择或创建一个文档')
        return
    }

    const element = document.querySelector('.markdown-preview')
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `${documentStore.currentDocument.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    html2pdf().set(opt).from(element).save()
}
</script>