<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editor.store'

const editorStore = useEditorStore()
const customPrompt = ref('')
const expandedHistoryId = ref<string | null>(null)
const responseContainer = ref<HTMLDivElement | null>(null)

// Auto-scroll the response text area while streaming
watch(
  () => editorStore.activeResponse,
  () => {
    if (editorStore.aiStreamingStatus === 'streaming') {
      nextTick(() => {
        if (responseContainer.value) {
          responseContainer.value.scrollTop = responseContainer.value.scrollHeight
        }
      })
    }
  }
)

const isSelectionActive = computed(() => {
  return editorStore.selectionText.trim().length > 0
})

const shortenedSelection = computed(() => {
  const text = editorStore.selectionText.trim()
  if (text.length <= 80) return text
  return text.substring(0, 77) + '...'
})

function triggerPreset(type: 'improve' | 'headings' | 'shorten') {
  let prompt = ''
  if (type === 'improve') {
    prompt = 'Rewrite this paragraph in a professional, engaging, and natural tone. Improve clarity, flow, and readability while keeping it concise and human-like. Return only the improved version without explanations.'
  } else if (type === 'shorten') {
    prompt = 'Shorten this text to exactly 2 concise, highly punchy sentences.'
  } else if (type === 'headings') {
    prompt = 'Analyze the document content and suggest 5 SEO-friendly, high-converting headings.'
  }
  editorStore.streamAiSuggestion(prompt, type)
}

function submitCustomPrompt() {
  const prompt = customPrompt.value.trim()
  if (!prompt) return
  editorStore.streamAiSuggestion(prompt, 'custom')
  customPrompt.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    submitCustomPrompt()
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  alert('Copied suggestion to clipboard!')
}

function toggleHistory(id: string) {
  expandedHistoryId.value = expandedHistoryId.value === id ? null : id
}
</script>

<template>
  <div class="flex flex-col h-full glass-panel border-l border-gray-200 w-full md:w-[380px] shrink-0 overflow-hidden shadow-2xl relative">
    
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-200 bg-linear-to-r from-indigo-50/50 to-purple-50/50 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div>
          <h3 class="text-sm font-bold text-gray-900 leading-none">AI Content Assistant</h3>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
      
      <!-- Selection Context Tracker -->
      <div class="glass-card rounded-xl p-3 border border-indigo-100/50">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold tracking-wider text-indigo-500 uppercase">Active Context</span>
          <span
            :class="[
              'text-[10px] font-medium px-1.5 py-0.5 rounded-sm',
              isSelectionActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'
            ]"
          >
            {{ isSelectionActive ? 'Text Selected' : 'Entire Document' }}
          </span>
        </div>
        <p class="text-xs text-gray-600 italic leading-relaxed">
          {{ isSelectionActive ? `"${shortenedSelection}"` : 'Write something and select a paragraph, or ask the AI to suggest headings directly.' }}
        </p>
      </div>

      <!-- Presets and AI actions -->
      <div>
        <h4 class="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">Quick AI Actions</h4>
        <div class="grid grid-cols-1 gap-2">
          
          <button
            id="ai-improve-btn"
            @click="triggerPreset('improve')"
            :disabled="editorStore.aiStreamingStatus === 'streaming'"
            class="scale-on-hover flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all disabled:opacity-50 text-xs font-semibold text-gray-700 group cursor-pointer"
          >
            <span class="flex items-center gap-2">
              <span class="text-indigo-500 group-hover:scale-110 transition-transform">+</span>
              Improve Paragraph
            </span>
            <span class="text-[10px] text-gray-400 font-mono">Refine</span>
          </button>

          <button
            id="ai-shorten-btn"
            @click="triggerPreset('shorten')"
            :disabled="editorStore.aiStreamingStatus === 'streaming'"
            class="scale-on-hover flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all disabled:opacity-50 text-xs font-semibold text-gray-700 group cursor-pointer"
          >
            <span class="flex items-center gap-2">
              <span class="text-indigo-500 group-hover:scale-110 transition-transform">-</span>
              Shorten to 2 sentences
            </span>
            <span class="text-[10px] text-gray-400 font-mono">Compress</span>
          </button>

          <button
            id="ai-headings-btn"
            @click="triggerPreset('headings')"
            :disabled="editorStore.aiStreamingStatus === 'streaming'"
            class="scale-on-hover flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition-all disabled:opacity-50 text-xs font-semibold text-gray-700 group cursor-pointer"
          >
            <span class="flex items-center gap-2">
              <span class="text-indigo-500 group-hover:scale-110 transition-transform">#</span>
              Suggest 5 SEO Headings
            </span>
            <span class="text-[10px] text-gray-400 font-mono">Outline</span>
          </button>

        </div>
      </div>

      <!-- Custom prompt block -->
      <div>
        <h4 class="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-2">Custom AI Command</h4>
        <div class="relative rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white p-2">
          <textarea
            id="ai-custom-prompt"
            v-model="customPrompt"
            @keydown="handleKeydown"
            :disabled="editorStore.aiStreamingStatus === 'streaming'"
            placeholder="Ask AI to 'make this funny' or 'summarize in bullet points'..."
            class="w-full text-xs text-gray-700 bg-transparent border-none outline-none resize-none h-16 px-1 py-1 focus:ring-0 placeholder-gray-400"
          />
          <div class="flex items-center justify-between pt-1 border-t border-gray-100">
            <span class="text-[9px] text-gray-400 font-mono">Cmd+Enter to send</span>
            <button
              id="ai-submit-btn"
              @click="submitCustomPrompt"
              :disabled="!customPrompt.trim() || editorStore.aiStreamingStatus === 'streaming'"
              class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-bold shadow-xs hover:shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer"
            >
              Ask AI
            </button>
          </div>
        </div>
      </div>

      <!-- Streaming / Active Response Output Area -->
      <div
        v-if="editorStore.aiStreamingStatus !== 'idle'"
        :class="[
          'rounded-xl border p-4 bg-slate-50 transition-all duration-300 relative',
          editorStore.aiStreamingStatus === 'streaming' ? 'ai-glowing-response bg-indigo-50/10' : 'border-gray-200 shadow-sm'
        ]"
      >
        <!-- Streaming header indicator -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span v-if="editorStore.aiStreamingStatus === 'streaming'" class="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
            <span
              :class="[
                'text-[10px] font-bold tracking-wider uppercase',
                editorStore.aiStreamingStatus === 'streaming' ? 'text-indigo-600' : 'text-gray-500'
              ]"
            >
              {{ editorStore.aiStreamingStatus === 'streaming' ? 'Generating suggestion...' : 'AI Suggestion' }}
            </span>
          </div>
          <button
            @click="editorStore.resetPublishState"
            v-if="editorStore.aiStreamingStatus !== 'streaming'"
            class="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
            title="Clear suggestion"
          >
            x
          </button>
        </div>

        <!-- Response Body -->
        <div
          ref="responseContainer"
          :class="[
            'text-xs leading-relaxed text-gray-800 overflow-y-auto max-h-[220px] whitespace-pre-wrap font-sans',
            editorStore.aiStreamingStatus === 'streaming' ? 'typing-cursor' : ''
          ]"
        >
          {{ editorStore.activeResponse }}
        </div>

        <!-- Action toolbar (only shows on success completion) -->
        <div
          v-if="editorStore.aiStreamingStatus === 'completed'"
          class="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-200/60"
        >
          <button
            @click="editorStore.applyAiSuggestion(editorStore.activeResponse, 'replace')"
            :disabled="!isSelectionActive"
            :class="[
              'flex-1 py-1.5 rounded-md text-[10px] font-bold text-center border transition-all cursor-pointer',
              isSelectionActive
                ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs hover:bg-indigo-700'
                : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60 cursor-not-allowed'
            ]"
            :title="isSelectionActive ? 'Replace your highlighted text' : 'Highlight some text in the editor to replace it'"
          >
            Replace Selected
          </button>
          
          <button
            @click="editorStore.applyAiSuggestion(editorStore.activeResponse, 'insert')"
            class="flex-1 py-1.5 rounded-md text-[10px] font-bold text-center bg-white border border-gray-200 text-gray-700 shadow-xs hover:bg-gray-50 transition-all cursor-pointer"
          >
            Insert at Cursor
          </button>

          <button
            @click="copyToClipboard(editorStore.activeResponse)"
            class="p-1.5 rounded-md bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
            title="Copy suggestion to clipboard"
          >
            Copy
          </button>
        </div>
      </div>

      <!-- History Accordion -->
      <div v-if="editorStore.aiHistory.length > 0" class="pt-2">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Suggestion History</h4>
          <span class="text-[9px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-sm">
            {{ editorStore.aiHistory.length }} drafts
          </span>
        </div>
        <div class="space-y-1.5">
          <div
            v-for="item in editorStore.aiHistory"
            :key="item.id"
            class="rounded-lg border border-gray-200/80 bg-white/60 overflow-hidden"
          >
            <button
              @click="toggleHistory(item.id)"
              class="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <span class="truncate max-w-[190px]" :title="item.prompt">
                {{ item.prompt }}
              </span>
              <span class="text-[9px] font-mono text-gray-400 shrink-0">
                {{ item.timestamp }} {{ expandedHistoryId === item.id ? '▲' : '▼' }}
              </span>
            </button>
            
            <div
              v-if="expandedHistoryId === item.id"
              class="px-3 pb-3 border-t border-gray-100 bg-gray-50/50 space-y-2.5"
            >
              <div v-if="item.contextText" class="pt-2">
                <span class="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Prompt Context</span>
                <p class="text-[10px] text-gray-500 italic">"{{ item.contextText }}"</p>
              </div>
              <div>
                <span class="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">AI Response</span>
                <div class="text-[11px] text-gray-700 leading-relaxed font-sans whitespace-pre-wrap bg-white border border-gray-150 p-2.5 rounded-md max-h-[140px] overflow-y-auto">
                  {{ item.response }}
                </div>
              </div>
              <div class="flex gap-1.5">
                <button
                  @click="editorStore.applyAiSuggestion(item.response, 'insert')"
                  class="flex-1 py-1 bg-white border border-gray-200 text-gray-600 rounded-md text-[10px] font-bold text-center hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Insert at Cursor
                </button>
                <button
                  @click="copyToClipboard(item.response)"
                  class="px-2.5 py-1 bg-white border border-gray-200 text-gray-500 rounded-md text-[10px] hover:text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
