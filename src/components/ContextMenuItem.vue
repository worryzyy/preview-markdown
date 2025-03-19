<template>
    <div class="context-menu-item" :class="{ divider: divider, 'has-submenu': hasSubmenu }" @mouseenter="showSubmenu" @mouseleave="hideSubmenuDelayed" @click.stop="handleClick">
        <div class="menu-item-content">
            <slot></slot>
            <span v-if="hasSubmenu" class="submenu-indicator">▸</span>
        </div>
        <div v-if="hasSubmenu" class="submenu-container" :class="{ 'submenu-visible': submenuVisible }">
            <slot name="submenu"></slot>
        </div>
    </div>
</template>

<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue'

const props = defineProps({
    divider: {
        type: Boolean,
        default: false,
    },
    hasSubmenu: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['click'])
const submenuVisible = ref(false)
let hideTimeout = null

// 初始化时设置默认状态
onMounted(() => {
    // 如果需要调试，可以默认显示子菜单
    // submenuVisible.value = props.hasSubmenu
})

const showSubmenu = () => {
    if (props.hasSubmenu) {
        if (hideTimeout) {
            clearTimeout(hideTimeout)
            hideTimeout = null
        }
        submenuVisible.value = true
        console.log('Show submenu', submenuVisible.value) // 调试日志
    }
}

const hideSubmenuDelayed = () => {
    if (props.hasSubmenu) {
        hideTimeout = setTimeout(() => {
            submenuVisible.value = false
            console.log('Hide submenu', submenuVisible.value) // 调试日志
        }, 300) // 延迟关闭，避免鼠标移动到子菜单过程中关闭
    }
}

const handleClick = (event) => {
    // 如果有子菜单，点击时切换子菜单显示状态
    if (props.hasSubmenu) {
        submenuVisible.value = !submenuVisible.value
        console.log('Toggle submenu on click', submenuVisible.value) // 调试日志
        event.stopPropagation() // 阻止事件冒泡，防止菜单关闭
    } else {
        emit('click', event)
    }
}

// 组件卸载时清理定时器
onBeforeUnmount(() => {
    if (hideTimeout) {
        clearTimeout(hideTimeout)
    }
})
</script>

<style>
.context-menu-item {
    padding: 8px 16px;
    cursor: pointer;
    user-select: none;
    position: relative;
    white-space: nowrap;
}

.menu-item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.context-menu-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.dark .context-menu-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.divider {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: 4px;
    padding-top: 4px;
}

.dark .divider {
    border-top-color: rgba(255, 255, 255, 0.1);
}

.submenu-indicator {
    margin-left: 8px;
    font-size: 0.8em;
}

.submenu-container {
    position: absolute;
    top: 0;
    left: 100%;
    margin-left: 2px;
    background: white;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1010;
    min-width: 180px;
    display: none;
}

.dark .submenu-container {
    background: #1a202c;
    border-color: rgba(255, 255, 255, 0.15);
    color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.submenu-visible {
    display: block !important;
}

.has-submenu {
    position: relative;
}

/* 使子菜单项在悬浮时也显示子菜单 */
.has-submenu:hover .submenu-container {
    display: block !important;
}
</style> 
