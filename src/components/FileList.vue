<template>
    <div class="h-full flex flex-col">
        <div class="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 class="text-gray-800 dark:text-white font-bold">文档列表</h2>
            <div class="flex space-x-2">
                <!-- 导入按钮 -->
                <input type="file" ref="fileInput" accept=".md, .markdown" class="hidden" @change="handleImportFile" />
                <button @click="$refs.fileInput.click()" class="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition" title="导入Markdown文件">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </button>

                <!-- 导出当前文档按钮 -->
                <button @click="handleExportCurrentDocument" class="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition" title="导出当前文档">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </button>

                <!-- 导出所有文档按钮 -->
                <button @click="handleExportAllDocuments" class="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition" title="导出所有文档">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M8 17l4 4 4-4" />
                        <path d="M12 12v9" />
                        <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
                    </svg>
                </button>

                <!-- 新建文档按钮 -->
                <button @click="handleCreateNewDocument" class="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition" title="新建文档">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto py-1">
            <div class="p-2 mb-1 border-b border-gray-200 dark:border-gray-700">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">使用指南</div>
                <div class="p-2 text-sm rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white" @click="loadGuide">
                    <span class="inline-block mr-1">📊</span> 图表创建指南
                </div>
                <div class="p-2 text-sm rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white" @click="loadEmojiReference">
                    <span class="inline-block mr-1">😀</span> Emoji表情参考
                </div>
            </div>
            <ul class="px-2">
                <li
                    v-for="doc in documentStore.documents"
                    :key="doc.id"
                    class="flex items-center justify-between group p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                    :class="{ 'bg-blue-100 dark:bg-blue-900': doc.id === documentStore.currentDocumentId }"
                    @click="selectDocument(doc.id)"
                >
                    <div class="flex-1 truncate pr-2">
                        <div class="font-medium text-gray-800 dark:text-white truncate">{{ doc.title }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(doc.updatedAt || doc.createdAt) }}</div>
                    </div>

                    <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 focus:outline-none" @click.stop="handleExportDocument(doc)" title="导出文档">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </button>

                        <button class="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 focus:outline-none" @click.stop="renameDocument(doc)" title="重命名">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                        </button>

                        <button class="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 focus:outline-none" @click.stop="confirmDelete(doc)" title="删除">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    </div>
                </li>
            </ul>
        </div>

        <!-- 重命名对话框 -->
        <div v-if="showRenameDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80">
                <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">重命名文档</h2>
                <input
                    type="text"
                    v-model="newTitle"
                    placeholder="输入新文档名称"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    @keyup.enter="confirmRename"
                />
                <div class="flex justify-end space-x-2">
                    <button @click="cancelRename" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">取消</button>
                    <button @click="confirmRename" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">确认</button>
                </div>
            </div>
        </div>

        <!-- 删除确认对话框 -->
        <div v-if="showDeleteDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80">
                <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">删除文档</h2>
                <p class="mb-4 text-gray-600 dark:text-gray-300">确定要删除"{{ docToDelete?.title }}"吗？此操作不可撤销。</p>
                <div class="flex justify-end space-x-2">
                    <button @click="cancelDelete" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">取消</button>
                    <button @click="deleteDocument" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">删除</button>
                </div>
            </div>
        </div>

        <!-- 新建文档对话框 -->
        <div v-if="showNewDocDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80">
                <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">新建文档</h2>
                <input
                    type="text"
                    v-model="newDocTitle"
                    placeholder="输入文档标题"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    @keyup.enter="confirmNewDocument"
                />
                <div class="flex justify-end space-x-2">
                    <button @click="cancelNewDocument" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">取消</button>
                    <button @click="confirmNewDocument" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">创建</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDocumentStore } from '../store/documentStore'

const documentStore = useDocumentStore()
const fileInput = ref(null)

// 状态变量
const showRenameDialog = ref(false)
const showDeleteDialog = ref(false)
const showNewDocDialog = ref(false)
const docToRename = ref(null)
const docToDelete = ref(null)
const newTitle = ref('')
const newDocTitle = ref('')

// 选择文档
const selectDocument = (documentId) => {
    documentStore.setCurrentDocument(documentId)
}

// 格式化日期
function formatDate(dateString) {
    try {
        if (!dateString) return '未知时间'

        const date = new Date(dateString)

        // 检查是否为有效日期
        if (isNaN(date.getTime())) {
            console.warn('Invalid date string:', dateString)
            return '未知时间'
        }

        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch (error) {
        console.error('日期格式化错误:', error)
        return '未知时间'
    }
}

// 重命名文档
function renameDocument(doc) {
    docToRename.value = doc
    newTitle.value = doc.title
    showRenameDialog.value = true

    // 自动聚焦输入框
    setTimeout(() => {
        document.querySelector('input').focus()
    }, 100)
}

// 确认重命名
function confirmRename() {
    if (newTitle.value.trim() && docToRename.value) {
        const docIndex = documentStore.documents.findIndex((doc) => doc.id === docToRename.value.id)
        if (docIndex !== -1) {
            documentStore.documents[docIndex].title = newTitle.value.trim()
            documentStore.documents[docIndex].updatedAt = new Date().toISOString()
            documentStore.saveDocuments()
        }
        cancelRename()
    }
}

// 取消重命名
function cancelRename() {
    showRenameDialog.value = false
    docToRename.value = null
    newTitle.value = ''
}

// 确认删除对话框
function confirmDelete(doc) {
    docToDelete.value = doc
    showDeleteDialog.value = true
}

// 执行删除
function deleteDocument() {
    if (docToDelete.value) {
        documentStore.deleteDocument(docToDelete.value.id)
        cancelDelete()
    }
}

// 取消删除
function cancelDelete() {
    showDeleteDialog.value = false
    docToDelete.value = null
}

// 处理新建文档
const handleCreateNewDocument = () => {
    showNewDocDialog.value = true
    newDocTitle.value = ''

    // 自动聚焦输入框
    setTimeout(() => {
        document.querySelector('input').focus()
    }, 100)
}

// 确认新建文档
function confirmNewDocument() {
    if (newDocTitle.value.trim()) {
        // 修复参数格式，直接传递标题和默认内容
        const newDocId = documentStore.createDocument(newDocTitle.value.trim())
        documentStore.setCurrentDocument(newDocId)
        showToast('文档创建成功')
    }
    cancelNewDocument()
}

// 取消新建文档
function cancelNewDocument() {
    showNewDocDialog.value = false
    newDocTitle.value = ''
}

// 加载图表指南
const loadGuide = () => {
    // 检查是否已存在同名文档
    const existingDoc = documentStore.documents.find((doc) => doc.title === '图表创建指南')
    if (existingDoc) {
        // 如果已存在，直接切换到该文档
        documentStore.setCurrentDocument(existingDoc.id)
        return
    }

    fetch(`/src/docs/charts-guide.md`)
        .then((response) => response.text())
        .then((content) => {
            documentStore.createDocument('图表创建指南', content)
        })
        .catch((error) => {
            console.error('加载指南文档失败:', error)
            documentStore.createDocument('图表创建指南', '# 图表创建指南\n\n加载指南文档失败，请联系管理员。')
        })
}

// 加载emoji参考
const loadEmojiReference = () => {
    // 检查是否已存在同名文档
    const existingDoc = documentStore.documents.find((doc) => doc.title === 'Emoji表情参考')
    if (existingDoc) {
        // 如果已存在，直接切换到该文档
        documentStore.setCurrentDocument(existingDoc.id)
        return
    }

    fetch(`/src/docs/emoji-reference.md`)
        .then((response) => response.text())
        .then((content) => {
            documentStore.createDocument('Emoji表情参考', content)
        })
        .catch((error) => {
            // 如果文件不存在，创建一个基本的emoji参考文档
            console.error('加载emoji参考文档失败:', error)
            let content = '# Emoji表情参考 :smile:\n\n'
            content += '在Markdown中，你可以使用短代码来插入emoji表情。\n\n'
            content += '## 常用Emoji\n\n'
            content += '- :smile: `:smile:` - 微笑\n'
            content += '- :heart: `:heart:` - 爱心\n'
            content += '- :thumbsup: `:thumbsup:` - 点赞\n'
            content += '- :rocket: `:rocket:` - 火箭\n'
            content += '- :star: `:star:` - 星星\n'
            content += '- :warning: `:warning:` - 警告\n'
            content += '- :bulb: `:bulb:` - 灯泡（提示）\n'
            content += '- :bug: `:bug:` - 程序错误\n\n'
            content += '你可以通过编辑器的右键菜单中的"插入表情"选项来添加更多表情。'
            documentStore.createDocument('Emoji表情参考', content)
        })
}

// 处理导入Markdown文件
const handleImportFile = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
        // 读取文件内容
        const content = await readFileContent(file)

        // 使用文件名作为文档标题（去掉扩展名）
        const title = file.name.replace(/\.(md|markdown)$/i, '')

        // 创建新文档 - 修复参数格式
        const newDocId = documentStore.createDocument(title, content)

        // 设置为当前文档
        documentStore.setCurrentDocument(newDocId)

        // 显示成功消息
        showToast('导入成功')

        // 确保设置当前文档生效
        console.log('已设置当前文档ID:', newDocId)
    } catch (error) {
        console.error('文件导入失败:', error)
        showToast('导入失败: ' + error.message, 'error')
    }

    // 重置文件输入，允许再次选择相同的文件
    event.target.value = null
}

// 读取文件内容
const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            resolve(e.target.result)
        }

        reader.onerror = (e) => {
            reject(new Error('文件读取失败'))
        }

        reader.readAsText(file)
    })
}

// 处理导出当前文档
const handleExportCurrentDocument = () => {
    const currentDoc = documentStore.currentDocument

    if (!currentDoc) {
        showToast('没有可导出的文档', 'error')
        return
    }

    try {
        // 创建Blob对象
        const blob = new Blob([currentDoc.content], { type: 'text/markdown;charset=utf-8' })

        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentDoc.title}.md`

        // 触发下载
        document.body.appendChild(a)
        a.click()

        // 清理
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showToast('导出成功')
    } catch (error) {
        console.error('导出失败:', error)
        showToast('导出失败: ' + error.message, 'error')
    }
}

// 处理导出所有文档到zip文件
const handleExportAllDocuments = async () => {
    const docs = documentStore.documents

    if (!docs || docs.length === 0) {
        showToast('没有可导出的文档', 'error')
        return
    }

    try {
        // 动态导入JSZip库
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()

        // 创建文件夹
        const folder = zip.folder('markdown-documents')

        // 添加所有文档到zip文件
        docs.forEach((doc) => {
            // 确保文件名没有非法字符
            const sanitizedTitle = doc.title.replace(/[<>:"/\\|?*]/g, '_')
            folder.file(`${sanitizedTitle}.md`, doc.content)
        })

        // 生成zip文件
        const content = await zip.generateAsync({ type: 'blob' })

        // 下载文件
        const url = URL.createObjectURL(content)
        const a = document.createElement('a')
        a.href = url
        a.download = 'markdown-documents.zip'
        document.body.appendChild(a)
        a.click()

        // 清理
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showToast(`成功导出 ${docs.length} 个文档`)
    } catch (error) {
        console.error('批量导出失败:', error)
        showToast('批量导出失败: ' + (error.message || '未知错误'), 'error')
    }
}

// 显示消息提示
const showToast = (message, type = 'success') => {
    const toast = document.createElement('div')
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
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

// 添加导出单个文档的函数
const handleExportDocument = (doc) => {
    try {
        // 创建Blob对象
        const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' })

        // A创建文件名（替换不合法字符）
        const sanitizedTitle = doc.title.replace(/[<>:"/\\|?*]/g, '_')

        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${sanitizedTitle}.md`

        // 触发下载
        document.body.appendChild(a)
        a.click()

        // 清理
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showToast(`已导出：${doc.title}`)
    } catch (error) {
        console.error('导出失败:', error)
        showToast('导出失败: ' + error.message, 'error')
    }
}
</script> 