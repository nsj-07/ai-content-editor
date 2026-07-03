<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismissToast } = useToast()

const iconMap = {
  error: '✕',
  warning: '!',
  success: '✓',
  info: 'i',
}

const styleMap = {
  error: 'bg-rose-600 border-rose-500 text-white',
  warning: 'bg-amber-500 border-amber-400 text-white',
  success: 'bg-emerald-600 border-emerald-500 text-white',
  info: 'bg-indigo-600 border-indigo-500 text-white',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2.5"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :id="`toast-${toast.id}`"
          :class="[
            'flex items-start gap-3 pointer-events-auto',
            'min-w-[280px] max-w-sm px-4 py-3',
            'rounded-xl border shadow-xl backdrop-blur-sm',
            'cursor-pointer select-none',
            styleMap[toast.type],
          ]"
          @click="dismissToast(toast.id)"
          role="alert"
        >
          <!-- Icon -->
          <span
            class="flex-shrink-0 w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-[11px] font-black leading-none mt-px"
          >
            {{ iconMap[toast.type] }}
          </span>

          <!-- Message -->
          <p class="text-xs font-semibold leading-relaxed flex-1">
            {{ toast.message }}
          </p>

          <!-- Dismiss hint -->
          <span class="flex-shrink-0 text-white/60 text-[10px] font-bold leading-none mt-0.5">
            ✕
          </span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.toast-move {
  transition: transform 0.2s ease;
}
</style>
