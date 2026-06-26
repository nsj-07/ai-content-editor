<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editor.store'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const editorStore = useEditorStore()
const selectedStatus = ref<'draft' | 'publish'>('draft')

function handlePublish() {
  editorStore.publishToWordPress(selectedStatus.value)
}

function handleClose() {
  editorStore.resetPublishState()
  emit('close')
}
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300"
  >
    <div 
      class="glass-modal w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-indigo-50/40 to-purple-50/40 flex items-center justify-between">
        <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>🌐</span> Publish to WordPress REST API
        </h3>
        <button 
          @click="handleClose"
          :disabled="editorStore.document.status === 'publishing'"
          class="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none cursor-pointer disabled:opacity-30"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-4">
        
        <!-- Step 1: Pre-publishing credentials and options review -->
        <div v-if="editorStore.document.status !== 'publishing' && !editorStore.publishLog" class="space-y-4">
          <div class="p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl flex items-start gap-3">
            <span class="text-xl">✍️</span>
            <div class="text-xs text-gray-700 leading-relaxed">
              <p class="font-bold text-indigo-900 mb-0.5">Ready to publish your article?</p>
              <p class="mb-1.5">
                We'll parse your rich-text canvas content into polished, web-ready Gutenberg HTML blocks and post it straight to your WordPress database.
              </p>
              <div class="flex items-center gap-2 font-mono text-[10px] text-indigo-600 bg-white/70 px-2 py-1 rounded border border-indigo-100 w-fit">
                <span>🔗 {{ editorStore.settings.useMockWp ? 'Simulated Local REST Portal' : editorStore.settings.wordpressUrl || 'No Site Set' }}</span>
              </div>
            </div>
          </div>

          <!-- Document details summary -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-white border border-gray-150 rounded-xl">
              <span class="text-[9px] font-bold text-gray-400 uppercase block">Article Title</span>
              <span class="text-xs font-semibold text-gray-800 truncate block mt-0.5">
                {{ editorStore.document.title || 'Untitled Draft' }}
              </span>
            </div>
            <div class="p-3 bg-white border border-gray-150 rounded-xl">
              <span class="text-[9px] font-bold text-gray-400 uppercase block">Document Statistics</span>
              <span class="text-xs font-semibold text-gray-800 block mt-0.5">
                {{ editorStore.wordCount }} Words
              </span>
            </div>
          </div>

          <!-- Select Publish status -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">WordPress Post Status</label>
            <div class="grid grid-cols-2 gap-2">
              <label 
                :class="[
                  'flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer bg-white text-left',
                  selectedStatus === 'draft' ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-200 hover:bg-gray-50'
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-gray-800">Draft Post</span>
                  <input type="radio" value="draft" v-model="selectedStatus" class="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                </div>
                <p class="text-[10px] text-gray-500">Post will appear inside WordPress Admin drafts dashboard for staging checks.</p>
              </label>

              <label 
                :class="[
                  'flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer bg-white text-left',
                  selectedStatus === 'publish' ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-200 hover:bg-gray-50'
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-gray-800">Public Post</span>
                  <input type="radio" value="publish" v-model="selectedStatus" class="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                </div>
                <p class="text-[10px] text-gray-500">Post will go live immediately on your WordPress homepage. visible to all users.</p>
              </label>
            </div>
          </div>
        </div>

        <!-- Step 2 & 3: Connection logs and return payloads -->
        <div v-else class="space-y-4">
          <!-- Live log console -->
          <div class="space-y-1.5">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Network Connection Console</span>
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-400 leading-relaxed shadow-inner h-56 overflow-y-auto whitespace-pre-wrap">
              {{ editorStore.publishLog }}
              <!-- Pulsating cursor during active network request -->
              <span v-if="editorStore.document.status === 'publishing'" class="typing-cursor font-bold" />
            </div>
          </div>

          <!-- Successful response shortcut card -->
          <div 
            v-if="editorStore.document.status === 'published' && editorStore.publishedPostUrl"
            class="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">🎉</span>
              <div>
                <p class="text-xs font-bold text-emerald-900">Post published successfully!</p>
                <p class="text-[10px] text-emerald-600">The article was written into database servers.</p>
              </div>
            </div>
            <a 
              :href="editorStore.publishedPostUrl" 
              target="_blank" 
              class="scale-on-hover px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              Visit Post ↗
            </a>
          </div>

          <!-- Failed publishing error warnings -->
          <div 
            v-if="editorStore.document.status === 'error'"
            class="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in slide-in-from-bottom-2"
          >
            <span class="text-xl">⚠️</span>
            <div>
              <p class="text-xs font-bold text-rose-900">WordPress publishing failed</p>
              <p class="text-[10px] text-rose-600 mt-0.5">
                Ensure your credentials, site host, and CORS configurations are set up. Try turning on **Simulate Publish** inside settings to showcase it.
              </p>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer controls -->
      <div class="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2.5">
        <button 
          @click="handleClose"
          :disabled="editorStore.document.status === 'publishing'"
          class="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-150 text-xs font-bold text-gray-700 cursor-pointer disabled:opacity-30"
        >
          {{ editorStore.document.status === 'published' || editorStore.document.status === 'error' ? 'Close' : 'Cancel' }}
        </button>
        <button 
          v-if="editorStore.document.status !== 'publishing' && !editorStore.publishLog"
          @click="handlePublish"
          class="scale-on-hover px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
        >
          Publish Post Now
        </button>
        <button 
          v-else-if="editorStore.document.status === 'error'"
          @click="editorStore.resetPublishState"
          class="scale-on-hover px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
        >
          Retry Connection
        </button>
      </div>

    </div>
  </div>
</template>
