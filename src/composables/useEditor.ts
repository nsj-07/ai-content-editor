import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { watch, onBeforeUnmount } from 'vue'
import { useEditorStore } from '@/stores/editor.store'

export function useEditorSetup() {
  const editorStore = useEditorStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post… or press / for AI commands',
      }),
      CharacterCount,
    ],

    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[400px] px-2',
      },
    },

    onUpdate({ editor }) {
      const stats = editor.storage.characterCount
      editorStore.updateContent(stats.words())
    },

    onCreate({ editor }) {
      editorStore.setEditorInstance(editor)
    },
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return { editor }
}