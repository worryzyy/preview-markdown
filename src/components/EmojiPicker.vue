<template>
    <div v-if="visible" class="emoji-picker" :style="style" @click.stop>
        <div class="emoji-picker-header">
            <input type="text" v-model="searchQuery" placeholder="搜索表情..." class="emoji-search-input" />
            <div class="emoji-mode-toggle">
                <label class="mode-label">
                    <input type="checkbox" v-model="localShortcodeMode" @change="toggleMode" />
                    <span>使用短代码</span>
                </label>
            </div>
        </div>
        <div class="emoji-category-tabs">
            <div
                v-for="category in categories"
                :key="category.key"
                class="category-tab"
                :class="{ 'active': currentCategory === category.key }"
                @click="selectCategory(category.key)"
            >{{ category.name }}</div>
        </div>
        <div class="emoji-list">
            <div v-for="emoji in currentEmojis" :key="emoji.shortcode" class="emoji-item" @click="selectEmoji(emoji)" :title="`${emoji.description} ${emoji.shortcode}`">
                <span>{{ emoji.emoji }}</span>
                <span v-if="localShortcodeMode" class="shortcode-preview">{{ emoji.shortcode }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import fullEmoji from 'markdown-it-emoji/lib/data/full.json'
import shortcutsEmoji from 'markdown-it-emoji/lib/data/shortcuts'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    x: {
        type: Number,
        default: 0,
    },
    y: {
        type: Number,
        default: 0,
    },
    shortcodeMode: {
        type: Boolean,
        default: false,
    },
    containerRef: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['select', 'close', 'modeChange'])

// 本地短代码模式状态
const localShortcodeMode = ref(props.shortcodeMode)

// 监听props变化
watch(
    () => props.shortcodeMode,
    (newVal) => {
        localShortcodeMode.value = newVal
    }
)

// 切换模式
const toggleMode = () => {
    emit('modeChange', localShortcodeMode.value)
}

// 计算菜单位置和尺寸
const pickerWidth = 420 // 增加选择器宽度
const pickerHeight = 350 // 估计选择器高度

// 样式计算
const style = computed(() => {
    let x = props.x
    let y = props.y

    // 如果有容器引用，确保菜单位于容器内
    if (props.containerRef) {
        const containerRect = props.containerRef.getBoundingClientRect()

        // 检查右边界
        if (x + pickerWidth > containerRect.width) {
            x = containerRect.width - pickerWidth - 10 // 留出10px边距
        }

        // 检查下边界
        if (y + pickerHeight > containerRect.height) {
            y = containerRect.height - pickerHeight - 10 // 留出10px边距
        }

        // 防止负值
        x = Math.max(10, x)
        y = Math.max(10, y)
    }

    return {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 1050, // 比上下文菜单高一级
        width: `${pickerWidth}px`, // 指定固定宽度
    }
})

// 搜索查询
const searchQuery = ref('')

// 表情符号类别
const categories = [
    { name: '常用', key: 'common' },
    { name: '人物', key: 'people' },
    { name: '自然', key: 'nature' },
    { name: '食物', key: 'foods' },
    { name: '活动', key: 'activity' },
    { name: '地点', key: 'places' },
    { name: '物品', key: 'objects' },
    { name: '符号', key: 'symbols' },
]

// 当前选中的类别
const currentCategory = ref('common')

// 使用直接导入的emoji数据
const emojiMappings = fullEmoji

// 处理表情数据，按类别整理
const processedEmojis = computed(() => {
    const result = {
        common: [], // 常用表情
        people: [], // 人物表情
        nature: [], // 自然
        foods: [], // 食物
        activity: [], // 活动
        places: [], // 地点
        objects: [], // 物品
        symbols: [], // 符号
    }

    // 判断表情类别的简单函数
    const getCategory = (key) => {
        // 人物表情
        if (
            key.includes('face') ||
            key.includes('person') ||
            key.includes('hand') ||
            key.includes('eyes') ||
            key.includes('mouth') ||
            key.includes('tongue')
        )
            return 'people'

        // 自然与动物
        if (
            key.includes('flower') ||
            key.includes('sun') ||
            key.includes('moon') ||
            key.includes('animal') ||
            key.includes('dog') ||
            key.includes('cat') ||
            key.includes('monkey') ||
            key.includes('bird') ||
            key.includes('fish')
        )
            return 'nature'

        // 食物与饮料
        if (
            key.includes('food') ||
            key.includes('fruit') ||
            key.includes('pizza') ||
            key.includes('beer') ||
            key.includes('coffee') ||
            key.includes('cake')
        )
            return 'foods'

        // 活动与运动
        if (key.includes('ball') || key.includes('game') || key.includes('sport') || key.includes('running') || key.includes('swimming'))
            return 'activity'

        // 地点与交通
        if (
            key.includes('car') ||
            key.includes('house') ||
            key.includes('building') ||
            key.includes('airplane') ||
            key.includes('train') ||
            key.includes('bus')
        )
            return 'places'

        // 物品与工具
        if (key.includes('phone') || key.includes('book') || key.includes('computer') || key.includes('tool') || key.includes('clock'))
            return 'objects'

        // 符号
        if (key.includes('arrow') || key.includes('heart') || key.includes('star') || key.includes('number') || key.includes('symbol'))
            return 'symbols'

        // 根据emoji的用途判断
        if (['+1', '-1', 'clap', 'wave', 'point_up', 'raised_hands'].includes(key)) return 'people'

        if (['warning', 'exclamation', 'question', 'x', 'o', 'white_check_mark'].includes(key)) return 'symbols'

        // 默认归为常用
        return 'common'
    }

    // 添加自定义的常用表情
    const customCommon = [
        { shortcode: ':smile:', emoji: '😀', description: '笑脸' },
        { shortcode: ':joy:', emoji: '😂', description: '笑哭' },
        { shortcode: ':heart:', emoji: '❤️', description: '爱心' },
        { shortcode: ':thumbsup:', emoji: '👍', description: '赞' },
        { shortcode: ':tada:', emoji: '🎉', description: '庆祝' },
        { shortcode: ':rocket:', emoji: '🚀', description: '火箭' },
        { shortcode: ':star:', emoji: '⭐', description: '星星' },
        { shortcode: ':rainbow:', emoji: '🌈', description: '彩虹' },
        { shortcode: ':fire:', emoji: '🔥', description: '火' },
        { shortcode: ':thinking:', emoji: '🤔', description: '思考' },
        { shortcode: ':100:', emoji: '💯', description: '100分' },
        { shortcode: ':zap:', emoji: '⚡', description: '闪电' },
        { shortcode: ':white_check_mark:', emoji: '✅', description: '对勾' },
        { shortcode: ':warning:', emoji: '⚠️', description: '警告' },
        { shortcode: ':bulb:', emoji: '💡', description: '灯泡' },
    ]

    // 添加自定义常用表情
    result.common = customCommon

    // 将markdown-it-emoji的表情添加到对应类别
    for (const [key, emoji] of Object.entries(emojiMappings)) {
        const category = getCategory(key)

        // 避免重复添加
        if (!result[category].some((e) => e.emoji === emoji)) {
            result[category].push({
                shortcode: `:${key}:`,
                emoji: emoji,
                description: key.replace(/_/g, ' '),
            })
        }
    }

    // 处理快捷方式映射
    for (const [shortcut, target] of Object.entries(shortcutsEmoji)) {
        // 查找目标表情
        const emoji = emojiMappings[target]
        if (emoji) {
            const category = 'common' // 所有快捷方式都放在常用分类里

            // 避免重复添加
            if (!result[category].some((e) => e.shortcode === `:${shortcut}:`)) {
                result[category].push({
                    shortcode: `:${shortcut}:`,
                    emoji: emoji,
                    description: shortcut.replace(/_/g, ' '),
                })
            }
        }
    }

    return result
})

// 当前显示的表情
const currentEmojis = computed(() => {
    const emojis = processedEmojis.value[currentCategory.value] || []

    if (!searchQuery.value) return emojis

    const query = searchQuery.value.toLowerCase()
    return emojis.filter((emoji) => emoji.description.toLowerCase().includes(query) || emoji.shortcode.toLowerCase().includes(query))
})

// 选择表情
const selectEmoji = (item) => {
    // 根据模式选择返回表情符号或短代码
    const result = localShortcodeMode.value ? item.shortcode : item.emoji
    emit('select', result)
    emit('close')
}

// 选择类别
const selectCategory = (category) => {
    currentCategory.value = category
}

// 处理点击外部关闭选择器
const handleClickOutside = (event) => {
    // 检查点击是否在选择器外部
    const picker = document.querySelector('.emoji-picker')
    if (picker && !picker.contains(event.target)) {
        emit('close')
    }
}

// 处理ESC键关闭选择器
const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
        emit('close')
    }
}

// 监听可见状态
watch(
    () => props.visible,
    (newVisible) => {
        if (newVisible) {
            nextTick(() => {
                document.addEventListener('click', handleClickOutside)
                document.addEventListener('keydown', handleKeyDown)
            })
            // 重置搜索
            searchQuery.value = ''
            // 重置类别
            currentCategory.value = 'common'
        } else {
            document.removeEventListener('click', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    },
    { immediate: true }
)

// 组件卸载时清理事件监听器
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.emoji-picker {
    width: 420px; /* 增加选择器宽度以容纳一行分类 */
    background: white;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.emoji-picker-header {
    padding: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.emoji-search-input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 6px;
}

.emoji-mode-toggle {
    display: flex;
    justify-content: flex-end;
    font-size: 12px;
    margin-top: 4px;
}

.mode-label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.mode-label input {
    margin-right: 4px;
}

.emoji-category-tabs {
    display: flex;
    justify-content: space-between; /* 均匀分布各个分类 */
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-wrap: nowrap; /* 保证不换行 */
}

.category-tab {
    padding: 6px 8px; /* 稍微减小水平间距 */
    font-size: 12px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    text-align: center; /* 文本居中 */
    flex: 1; /* 均分宽度 */
    white-space: nowrap; /* 防止文本换行 */
}

.category-tab.active {
    border-bottom-color: #3b82f6;
    color: #3b82f6;
    font-weight: 500;
}

.category-tab:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.emoji-list {
    max-height: 220px;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start; /* 左对齐 */
}

.emoji-item {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    border-radius: 4px;
    position: relative;
    margin: 2px; /* 增加间距 */
}

.emoji-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.shortcode-preview {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    z-index: 10;
}

.emoji-item:hover .shortcode-preview {
    opacity: 1;
}

/* 暗黑模式样式 */
.dark .emoji-picker {
    background: #1a202c;
    border-color: rgba(255, 255, 255, 0.15);
    color: white;
}

.dark .emoji-picker-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark .emoji-search-input {
    background: #2d3748;
    color: white;
    border-color: rgba(255, 255, 255, 0.2);
}

.dark .emoji-category-tabs {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark .category-tab.active {
    border-bottom-color: #63b3ed;
    color: #63b3ed;
}

.dark .category-tab:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.dark .emoji-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.dark .shortcode-preview {
    background: #4a5568;
    color: white;
}
</style> 