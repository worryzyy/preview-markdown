<template>
    <div v-if="visible" class="context-menu" :class="{ 'submenu': isSubmenu }" :style="menuStyle" @click.stop>
        <slot></slot>
    </div>
</template>

<script setup>
import { computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

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
    isSubmenu: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['close'])

// 计算菜单样式
const menuStyle = computed(() => {
    if (props.isSubmenu) {
        return {
            position: 'absolute',
            top: '0',
            left: '100%',
        }
    }
    return {
        position: 'absolute',
        left: `${props.x}px`,
        top: `${props.y}px`,
        zIndex: 1000,
    }
})

// 处理点击外部关闭菜单
const handleClickOutside = (event) => {
    emit('close')
}

// 处理ESC键关闭菜单
const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
        emit('close')
    }
}

// 当菜单显示/隐藏时添加/移除事件监听器
watch(
    () => props.visible,
    (newVal) => {
        nextTick(() => {
            if (newVal && !props.isSubmenu) {
                // 只有主菜单才添加全局事件监听器
                document.addEventListener('click', handleClickOutside)
                document.addEventListener('keydown', handleKeyDown)
            } else if (!props.isSubmenu) {
                document.removeEventListener('click', handleClickOutside)
                document.removeEventListener('keydown', handleKeyDown)
            }
        })
    }
)

// 组件卸载时清理事件监听器
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.context-menu {
    min-width: 180px;
    background: white;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    z-index: 1000;
}

.submenu {
    position: absolute;
    top: 0;
    left: 100%;
    margin-left: 0;
}

.dark .context-menu {
    background: #1a202c;
    border-color: rgba(255, 255, 255, 0.15);
    color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
</style> 