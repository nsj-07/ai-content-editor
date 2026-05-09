import type { JSONContent } from '@tiptap/vue-3'

export type DocumentStatus = 'draft' | 'autosaved' | 'publishing' | 'published' | 'error'

export interface EditorDocument {
  id: string
  title: string
  slug: string
  content: JSONContent | null
  wordCount: number
  status: DocumentStatus
  createdAt: string
  updatedAt: string
}

export function createEmptyDocument(): EditorDocument {
  return {
    id: crypto.randomUUID(),
    title: '',
    slug: '',
    content: null,
    wordCount: 0,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}