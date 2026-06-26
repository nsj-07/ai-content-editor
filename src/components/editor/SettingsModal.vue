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

// Local copies of settings for editing
const geminiApiKey = ref(editorStore.settings.geminiApiKey)
const wordpressUrl = ref(editorStore.settings.wordpressUrl)
const wordpressUsername = ref(editorStore.settings.wordpressUsername)
const wordpressPassword = ref(editorStore.settings.wordpressPassword)
const useMockAi = ref(editorStore.settings.useMockAi)
const useMockWp = ref(editorStore.settings.useMockWp)

function handleSave() {
  editorStore.saveSettings({
    geminiApiKey: geminiApiKey.value,
    wordpressUrl: wordpressUrl.value,
    wordpressUsername: wordpressUsername.value,
    wordpressPassword: wordpressPassword.value,
    useMockAi: useMockAi.value,
    useMockWp: useMockWp.value
  })
  emit('close')
}
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300"
  >
    <div 
      class="glass-modal w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-indigo-50/40 to-purple-50/40 flex items-center justify-between">
        <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>⚙️</span> API & Connection Settings
        </h3>
        <button 
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-5">
        
        <!-- Gemini Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600">Google Gemini LLM</h4>
            <label class="flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                v-model="useMockAi" 
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span class="text-[11px] font-semibold text-amber-600">Simulate Streaming (Mock)</span>
            </label>
          </div>
          
          <div v-if="!useMockAi" class="space-y-1">
            <label class="block text-xs font-semibold text-gray-700">Gemini API Key</label>
            <input 
              type="password" 
              v-model="geminiApiKey" 
              placeholder="AIzaSy..." 
              class="w-full text-xs px-3 py-2 rounded-lg border border-gray-350 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white font-mono shadow-xs transition-all"
            />
            <p class="text-[10px] text-gray-400">
              Provide a valid Gemini API Key. Token-by-token server-sent event responses will stream directly in the side panel.
            </p>
          </div>
          <div v-else class="p-3 bg-amber-50/40 border border-amber-100/60 rounded-xl text-[11px] text-amber-700 leading-relaxed italic">
            💡 **Smart Mock Mode Enabled**: AI recommendations are simulated based on your article's title, text, and selection context. High-speed streaming is supported natively with no external keys required.
          </div>
        </div>

        <hr class="border-gray-150" />

        <!-- WordPress Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600">WordPress REST API</h4>
            <label class="flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                v-model="useMockWp" 
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span class="text-[11px] font-semibold text-amber-600">Simulate Publish (Mock)</span>
            </label>
          </div>

          <div v-if="!useMockWp" class="space-y-3">
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-gray-700">WordPress Site URL</label>
              <input 
                type="url" 
                v-model="wordpressUrl" 
                placeholder="https://myblog.com" 
                class="w-full text-xs px-3 py-2 rounded-lg border border-gray-350 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white shadow-xs transition-all"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-700">Username</label>
                <input 
                  type="text" 
                  v-model="wordpressUsername" 
                  placeholder="admin" 
                  class="w-full text-xs px-3 py-2 rounded-lg border border-gray-350 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white shadow-xs transition-all"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-gray-700">Application Password</label>
                <input 
                  type="password" 
                  v-model="wordpressPassword" 
                  placeholder="xxxx xxxx xxxx xxxx" 
                  class="w-full text-xs px-3 py-2 rounded-lg border border-gray-350 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white font-mono shadow-xs transition-all"
                />
              </div>
            </div>
            <p class="text-[10px] text-gray-400">
              Provide WordPress credentials. Enable **Application Passwords** in your WordPress site under **Users → Profile**. Direct REST queries bypass any server-side Gutenberg lockouts.
            </p>
          </div>
          <div v-else class="p-3 bg-amber-50/40 border border-amber-100/60 rounded-xl text-[11px] text-amber-700 leading-relaxed italic">
            💡 **Simulated WordPress Mode Enabled**: Publishes draft layouts to an authentic mock REST interface. Displays real-time POST body configurations, console networking logs, and simulated WordPress metadata success payloads.
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2.5">
        <button 
          @click="emit('close')"
          class="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-150 text-xs font-bold text-gray-700 cursor-pointer"
        >
          Cancel
        </button>
        <button 
          @click="handleSave"
          class="scale-on-hover px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
        >
          Save Configuration
        </button>
      </div>

    </div>
  </div>
</template>
