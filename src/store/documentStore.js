import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import emoji from 'markdown-it-emoji'
import katexPlugin from 'markdown-it-katex'
import anchorPlugin from 'markdown-it-anchor'
import tocPlugin from 'markdown-it-toc-done-right'
import taskListsPlugin from 'markdown-it-task-lists'
import 'highlight.js/styles/github-dark.css'

// 全局唯一ID生成器
let nextId = 1

// 初始文档标题
const INITIAL_DOCUMENT_TITLE = '加强李信'

// 默认文档内容
const DEFAULT_DOCUMENT_CONTENT = `### 1. 标题

# 一级标题 加强李信 

## 二级标题 加强李信

### 三级标题 加强李信

#### 四级标题 加强李信

### 2. 无序列表

- 李信 
- 李信 
  - 光信 
  - 暗信

### 3. 有序列表

1. 李信 
2. 李信 


### 4. 粗体和斜体

**这个是粗体李信**

_这个是斜体李信_

**_这个是粗体加斜体的李信_**


### 5. 链接

[点击前往查看李信的英雄介绍](https://pvp.qq.com/web201605/herodetail/lixin.shtml)

### 6. 引用

> 大小姐驾到通通闪开 **--孙尚香**
>>双枪会给出答案  **--马可波罗** 

### 7. 分割线

我就是太阳

--- 
侯非侯，王非王，千乘万骑走北芒

### 8. 删除线

~~加强李信！！~~

### 9. 表格

| 英雄 | 身高(cm) | 位置 | 皮肤数量 |
| :-: | :-: | - | :-: |
| 李信     |  187  |    战士 |3|
| 狄仁杰   |  178  |  射手 |8 |
| 孙尚香 |  165  | 射手 |10|

### 10. 代码块

\`\`\`js 
let powerful = Math.floor(Math.random() * 10); 
const strengThenLx = new Promise((resolve, reject) => { 
  if (powerful === 8){ 
    resolve("加强成功"); 
  } else { 
    reject("加强失败"); 
  } 
}) 
async function main() {
  try {
    const res = await strengThenLx 
    console.log(res);    // 加强成功 
  } catch (error) { 
     console.log(error); // 加强失败 
  }
}
main(); 
\`\`\` 

### 11. HTML
<div><span style="color:red">李信</span>是红色的</div>

### 12. 图片 

线上图片 

![线上图片](https://env-00jxgxfkbq39.normal.cloudstatic.cn/share/lixin.jpg) 

本地图片 

![本地图片](/lixin.jpg) 

### 13. 表情

😊 😂 🤔 👍 🎮 ⚔️ 🛡️ 🏆 🔥 ✨

### 14. 数学公式

$$\\sqrt{3x-1}+(1+x)^2$$

### 15. 图表

\`\`\`mermaid
graph TD
A[加强李信] --> B[加强中]
B --> C[加强完成]
\`\`\`

### 16. 任务列表

- [ ] 加强李信
- [x] 加强李信
- [ ] 加强李信

### 17. 饼图

\`\`\`mermaid
pie
    title 加强李信
    "加强李信" : 8
    "加强失败" : 2
\`\`\`
`
// 创建Markdown渲染器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true })
        // 添加特定标记以便CSS选择器能更精确地定位
        const processedCode = highlighted.value
          .replace(/\(/g, '<span class="bracket paren-open">(</span>')
          .replace(/\)/g, '<span class="bracket paren-close">)</span>')
          .replace(/\{/g, '<span class="bracket brace-open">{</span>')
          .replace(/\}/g, '<span class="bracket brace-close">}</span>')
          .replace(/\[/g, '<span class="bracket square-open">[</span>')
          .replace(/\]/g, '<span class="bracket square-close">]</span>')

        return `<pre><code class="hljs language-${lang}">${processedCode}</code></pre>`
      } catch (e) {
        console.error('代码高亮失败:', e)
      }
    }
    // 如果语言不存在或出错，使用转义的代码
    return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// 自定义渲染mermaid图表的插件
function mermaidPlugin(md) {
  const originalFence = md.renderer.rules.fence.bind(md.renderer.rules)

  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    const code = token.content.trim()

    if (token.info === 'mermaid') {
      // 最简单的实现 - 直接返回mermaid类的div
      return `<div class="mermaid">${code}</div>`
    }

    return originalFence(tokens, idx, options, env, slf)
  }
}

// 添加插件
md.use(emoji) // emoji表情支持
md.use(mermaidPlugin) // mermaid图表支持

// 尝试加载其他插件
try {
  md.use(katexPlugin) // 数学公式支持
} catch (e) {
  console.warn('无法加载katex插件:', e)
}

try {
  md.use(anchorPlugin, {
    permalink: true,
    permalinkSymbol: '#',
    permalinkClass: 'header-anchor'
  }) // 标题锚点
} catch (e) {
  console.warn('无法加载anchor插件:', e)
}

try {
  md.use(tocPlugin, {
    listType: 'ul',
    listClass: 'toc-list',
    itemClass: 'toc-item',
    linkClass: 'toc-link'
  }) // 目录生成
} catch (e) {
  console.warn('无法加载toc插件:', e)
}

try {
  md.use(taskListsPlugin, { enabled: true }) // 任务列表支持
} catch (e) {
  console.warn('无法加载taskLists插件:', e)
}

// 导出markdown渲染器，供其他组件使用
export const markdownRenderer = md

// 文档数据存储
export const useDocumentStore = defineStore('document', () => {
  // 所有文档的集合
  const documents = ref([])
  // 当前文档的ID
  const currentDocumentId = ref(null)
  // 本地存储的键名
  const STORAGE_KEY = 'markdown-documents'

  // 计算当前文档对象
  const currentDocument = computed(() => {
    return documents.value.find(doc => doc.id === currentDocumentId.value) || null
  })

  // 计算当前文档内容
  const currentContent = computed(() => {
    return currentDocument.value ? currentDocument.value.content : ''
  })

  // 创建新文档
  // 支持两种调用方式：
  // 1. createDocument(title, content) - 传统参数调用
  // 2. createDocument({title, content}) - 对象参数调用
  function createDocument(titleOrOptions = INITIAL_DOCUMENT_TITLE, optionalContent = DEFAULT_DOCUMENT_CONTENT) {
    let title = INITIAL_DOCUMENT_TITLE;
    let content = DEFAULT_DOCUMENT_CONTENT;

    // 检查第一个参数是否为对象
    if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
      // 对象参数调用方式
      title = titleOrOptions.title || INITIAL_DOCUMENT_TITLE;
      content = titleOrOptions.content || DEFAULT_DOCUMENT_CONTENT;
    } else {
      // 传统参数调用方式
      title = titleOrOptions || INITIAL_DOCUMENT_TITLE;
      content = optionalContent || DEFAULT_DOCUMENT_CONTENT;
    }

    const id = Date.now() + '_' + nextId++
    const now = new Date().toISOString()
    const newDoc = {
      id,
      title,
      content,
      createdAt: now,
      updatedAt: now  // 确保同时设置创建和更新时间
    }

    documents.value.push(newDoc)
    currentDocumentId.value = id
    saveDocuments()

    // 始终返回id，确保可以直接将返回值传递给setCurrentDocument
    return id
  }

  // 删除文档
  function deleteDocument(id) {
    const index = documents.value.findIndex(doc => doc.id === id)
    if (index !== -1) {
      documents.value.splice(index, 1)
      // 如果删除的是当前文档，切换到其他文档
      if (currentDocumentId.value === id) {
        currentDocumentId.value = documents.value.length > 0 ? documents.value[0].id : null
      }
      saveDocuments()
    }
  }

  // 切换当前文档
  function setCurrentDocument(id) {
    currentDocumentId.value = id
  }

  // 保存当前文档内容
  function saveCurrentContent(content) {
    if (currentDocument.value) {
      currentDocument.value.content = content
      // 更新修改时间
      currentDocument.value.updatedAt = new Date().toISOString()
      saveDocuments()
    }
  }

  // 保存文档到本地存储
  function saveDocuments() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents.value))
    } catch (error) {
      console.error('保存文档失败:', error)
    }
  }

  // 从本地存储加载文档
  function loadDocuments() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        documents.value = JSON.parse(stored)

        // 确保所有文档都有updatedAt字段
        documents.value = documents.value.map(doc => {
          // 如果没有updatedAt字段，使用createdAt值或当前时间
          if (!doc.updatedAt) {
            doc.updatedAt = doc.createdAt || new Date().toISOString()
          }
          return doc
        })

        if (documents.value.length > 0) {
          currentDocumentId.value = documents.value[0].id
        } else {
          createDocument()
        }

        // 保存更新后的文档列表
        saveDocuments()
      } else {
        createDocument()
      }
    } catch (error) {
      console.error('加载文档失败:', error)
      createDocument()
    }
  }

  // 重命名文档
  function renameDocument(id, newTitle) {
    const doc = documents.value.find(doc => doc.id === id)
    if (doc) {
      doc.title = newTitle
      saveDocuments()
    }
  }

  // 同步滚动状态
  const scrollSyncEnabled = ref(false)

  // 设置同步滚动状态
  function setScrollSyncEnabled(enabled) {
    scrollSyncEnabled.value = enabled
  }

  // 获取同步滚动状态
  function getScrollSyncEnabled() {
    return scrollSyncEnabled.value
  }

  // 滚动位置信息
  const scrollPosition = ref({
    source: '', // 'editor' 或 'preview'
    percentage: 0 // 滚动百分比 (0-1)
  })

  // 设置滚动位置
  function setScrollPosition(position) {
    scrollPosition.value = position
  }

  // 渲染Markdown内容
  function renderMarkdown(content) {
    if (!content) return ''
    try {
      return md.render(content)
    } catch (error) {
      console.error('渲染Markdown失败:', error)
      return '<p class="text-red-500">渲染内容时出错</p>'
    }
  }

  // 初始化时加载文档
  loadDocuments()

  // 导出当前文档为HTML
  function exportAsHtml() {
    const currentDoc = this.currentDocument
    if (!currentDoc) return null

    try {
      // 使用已有的markdown渲染器渲染内容
      const htmlContent = this.renderMarkdown(currentDoc.content)

      // 构建完整的HTML文档
      const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentDoc.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 3px;
      padding: 16px;
      overflow: auto;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
    img {
      max-width: 100%;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 8px 12px;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin-left: 0;
      color: #666;
    }
    .mermaid {
      text-align: center;
    }
  </style>
  <!-- 如果有mermaid图表，添加mermaid支持 -->
  ${currentDoc.content.includes('```mermaid') ? '<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script><script>mermaid.initialize({startOnLoad:true});</script>' : ''}
  <!-- 如果有数学公式，添加KaTeX支持 -->
  ${currentDoc.content.includes('$') ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css"><script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js"></script>' : ''}
</head>
<body>
  <h1>${currentDoc.title}</h1>
  <div class="markdown-content">
    ${htmlContent}
  </div>
</body>
</html>`

      return {
        title: currentDoc.title,
        html: fullHtml
      }
    } catch (error) {
      console.error('HTML导出错误:', error)
      return null
    }
  }

  // 保存当前文档
  function saveCurrentDocument() {
    // 检查是否有当前文档
    if (!this.currentDocument) return false

    // 更新文档内容
    const docIndex = this.documents.findIndex(doc => doc.id === this.currentDocumentId)
    if (docIndex !== -1) {
      // 更新内容和时间戳
      this.documents[docIndex].content = this.currentContent
      this.documents[docIndex].updatedAt = new Date().toISOString()

      // 保存到localStorage
      this.saveDocuments()
      return true
    }

    return false
  }

  return {
    documents,
    currentDocumentId,
    currentDocument,
    currentContent,
    createDocument,
    deleteDocument,
    setCurrentDocument,
    saveCurrentContent,
    saveDocuments,
    loadDocuments,
    renameDocument,
    scrollSyncEnabled,
    setScrollSyncEnabled,
    getScrollSyncEnabled,
    scrollPosition,
    setScrollPosition,
    renderMarkdown,
    exportAsHtml,
    saveCurrentDocument
  }
}) 