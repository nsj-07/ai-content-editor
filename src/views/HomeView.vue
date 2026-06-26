<script setup lang="ts">
import { ref } from 'vue'
import EditorCanvas from "@/components/editor/EditorCanvas.vue"

const showTour = ref(true)
const activeStep = ref(0)

const tourSteps = [
  {
    title: '✨ Welcome to the WordPress AI Assistant!',
    desc: 'This premium, state-of-the-art content drafting dashboard is built with Vue 3 Composition API, TypeScript, and Pinia. Let\'s explore the features.'
  },
  {
    title: '🪄 Selection Bubble Actions',
    desc: 'Simply highlight/select any paragraph or sentence in the editor canvas. A glowing "Ask AI" bubble popover will appear instantly to refine your text.'
  },
  {
    title: '🏷️ Instant Streaming Side Panel',
    desc: 'Use the side presets on the right to auto-suggest 5 SEO headings or shorten sections. Watch the response render token-by-token in real time!'
  },
  {
    title: '🌐 Simulated REST Publisher',
    desc: 'Click "Publish Post" to test the WordPress REST pipeline. You\'ll see network logging consoles and raw JSON responses. Turn off mock modes in "Settings" at any time!'
  }
]

function nextStep() {
  if (activeStep.value < tourSteps.length - 1) {
    activeStep.value++
  } else {
    showTour.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 bg-grid-pattern-dark p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden">
    
    <!-- Decorative Glowing Aura Backgrounds -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
    <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

    <!-- Main Workspace Frame -->
    <div class="w-full max-w-6xl h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] flex-1 relative z-30 transition-all duration-300">
      <EditorCanvas />
    </div>

    <!-- Live Demo Floating Tour Button -->
    <button 
      v-if="!showTour" 
      @click="showTour = true; activeStep = 0"
      class="fixed bottom-4 left-4 z-40 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-350 hover:text-white border border-slate-700 rounded-lg text-[10px] font-bold tracking-wider uppercase shadow-xl transition-all scale-on-hover active:scale-95 flex items-center gap-1.5 cursor-pointer"
    >
      <span>💡</span> Quick Demo Tour
    </button>

  </div>
</template>

<style scoped>
.text-slate-350 {
  color: #cbd5e1;
}
.bg-slate-850 {
  background-color: #1e293b;
}
</style>
