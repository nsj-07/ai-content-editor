import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { onBeforeUnmount } from 'vue'
import { useEditorStore } from '@/stores/editor.store'
import { marked } from 'marked'

// Detects whether a string contains Markdown syntax worth converting.
// Checks for headings, bold/italic, lists, blockquotes, code blocks, and links.
function looksLikeMarkdown(text: string): boolean {
  const mdPatterns = [
    /^#{1,6}\s+\S/m,          // # Headings
    /\*\*[^*\n]+\*\*/,        // **bold**
    /(?<!\*)\*[^*\n]+\*(?!\*)/,// *italic*
    /^[-*+]\s+\S/m,            // - unordered list
    /^\d+\.\s+\S/m,            // 1. ordered list
    /^>\s+\S/m,                // > blockquote
    /```[\s\S]*?```/,           // ```code block```
    /`[^`\n]+`/,               // `inline code`
    /\[[^\]]+\]\(https?:\/\//,  // [link](url)
  ]
  return mdPatterns.some((pattern) => pattern.test(text))
}

export function useEditorSetup() {
  const editorStore = useEditorStore()

  // Track whether we're currently injecting converted HTML to prevent re-triggering
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

    content: `
      <h2>The Future of Content Creation: AI-Assisted Workflows</h2>
      <p>Drafting high-quality articles has historically been a time-consuming process. Content writers often struggle with pacing, layout formatting, and creating engaging headlines that drive organic search value.</p>
      <p>By leveraging standard client-side LLM suggestions, authors can refine paragraphs, suggest SEO-friendly sub-headings, and compress complex prose into concise takeaway lists instantly. Select any block of text in this editor to see the floating assistant menu or use the quick actions panel on the right.</p>
    `,

    onUpdate({ editor }) {
      const stats = editor.storage.characterCount
      editorStore.updateContent(stats.words())

      // Skip if we triggered this update ourselves during conversion
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
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, ' ')
        editorStore.updateSelection(text)
      } else {
        editorStore.updateSelection('')
      }
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