import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { EditorDocument } from '@/types/editor.types'
import { createEmptyDocument } from '@/types/editor.types'

export const useEditorStore = defineStore('editor', () => {
  // State
  const document = ref<EditorDocument>(createEmptyDocument())
  const isDirty = ref(false)
  const lastSavedAt = ref<string | null>(null)

  // We store the editor instance outside Pinia state (never put class instances in reactive state)
  let editorInstance: Editor | null = null

  // Getters
  const wordCount = computed(() => document.value.wordCount)
  const hasTitle = computed(() => document.value.title.trim().length > 0)

  // Actions
  function setEditorInstance(editor: Editor) {
    editorInstance = editor
  }

  function updateTitle(title: string) {
    document.value.title = title
    document.value.slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    isDirty.value = true
  }

  function updateContent(wordCount: number) {
    document.value.wordCount = wordCount
    document.value.updatedAt = new Date().toISOString()
    isDirty.value = true
  }

  function getEditorInstance() {
    return editorInstance
  }

  return {
    document,
    isDirty,
    lastSavedAt,
    wordCount,
    hasTitle,
    setEditorInstance,
    updateTitle,
    updateContent,
    getEditorInstance,
  }
})