# Markdown 预览网站

这是一个使用 Vue 3 开发的 Markdown 文档预览网站，支持实时编辑预览、主题切换及文档管理等功能。

## 功能特点

### 编辑器

- 支持 Markdown 语法高亮
- 实时编辑体验
- 支持常用 Markdown 语法

### 预览器

- 实时渲染 Markdown 为 HTML
- 支持代码块语法高亮
- 支持数学公式渲染

### 工具栏

- 新建文档
- 保存文档
- 导出为 HTML
- 导出为 PDF
- 主题切换（明亮/黑暗模式）

### 文档管理

- 支持创建多个文档
- 支持切换不同文档
- 支持删除文档
- 使用 localStorage 本地存储文档内容

## 技术栈

- Vue 3 + Composition API
- Vite (构建工具)
- Marked (Markdown 解析)
- Highlight.js (代码高亮)
- KaTeX (数学公式渲染)
- Tailwind CSS (样式框架)
- html2pdf.js (PDF 导出)

## 环境要求

- Node.js 14.x 或更高版本
- npm 6.x 或更高版本
- 现代浏览器（Chrome, Firefox, Safari, Edge 等）

## 项目设置与开发

### 安装依赖

```bash
# 安装项目依赖
npm install
```

### 开发模式

```bash
# 启动开发服务器
npm run dev
```

开发服务器默认运行在 http://localhost:5173

### 构建生产版本

```bash
# 构建生产版本
npm run build
```

### 预览生产构建

```bash
# 预览生产构建
npm run preview
```

## 目录结构

```
view-markdown/
├── public/                   # 静态资源目录
│   ├── markdown-icon.svg     # 网站图标
│   ├── charts-guide.md       # 图表指南
│   └── lixin.jpg             # 示例图片
├── src/                      # 源代码目录
│   ├── assets/               # 资源文件
│   │   └── styles/           # 样式文件
│   │       ├── style.css     # 全局样式
│   │       └── preview.css   # 预览区样式
│   ├── components/           # Vue组件
│   │   ├── Editor.vue        # Markdown编辑器组件
│   │   ├── Preview.vue       # Markdown预览组件
│   │   ├── FileList.vue      # 文件列表组件
│   │   ├── Toolbar.vue       # 工具栏组件
│   │   ├── ContextMenu.vue   # 右键菜单组件
│   │   ├── ContextMenuItem.vue  # 右键菜单项组件
│   │   ├── EmojiPicker.vue   # 表情选择器组件
│   │   └── ImagePreview.vue  # 图片预览组件
│   ├── docs/                 # 文档文件
│   │   ├── charts-guide.md   # 图表使用指南
│   │   └── emoji-reference.md  # 表情符号参考
│   ├── stores/               # 状态管理
│   │   ├── documentStore.js  # 文档状态管理
│   │   └── themeStore.js     # 主题状态管理
│   ├── App.vue               # 主应用组件
│   ├── main.js               # 应用入口文件
│   └── index.html            # HTML模板(空)
├── index.html                # 主HTML页面
├── package.json              # 项目依赖配置
├── package-lock.json         # 依赖版本锁定文件
├── vite.config.js            # Vite配置文件
├── tailwind.config.cjs       # Tailwind CSS配置
├── postcss.config.cjs        # PostCSS配置
└── README.md                 # 项目文档
```

## 功能使用指南

### 创建新文档

点击工具栏或侧边栏中的"+"按钮，输入文档名称后即可创建新文档。

### 编辑文档

在左侧编辑区域输入 Markdown 格式文本，右侧预览区域将实时显示渲染结果。

### 保存文档

文档会自动保存，也可以点击工具栏中的"保存"按钮手动保存文档。

### 切换文档

通过侧边栏的文档列表点击需要查看的文档名称即可切换。

### 导出文档

- 点击"导出 HTML"将当前预览内容导出为 HTML 文件
- 点击"导出 PDF"将当前预览内容导出为 PDF 文件

### 切换主题

点击工具栏中的主题切换按钮可在明亮模式和黑暗模式之间切换。

## Markdown 语法支持

本编辑器支持以下 Markdown 语法：

### 标题

```markdown
# 一级标题

## 二级标题

### 三级标题
```

### 强调

```markdown
_斜体_ 或 _斜体_
**粗体** 或 **粗体**
```

### 列表

```markdown
- 无序列表项
- 无序列表项
  - 嵌套列表项

1. 有序列表项
2. 有序列表项
```

### 链接和图片

```markdown
[链接文字](https://example.com)
![图片描述](https://example.com/image.jpg)
```

### 代码

````markdown
行内代码：`const example = "hello"`

代码块：

```javascript
function hello() {
  console.log("Hello, world!");
}
```
````

### 表格

```markdown
| 表头 1 | 表头 2 |
| ------ | ------ |
| 单元格 | 单元格 |
| 单元格 | 单元格 |
```

### 数学公式

```markdown
行内公式：$E=mc^2$

块级公式：

$$
\frac{d}{dx}e^x = e^x
$$
```

## 技术特性

本项目使用了以下技术和库：

- **Vue 3**: 使用组合式 API 和响应式系统
- **Pinia**: 状态管理
- **CodeMirror**: 用于 Markdown 编辑器
- **Markdown-it**: 用于 Markdown 解析和预览，支持以下扩展功能：
  - 数学公式 (KaTeX)
  - 标题锚点
  - 目录生成
  - Emoji 表情支持
  - 任务列表
- **TailwindCSS**: 样式和响应式设计
- **Highlight.js**: 代码高亮

## 使用的 Markdown 功能

在此编辑器中，你可以使用以下 Markdown 扩展功能：

### 基本 Markdown 语法

- 标题 (`# H1`, `## H2`, 等)
- 格式化文本 (**粗体**, _斜体_, ~~删除线~~)
- 列表 (有序和无序)
- 链接和图片
- 代码块和行内代码

### 扩展功能

- **数学公式**: 使用 `$公式$` 插入行内公式，`$$公式$$` 插入块级公式
- **自动目录**: 使用 `[TOC]` 生成目录
- **任务列表**: 使用 `- [ ]` 创建未完成任务，`- [x]` 创建已完成任务
- **Emoji**: 使用 `:smile:` 这样的语法插入 emoji 表情
- **表格**: 使用标准 Markdown 表格语法
- **自动链接**: 会自动识别和转换 URL
- **高亮代码**: 支持超过 100 种编程语言

## 开发者说明

项目采用组件化设计，主要组件如下：

- `App.vue`: 应用主组件
- `components/Editor.vue`: Markdown 编辑器组件
- `components/Preview.vue`: Markdown 预览组件
- `components/Toolbar.vue`: 工具栏组件
- `components/FileList.vue`: 文件列表组件
- `stores/documentStore.js`: 文档状态管理

组件间通过 Pinia 状态管理库实现数据共享和状态同步。

## 浏览器兼容性

本应用采用现代前端技术，包括 ES6+和 CSS3 特性，因此需要现代浏览器支持：

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

不支持 Internet Explorer。

## SEO 优化

网站已包含以下 SEO 优化：

- 适当的页面标题和描述
- Open Graph 和 Twitter 卡片元数据
- 语义化 HTML 结构
- 响应式设计，适配各种设备

## 后续扩展计划

- 云端存储集成（如 Firebase、阿里云 OSS 等）
- 多人协作编辑功能
- 分享链接功能
- 更多的 Markdown 扩展语法支持
- 自定义主题和样式

## 特性

- **实时预览**: 同时查看编辑内容和渲染结果
- **语法高亮**: 支持多种编程语言的代码高亮
- **数学公式**: 支持 LaTeX 数学公式
- **主题切换**: 支持明亮和暗黑模式
- **文件管理**: 创建、编辑、删除和导出 Markdown 文档
- **响应式设计**: 适配桌面和移动设备
- **自动保存**: 实时保存文档内容
- **拖拽调整**: 可调整编辑区和预览区的宽度比例

## 图表功能

Markdown 编辑器现在支持使用 Mermaid 语法创建各种图表：

### 流程图

```mermaid
flowchart TD
    A[开始] --> B{是否有问题?}
    B -->|是| C[解决问题]
    B -->|否| D[完成]
    C --> D
```

#### 语法示例:

````
```mermaid
flowchart TD
    A[开始] --> B{是否有问题?}
    B -->|是| C[解决问题]
    B -->|否| D[完成]
    C --> D
```
````

### 序列图

```mermaid
sequenceDiagram
    participant 客户端
    participant 服务器
    客户端->>服务器: 请求数据
    服务器-->>客户端: 返回数据
```

#### 语法示例:

````
```mermaid
sequenceDiagram
    participant 客户端
    participant 服务器
    客户端->>服务器: 请求数据
    服务器-->>客户端: 返回数据
```
````

### 思维导图

```mermaid
mindmap
  root((思维导图))
    编程
      前端
        HTML
        CSS
        JavaScript
      后端
        Java
        Python
        Go
    设计
      UI
      UX
    数据分析
      统计
      机器学习
```

#### 语法示例:

````
```mermaid
mindmap
  root((思维导图))
    编程
      前端
        HTML
        CSS
        JavaScript
      后端
        Java
        Python
        Go
    设计
      UI
      UX
    数据分析
      统计
      机器学习
```
````

### 饼图

```mermaid
pie title 时间分配
    "工作" : 40
    "学习" : 20
    "休息" : 30
    "其他" : 10
```

#### 语法示例:

````
```mermaid
pie title 时间分配
    "工作" : 40
    "学习" : 20
    "休息" : 30
    "其他" : 10
```
````

### 甘特图

```mermaid
gantt
    title 项目计划
    dateFormat  YYYY-MM-DD
    section 阶段1
    任务1           :a1, 2023-01-01, 30d
    任务2           :after a1  , 20d
    section 阶段2
    任务3           :2023-02-15, 12d
    任务4           :24d
```

#### 语法示例:

````
```mermaid
gantt
    title 项目计划
    dateFormat  YYYY-MM-DD
    section 阶段1
    任务1           :a1, 2023-01-01, 30d
    任务2           :after a1  , 20d
    section 阶段2
    任务3           :2023-02-15, 12d
    任务4           :24d
```
````
