<script setup lang="ts">
import { EditorContent } from "@tiptap/vue-3";
import EditorToolbar from "./EditorToolbar.vue";
import { useEditorSetup } from "@/composables/useEditor";
import { useEditorStore } from "@/stores/editor.store";

const { editor } = useEditorSetup();
const editorStore = useEditorStore();
</script>

<template>
  <div
    class="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
  >
    <!-- Title input -->
    <div class="px-8 pt-8 pb-2">
      <input
        :value="editorStore.document.title"
        @input="
          editorStore.updateTitle(($event.target as HTMLInputElement).value)
        "
        placeholder="Post title…"
        class="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent"
      />
      <div
        v-if="editorStore.document.slug"
        class="text-xs text-gray-400 mt-1 font-mono"
      >
        /{{ editorStore.document.slug }}
      </div>
    </div>

    <!-- Toolbar -->
    <EditorToolbar :editor="editor" />

    <!-- Editor body -->
    <div class="flex-1 overflow-y-auto px-8 py-6">
      <EditorContent :editor="editor" />
    </div>

    <!-- Status bar -->
    <div
      class="flex items-center justify-between px-8 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400"
    >
      <span>{{ editorStore.isDirty ? "● Unsaved changes" : "✓ Saved" }}</span>
      <span>{{ editorStore.document.status }}</span>
    </div>
  </div>
</template>
