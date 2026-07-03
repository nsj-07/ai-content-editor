import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { onBeforeUnmount } from 'vue'
import { useEditorStore } from '@/stores/editor.store'
import { marked } from 'marked'

/**
 * Compiled once at module load time — not inside the update callback.
 * Previously these were re-created on every keystroke, causing unnecessary
 * garbage collection pressure.
 */
const MARKDOWN_PATTERNS: RegExp[] = [
  /^#{1,6}\s+\S/m,           // # Headings
  /\*\*[^*\n]+\*\*/,         // **bold**
  /(?<!\*)\*[^*\n]+\*(?!\*)/, // *italic*
  /^[-*+]\s+\S/m,             // - unordered list
  /^\d+\.\s+\S/m,             // 1. ordered list
  /^>\s+\S/m,                 // > blockquote
  /```[\s\S]*?```/,            // ```code block```
  /`[^`\n]+`/,                // `inline code`
  /\[[^\]]+\]\(https?:\/\//,  // [link](url)
]

/**
 * Detects whether a string contains Markdown syntax worth converting.
 * Checks for headings, bold/italic, lists, blockquotes, code blocks, and links.
 */
function looksLikeMarkdown(text: string): boolean {
  return MARKDOWN_PATTERNS.some((pattern) => pattern.test(text))
}

export function useEditorSetup() {
  const editorStore = useEditorStore()

  // Prevents re-triggering onUpdate when we inject converted HTML ourselves
  let isConvertingMarkdown = false

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

      // Skip if we triggered this update ourselves during markdown conversion
      if (isConvertingMarkdown) return

      const plainText = editor.state.doc.textContent
      if (looksLikeMarkdown(plainText)) {
        const html = marked.parse(plainText) as string
        isConvertingMarkdown = true
        editor.commands.setContent(html, { emitUpdate: false })
        isConvertingMarkdown = false
      }
    },

    onSelectionUpdate({ editor }) {
      const { from, to } = editor.state.selection
      const selectedText = from !== to
        ? editor.state.doc.textBetween(from, to, ' ')
        : ''
      editorStore.updateSelection(selectedText)
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