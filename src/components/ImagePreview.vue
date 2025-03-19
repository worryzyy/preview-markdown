<template>
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 transition-opacity duration-300" @click="close">
        <div class="relative max-w-full max-h-full overflow-auto" @click.stop>
            <img
                :src="src"
                :alt="alt"
                class="max-w-full max-h-[90vh] object-contain rounded shadow-lg transition-transform duration-200"
                @click.stop
                :style="imageStyle"
                @wheel.prevent="(e) => zoomImage(e.deltaY > 0 ? -10 : 10)"
                @touchstart="touchStart"
                @touchmove="touchMove"
                @touchend="touchEnd"
            />

            <button
                @click="close"
                class="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            <div class="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded text-sm">{{ alt }}</div>

            <!-- 缩放控制 -->
            <div class="img-zoom-controls" @click.stop>
                <button @click="zoomImage(-10)" class="img-zoom-btn" title="缩小">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                </button>

                <div class="img-zoom-text">{{ zoomLevel }}%</div>

                <button @click="zoomImage(10)" class="img-zoom-btn" title="放大">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                </button>

                <button @click="resetZoom" class="img-zoom-btn" title="重置">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M3 2v6h6" />
                        <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
                        <path d="M21 22v-6h-6" />
                        <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    src: {
        type: String,
        required: true,
    },
    alt: {
        type: String,
        default: '图片预览',
    },
})

const emit = defineEmits(['close'])

// 缩放状态
const zoomLevel = ref(100) // 缩放级别，百分比
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const translateX = ref(0)
const translateY = ref(0)

// 关闭图片预览
const close = () => {
    emit('close')
}

// 缩放图片
const zoomImage = (amount) => {
    const newZoom = zoomLevel.value + amount
    if (newZoom >= 50 && newZoom <= 400) {
        // 限制缩放范围：50% 到 400%
        zoomLevel.value = newZoom
    }
}

// 重置缩放
const resetZoom = () => {
    zoomLevel.value = 100
    translateX.value = 0
    translateY.value = 0
}

// 计算图片样式
const imageStyle = computed(() => {
    return {
        transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${zoomLevel.value / 100})`,
    }
})

// 处理触摸事件
let lastTouchDistance = 0

// 开始触摸
const touchStart = (event) => {
    if (event.touches.length === 1) {
        // 单指拖动开始
        isDragging.value = true
        startX.value = event.touches[0].clientX
        startY.value = event.touches[0].clientY
    } else if (event.touches.length === 2) {
        // 双指缩放开始，记录初始距离
        lastTouchDistance = getTouchDistance(event.touches)
    }
}

// 触摸移动
const touchMove = (event) => {
    if (event.touches.length === 1 && isDragging.value) {
        // 单指拖动
        const touch = event.touches[0]
        const deltaX = touch.clientX - startX.value
        const deltaY = touch.clientY - startY.value

        translateX.value += deltaX
        translateY.value += deltaY

        startX.value = touch.clientX
        startY.value = touch.clientY
    } else if (event.touches.length === 2) {
        // 双指缩放
        event.preventDefault() // 防止页面缩放

        const currentDistance = getTouchDistance(event.touches)
        const delta = currentDistance - lastTouchDistance

        // 计算缩放幅度
        if (Math.abs(delta) > 10) {
            // 防止微小的距离变化引起缩放
            const zoomDelta = delta > 0 ? 5 : -5
            zoomImage(zoomDelta)
            lastTouchDistance = currentDistance
        }
    }
}

// 结束触摸
const touchEnd = () => {
    isDragging.value = false
    // 不重置lastTouchDistance，因为用户可能在不抬起所有手指的情况下继续缩放
}

// 计算两个触摸点之间的距离
const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
}

// 处理键盘事件
const handleKeyDown = (e) => {
    if (e.key === 'Escape' && props.visible) {
        close()
    }
}

// 初始化
onMounted(() => {
    // 阻止背景滚动
    if (props.visible) {
        document.body.style.overflow = 'hidden'
    }

    // 监听ESC键关闭图片预览
    document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
    // 恢复背景滚动
    document.body.style.overflow = ''

    // 移除ESC键监听
    document.removeEventListener('keydown', handleKeyDown)
})

// 监听visible变化
watch(
    () => props.visible,
    (newValue) => {
        if (newValue) {
            // 打开预览时重置状态
            zoomLevel.value = 100
            translateX.value = 0
            translateY.value = 0
            document.body.style.overflow = 'hidden'
        } else {
            // 关闭预览时恢复滚动
            document.body.style.overflow = ''
        }
    },
    { immediate: true }
)
</script> 