<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'draft' | 'autosaved' | 'publishing' | 'published' | 'error' | string
}>()

const badgeConfig = computed(() => {
  switch (props.status) {
    case 'published':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
        label: 'Published',
        icon: '✓'
      }
    case 'publishing':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 animate-pulse',
        label: 'Publishing…',
        icon: '⟳'
      }
    case 'autosaved':
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30',
        label: 'Saved',
        icon: '✓'
      }
    case 'error':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
        label: 'Error',
        icon: '⚠️'
      }
    case 'draft':
    default:
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
        label: 'Draft',
        icon: '●'
      }
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all duration-300 shadow-xs',
      badgeConfig.bg
    ]"
  >
    <span class="text-[10px] font-mono leading-none">{{ badgeConfig.icon }}</span>
    <span>{{ badgeConfig.label }}</span>
  </span>
</template>
