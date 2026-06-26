<script setup lang="ts">
import { ref } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import EditorToolbar from '@/components/editor/EditorToolbar.vue'
import AiSidePanel from '@/components/editor/AiSidePanel.vue'
import SettingsModal from '@/components/editor/SettingsModal.vue'
import PublishModal from '@/components/editor/PublishModal.vue'
import Badge from '@/components/ui/Badge.vue'
import { useEditorSetup } from '@/composables/useEditor'
import { useEditorStore } from '@/stores/editor.store'

const { editor } = useEditorSetup()
const editorStore = useEditorStore()

const isPublishOpen = ref(false)

function triggerAiBubbleAction() {
  // Triggers the "Improve paragraph" preset directly in the side panel
  editorStore.streamAiSuggestion(
    'Improve this paragraph, enhancing flow, rhythm, and clarity.',
    'improve'
  )
}
</script>

<template>
  <div class="flex flex-col h-full bg-slate-50/50 rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden bg-grid-pattern relative">
    
    <!-- Top Action Header -->
    <header class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-xs shrink-0">
      <div class="flex items-center gap-3">
        <span class="text-2xl">📝</span>
        <div>
          <h1 class="text-sm font-black text-gray-900 tracking-tight leading-none">WordPress Post Publisher</h1>
          <!-- <span class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">With AI suggestions</span> -->
        </div>
      </div>

      <!-- Settings, Publish and Status Indicators -->
      <div class="flex items-center gap-2.5">
        
        <!-- Status Badge -->
        <!-- <Badge :status="editorStore.document.status" /> -->

        <!-- <div class="w-px h-6 bg-gray-200 mx-1" /> -->

        <!-- Open WordPress REST Publish Modal -->
        <button 
          @click="isPublishOpen = true"
          class="scale-on-hover px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          Publish Post
        </button>

      </div>
    </header>

    <!-- Main Dual Column Workspace -->
    <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
      
      <!-- Left Column: Rich Text Canvas -->
      <main class="flex-1 flex flex-col min-w-0 bg-white relative">
        
        <!-- Post Title Input -->
        <div class="px-8 pt-8 pb-3 border-b border-gray-100 shrink-0">
          <input
            :value="editorStore.document.title"
            @input="editorStore.updateTitle(($event.target as HTMLInputElement).value)"
            placeholder="Post title…"
            class="w-full text-3xl font-black text-gray-900 placeholder-gray-200 border-none outline-none bg-transparent tracking-tight focus:ring-0 focus:border-none"
          />
          <div 
            v-if="editorStore.document.slug"
            class="text-[10px] text-gray-400 mt-1 font-mono flex items-center gap-1"
          >
            <span class="text-indigo-400">Slug:</span>
            <span>/{{ editorStore.document.slug }}</span>
          </div>
        </div>

        <!-- Tiptap Custom Toolbar -->
        <EditorToolbar :editor="editor" />

        <!-- Tiptap Rich Text Body -->
        <div class="flex-1 overflow-y-auto px-8 py-6 cursor-text" @click="editor?.commands.focus()">
          <div class="prose max-w-none prose-indigo leading-relaxed">
            <EditorContent :editor="editor" />
          </div>
        </div>

        <!-- Tiptap Floating Bubble Menu -->
        <BubbleMenu
          v-if="editor"
          :editor="editor"
          class="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 shrink-0 select-none overflow-hidden animate-in fade-in duration-200"
        >
          <button
            @click="editor.chain().focus().toggleBold().run()"
            :class="[
              'px-2.5 py-1.5 text-[10px] font-black rounded-md transition-colors cursor-pointer',
              editor.isActive('bold') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            ]"
          >
            B
          </button>
          
          <button
            @click="editor.chain().focus().toggleItalic().run()"
            :class="[
              'px-2.5 py-1.5 text-[10px] font-black italic rounded-md transition-colors cursor-pointer',
              editor.isActive('italic') ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            ]"
          >
            I
          </button>

          <button
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            :class="[
              'px-2.5 py-1.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer',
              editor.isActive('heading', { level: 3 }) ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            ]"
          >
            H3
          </button>

          <div class="w-px h-4 bg-slate-800 mx-1" />

          <!-- Magic Floating AI Trigger button -->
          <button
            @click="triggerAiBubbleAction"
            class="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-black shadow-lg transition-all animate-pulse hover:animate-none cursor-pointer"
          >
            <span>🪄</span> Ask AI
          </button>
        </BubbleMenu>

        <!-- Status Bottom Bar -->
        <!-- <footer class="flex items-center justify-between px-8 py-2.5 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 font-medium shrink-0">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              <span>Workspace Active</span>
            </span>
            <span>|</span>
            <span>Character Count: {{ editor?.storage.characterCount.characters() || 0 }}</span>
          </div>
          <span class="font-mono">Draft ID: {{ editorStore.document.id.substring(0, 8) }}</span>
        </footer> -->

      </main>

      <!-- Right Column: AI Sidebar Panel -->
      <AiSidePanel />

    </div>
    
    <PublishModal 
      :is-open="isPublishOpen" 
      @close="isPublishOpen = false" 
    />

  </div>
</template>
