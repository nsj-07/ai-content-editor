import { ref } from 'vue'

export type ToastType = 'error' | 'warning' | 'success' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

// Module-scope singleton so all callers share the same toast queue
const toasts = ref<Toast[]>([])

const TOAST_DURATION_MS = 3500

export function useToast() {
  function showToast(message: string, type: ToastType = 'info') {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      dismissToast(id)
    }, TOAST_DURATION_MS)
  }

  function dismissToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    showToast,
    dismissToast,
  }
}
