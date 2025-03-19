<template>
    <div class="h-full flex flex-col">
        <div class="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 class="text-gray-800 dark:text-white font-bold">编辑器</h2>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ documentTitle }}</div>
        </div>
        <div class="flex-1 overflow-auto bg-white dark:bg-gray-900">
            <div class="relative h-full" ref="editorContainer">
                <Codemirror
                    v-model="content"
                    :style="{ height: '100%' }"
                    :autofocus="true"
                    :indent-with-tab="true"
                    :tab-size="2"
                    :extensions="extensions"
                    :theme="editorTheme"
                    class="h-full"
                    @contextmenu.prevent="showContextMenu"
                    @ready="onEditorReady"
                />
                <!-- 右键菜单 -->
                <div v-if="showMenu" class="context-menu" :style="{ top: menuPosition.y + 'px', left: menuPosition.x + 'px' }" @click.stop>
                    <!-- <div class="menu-item" @click.stop="askAI">🤖 Ask AI</div> -->
                    <div class="menu-item" @click.stop="insertFormula">🧮 插入公式</div>
                    <!-- 图表插入菜单项 -->
                    <div class="menu-item has-submenu">
                        📊 插入图表 {{ menuNearRightEdge ? '◂' : '▸' }}
                        <div class="submenu" :class="{ 'submenu-left': menuNearRightEdge }">
                            <div class="menu-item" @click.stop="insertTemplate('flowchart')">🔄 流程图</div>
                            <div class="menu-item" @click.stop="insertTemplate('sequence')">⏱️ 序列图</div>
                            <div class="menu-item" @click.stop="insertTemplate('mindmap')">🧠 思维导图</div>
                            <div class="menu-item" @click.stop="insertTemplate('pie')">🥧 饼图</div>
                            <div class="menu-item" @click.stop="insertTemplate('gantt')">📅 甘特图</div>
                            <div class="menu-item" @click.stop="insertTemplate('classDiagram')">🧩 类图</div>
                        </div>
                    </div>
                    <div class="menu-item" @click.stop="toggleSyncScroll">🔄 {{ syncScrollEnabled ? '关闭' : '开启' }}同步滚动</div>
                    <div class="menu-item" @click.stop="showEmojiPicker">😀 插入表情</div>
                    <div class="menu-item" @click.stop="insertImage">🖼️ 插入图片</div>
                    <div class="menu-item" @click.stop="toggleShortcodeMode">🔤 {{ shortcodeMode ? '使用表情符号' : '使用表情短代码' }}</div>
                    <div class="menu-item divider" @click.stop="loadGuideDoc">❓ 图表语法帮助</div>
                </div>

                <!-- 表情选择器 -->
                <EmojiPicker
                    :visible="emojiPickerVisible"
                    :x="emojiPickerPosition.x"
                    :y="emojiPickerPosition.y"
                    :shortcodeMode="shortcodeMode"
                    :containerRef="editorContainer"
                    @select="insertEmoji"
                    @close="closeEmojiPicker"
                    @modeChange="shortcodeMode = $event"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { useDocumentStore } from '../store/documentStore'
import { useThemeStore } from '../store/themeStore'
import ContextMenu from './ContextMenu.vue'
import ContextMenuItem from './ContextMenuItem.vue'
import EmojiPicker from './EmojiPicker.vue'

const documentStore = useDocumentStore()
const themeStore = useThemeStore()
const editorContainer = ref(null)

// 编辑器内容
const content = computed({
    get: () => documentStore.currentContent,
    set: (val) => documentStore.saveCurrentContent(val),
})

// 文档标题
const documentTitle = computed(() => {
    return documentStore.currentDocument?.title || '未命名文档'
})

// 编辑器扩展
const extensions = [markdown()]

// 编辑器主题
const editorTheme = computed(() => {
    return themeStore.isDarkMode ? oneDark : {}
})

// 右键菜单相关
const showMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const editorInstance = ref(null) // 保存编辑器实例
const cursorPosition = ref(null) // 保存右键点击时的光标位置

// 同步滚动状态
const syncScrollEnabled = ref(false)

// 表情选择器相关
const emojiPickerVisible = ref(false)
const emojiPickerPosition = ref({ x: 0, y: 0 })
// 设置表情插入模式 - true表示插入短代码如:smile:，false表示插入表情符号如😀
const shortcodeMode = ref(false)

// 添加滚动同步相关变量
const editorScrollContainer = ref(null)
let lastScrollTop = 0
let isScrolling = false

// 子菜单相关
const menuNearRightEdge = ref(false)

// 处理编辑器滚动事件
const handleEditorScroll = () => {
    if (!syncScrollEnabled.value || isScrolling || !editorInstance.value) return

    // 获取编辑器滚动容器
    const view = editorInstance.value.view
    const dom = view.scrollDOM

    const containerHeight = dom.clientHeight
    const scrollHeight = dom.scrollHeight
    const scrollTop = dom.scrollTop

    // 如果滚动位置没有变化，不处理
    if (scrollTop === lastScrollTop) return

    // 防止循环触发
    isScrolling = true

    // 计算滚动百分比
    const scrollPercentage = scrollTop / (scrollHeight - containerHeight)

    // 通知 documentStore 滚动位置变化
    documentStore.setScrollPosition({
        source: 'editor',
        percentage: scrollPercentage,
    })

    lastScrollTop = scrollTop

    // 短暂延迟后允许再次触发滚动处理
    setTimeout(() => {
        isScrolling = false
    }, 50)
}

// 监听编辑器就绪事件，设置滚动监听
const onEditorReady = (cm) => {
    editorInstance.value = cm

    // 添加滚动事件监听
    if (cm && cm.view && cm.view.scrollDOM) {
        const dom = cm.view.scrollDOM
        dom.addEventListener('scroll', handleEditorScroll)

        // 添加粘贴事件监听
        dom.addEventListener('paste', handlePaste)
    }
}

// 监听来自预览区域的滚动同步
watch(
    () => documentStore.scrollPosition,
    (position) => {
        if (!syncScrollEnabled.value || !editorInstance.value || position.source === 'editor' || isScrolling) {
            return
        }

        // 防止循环触发
        isScrolling = true

        // 获取编辑器滚动容器
        const view = editorInstance.value.view
        const dom = view.scrollDOM

        // 根据百分比计算滚动位置
        const containerHeight = dom.clientHeight
        const scrollHeight = dom.scrollHeight
        const newScrollTop = position.percentage * (scrollHeight - containerHeight)

        // 设置滚动位置
        dom.scrollTop = newScrollTop
        lastScrollTop = newScrollTop

        // 短暂延迟后允许再次触发滚动处理
        setTimeout(() => {
            isScrolling = false
        }, 50)
    },
    { immediate: true }
)

// 显示右键菜单
const showContextMenu = (event) => {
    event.preventDefault()

    // 获取编辑器容器的位置信息
    const editorRect = editorContainer.value.getBoundingClientRect()

    // 计算菜单位置（相对于编辑器容器）
    menuPosition.value = {
        x: event.clientX - editorRect.left,
        y: event.clientY - editorRect.top,
    }

    // 确保菜单不会超出边界
    const menuWidth = 200 // 估计菜单宽度
    const menuHeight = 300 // 估计菜单高度
    const submenuWidth = 150 // 估计子菜单宽度

    // 检查是否靠近右边缘 - 如果靠近，设置一个标记
    const isNearRightEdge = editorRect.width - menuPosition.value.x < menuWidth + submenuWidth

    // 将这个标记存储下来供模板使用
    menuNearRightEdge.value = isNearRightEdge

    // 主菜单位置调整
    if (menuPosition.value.x + menuWidth > editorRect.width) {
        menuPosition.value.x = editorRect.width - menuWidth
    }

    if (menuPosition.value.y + menuHeight > editorRect.height) {
        menuPosition.value.y = editorRect.height - menuHeight
    }

    // 保存当前的编辑器实例和光标位置
    if (editorInstance.value) {
        const cm = editorInstance.value
        cursorPosition.value = cm.view.state.selection.main.head
    }

    showMenu.value = true
}

// 关闭右键菜单
const closeContextMenu = () => {
    showMenu.value = false
}

// 设置文档点击事件以关闭菜单
onMounted(() => {
    document.addEventListener('click', (event) => {
        // 检查点击是否在菜单外部
        if (showMenu.value) {
            closeContextMenu()
        }
    })

    // 页面卸载前保存文档
    window.addEventListener('beforeunload', () => {
        documentStore.saveDocuments()
    })
})

// 移除事件监听器
onBeforeUnmount(() => {
    if (editorInstance.value && editorInstance.value.view && editorInstance.value.view.scrollDOM) {
        const dom = editorInstance.value.view.scrollDOM
        dom.removeEventListener('scroll', handleEditorScroll)
        dom.removeEventListener('paste', handlePaste)
    }

    document.removeEventListener('click', closeContextMenu)
})

// 图表模板
const chartTemplates = {
    flowchart: `\`\`\`mermaid
flowchart TD
    A[开始] --> B{判断条件}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
    C --> E[结束]
    D --> E
\`\`\`
`,
    sequence: `\`\`\`mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 发送请求
    B-->>A: 返回响应
\`\`\`
`,
    mindmap: `\`\`\`mermaid
mindmap
  root((核心概念))
    子概念1
      子概念1.1
      子概念1.2
    子概念2
      子概念2.1
      子概念2.2
\`\`\`
`,
    pie: `\`\`\`mermaid
pie title 数据分布
    "类别A" : 30
    "类别B" : 20
    "类别C" : 50
\`\`\`
`,
    gantt: `\`\`\`mermaid
gantt
    title 项目计划
    dateFormat YYYY-MM-DD
    section 阶段1
    任务1 :a1, 2023-01-01, 30d
    任务2 :after a1, 20d
    section 阶段2
    任务3 :2023-02-15, 12d
    任务4 :24d
\`\`\`
`,
    classDiagram: `\`\`\`mermaid
classDiagram
    class Animal {
        +name: String
        +age: int
        +makeSound(): void
    }
    class Dog {
        +breed: String
        +bark(): void
    }
    Animal <|-- Dog
\`\`\`
`,
}

// 插入图表模板
const insertTemplate = (type) => {
    const template = chartTemplates[type]
    if (template && editorInstance.value) {
        try {
            // 获取CodeMirror实例
            const cm = editorInstance.value
            const view = cm.view

            // 获取当前编辑器状态下的光标位置
            const selection = view.state.selection.main
            const insertPosition = selection.from

            // 创建替换操作
            const text = '\n\n' + template + '\n\n'
            view.dispatch({
                changes: { from: insertPosition, insert: text },
            })
        } catch (error) {
            console.error('插入模板失败:', error)
            // 回退方式 - 添加到内容中
            const currentContent = content.value
            const newContent = currentContent + '\n\n' + template + '\n\n'
            documentStore.saveCurrentContent(newContent)
        }
    } else if (template) {
        // 回退方式 - 添加到内容末尾
        const currentContent = content.value
        const newContent = currentContent + '\n\n' + template + '\n\n'
        documentStore.saveCurrentContent(newContent)
    }
    closeContextMenu()
}

// 加载图表指南文档
const loadGuideDoc = () => {
    // 检查是否已存在同名文档
    const existingDoc = documentStore.documents.find((doc) => doc.title === '图表创建指南')
    if (existingDoc) {
        // 如果已存在，直接切换到该文档
        documentStore.setCurrentDocument(existingDoc.id)
        return
    }

    fetch(`/docs/charts-guide.md`) // 修改为从public目录加载
        .then((response) => response.text())
        .then((content) => {
            const docId = documentStore.createDocument('图表创建指南', content)
            documentStore.setCurrentDocument(docId)
        })
        .catch((error) => {
            console.error('加载指南文档失败:', error)
            const docId = documentStore.createDocument('图表创建指南', '# 图表创建指南\n\n加载指南文档失败，请联系管理员。')
            documentStore.setCurrentDocument(docId)
        })
}

// Ask AI 功能
const askAI = () => {
    // 获取选中的文本
    let selectedText = ''
    if (editorInstance.value) {
        const view = editorInstance.value.view
        const state = view.state
        const selection = state.selection.main
        if (!selection.empty) {
            selectedText = state.sliceDoc(selection.from, selection.to)
        }
    }

    // 根据是否有选中文本决定提示内容
    const promptText = selectedText ? `关于"${selectedText}"，我想知道：` : '请帮我解答：'

    // 在当前光标位置插入 AI 提示模板
    if (editorInstance.value) {
        try {
            const view = editorInstance.value.view
            const selection = view.state.selection.main
            const insertPosition = selection.from

            view.dispatch({
                changes: { from: insertPosition, insert: `\n\n<!-- AI提问：${promptText} -->\n\n` },
            })
        } catch (error) {
            console.error('插入AI提问模板失败:', error)
        }
    }
    closeContextMenu()
}

// 插入公式
const insertFormula = () => {
    if (editorInstance.value) {
        try {
            const view = editorInstance.value.view
            const selection = view.state.selection.main
            const insertPosition = selection.from

            view.dispatch({
                changes: { from: insertPosition, insert: '$$ 在这里输入公式 $$' },
            })
        } catch (error) {
            console.error('插入公式模板失败:', error)
        }
    }
    closeContextMenu()
}

// 切换同步滚动
const toggleSyncScroll = () => {
    syncScrollEnabled.value = !syncScrollEnabled.value
    // 在这里发出同步滚动状态变更的事件
    documentStore.setScrollSyncEnabled(syncScrollEnabled.value)
    closeContextMenu()
}

// 显示表情选择器
const showEmojiPicker = () => {
    // 获取编辑器容器的位置信息
    const editorRect = editorContainer.value.getBoundingClientRect()

    // 计算表情选择器位置（相对于编辑器容器）
    emojiPickerPosition.value = {
        x: menuPosition.value.x,
        y: menuPosition.value.y,
    }

    emojiPickerVisible.value = true
    closeContextMenu()
}

// 关闭表情选择器
const closeEmojiPicker = () => {
    emojiPickerVisible.value = false
}

// 切换表情插入模式
const toggleShortcodeMode = () => {
    shortcodeMode.value = !shortcodeMode.value
}

// 从文件插入图片
const insertImage = () => {
    // 创建一个隐藏的文件输入框
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.style.display = 'none'
    document.body.appendChild(fileInput)

    // 监听文件选择完成事件
    fileInput.addEventListener('change', async (e) => {
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0]

            try {
                // 转换为Base64
                const base64 = await blobToBase64(file)

                // 使用文件名或生成一个随机名称
                const filename = file.name || `image-${new Date().getTime()}.png`

                // 插入Markdown图片语法
                const imageMarkdown = `![${filename}](${base64})`

                // 在当前光标位置插入
                if (editorInstance.value) {
                    const view = editorInstance.value.view
                    const selection = view.state.selection.main
                    const insertPosition = selection.from

                    view.dispatch({
                        changes: { from: insertPosition, insert: imageMarkdown },
                    })
                }
            } catch (error) {
                console.error('处理图片文件失败:', error)
            }
        }

        // 清理临时创建的input元素
        document.body.removeChild(fileInput)
    })

    // 模拟点击文件选择框
    fileInput.click()
    closeContextMenu()
}

// 插入表情符号
const insertEmoji = (emoji) => {
    if (editorInstance.value) {
        try {
            const view = editorInstance.value.view
            const selection = view.state.selection.main
            const insertPosition = selection.from

            // 直接插入表情符号而不是短代码
            view.dispatch({
                changes: { from: insertPosition, insert: emoji },
            })
        } catch (error) {
            console.error('插入表情失败:', error)
        }
    }
}

// 处理粘贴事件
const handlePaste = async (event) => {
    if (!event.clipboardData || !event.clipboardData.items) {
        return
    }

    const items = event.clipboardData.items

    // 查找剪贴板中的图片数据
    for (let i = 0; i < items.length; i++) {
        const item = items[i]

        // 如果是图片
        if (item.type.indexOf('image') !== -1) {
            event.preventDefault() // 阻止默认粘贴行为

            const blob = item.getAsFile()
            if (!blob) continue

            try {
                // 转换为Base64
                const base64 = await blobToBase64(blob)

                // 生成随机文件名
                const timestamp = new Date().getTime()
                const filename = `image-${timestamp}.png`

                // 插入Markdown图片语法
                const imageMarkdown = `![${filename}](${base64})`

                // 在当前光标位置插入
                if (editorInstance.value) {
                    const view = editorInstance.value.view
                    const selection = view.state.selection.main
                    const insertPosition = selection.from

                    view.dispatch({
                        changes: { from: insertPosition, insert: imageMarkdown },
                    })
                }
            } catch (error) {
                console.error('处理粘贴图片失败:', error)
            }

            // 只处理第一张图片
            break
        }
    }
}

// 将Blob转换为Base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
        reader.readAsDataURL(blob)
    })
}

// 监听当前文档变化
watch(
    () => documentStore.currentDocumentId,
    () => {
        // 文档切换后，可以做一些额外操作
    },
    { immediate: true }
)
</script>

<style>
/* 自定义CodeMirror样式 */
.cm-editor {
    height: 100%;
    font-family: 'Fira Code', monospace;
    font-size: 1rem;
}

.cm-scroller {
    overflow: auto;
    padding: 1rem;
    height: 100%;
    background-color: inherit;
}

/* 暗模式下的样式调整 */
.dark .cm-editor:not(.cm-theme-dark) {
    background-color: #1a202c;
    color: #e2e8f0;
}

.dark .cm-scroller {
    background-color: #1a202c;
}

.dark .cm-content {
    color: #e2e8f0;
}

/* 编辑器内容区域要继承父元素的背景色 */
.cm-editor .cm-content {
    background-color: inherit;
}

/* 自定义右键菜单样式 */
.context-menu {
    position: absolute;
    background: white;
    min-width: 200px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow: visible;
}

.dark .context-menu {
    background: #1a202c;
    border-color: rgba(255, 255, 255, 0.1);
    color: white;
}

.menu-item {
    padding: 8px 16px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    display: flex;
    align-items: center;
}

.menu-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.dark .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.menu-item.divider {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: 4px;
    padding-top: 4px;
}

.dark .menu-item.divider {
    border-top-color: rgba(255, 255, 255, 0.1);
}

/* 表情与文字的间距 */
.menu-item > :first-child {
    margin-right: 8px;
}

/* 子菜单样式 */
.submenu {
    position: absolute;
    left: 100%;
    top: 0;
    min-width: 150px;
    background: white;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: none;
    z-index: 1010;
}

/* 左侧子菜单 */
.submenu-left {
    left: auto;
    right: 100%;
    margin-right: 2px;
}

.has-submenu:hover .submenu {
    display: block;
}

.dark .submenu {
    background: #1a202c;
    border-color: rgba(255, 255, 255, 0.1);
    color: white;
}
</style> 