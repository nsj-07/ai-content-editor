<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { useEditorStore } from "@/stores/editor.store";

defineProps<{ editor: Editor | undefined }>();

const editorStore = useEditorStore();

const btn =
  "px-2 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer";
const btnOn =
  "px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 cursor-pointer";
</script>

<template>
  <div
    v-if="editor"
    class="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-4 py-2"
  >
    <button
      @click="editor.chain().focus().toggleBold().run()"
      :class="editor.isActive('bold') ? btnOn : btn"
    >
      <strong>B</strong>
    </button>

    <button
      @click="editor.chain().focus().toggleItalic().run()"
      :class="editor.isActive('italic') ? btnOn : btn"
    >
      <em>I</em>
    </button>

    <div class="w-px h-5 bg-gray-300 mx-1" />

    <button
      v-for="level in [1, 2, 3]"
      :key="level"
      @click="
        editor
          .chain()
          .focus()
          .toggleHeading({ level: level as 1 | 2 | 3 })
          .run()
      "
      :class="editor.isActive('heading', { level }) ? btnOn : btn"
    >
      H{{ level }}
    </button>

    <div class="w-px h-5 bg-gray-300 mx-1" />

    <button
      @click="editor.chain().focus().toggleBulletList().run()"
      :class="editor.isActive('bulletList') ? btnOn : btn"
    >
      • List
    </button>

    <button
      @click="editor.chain().focus().toggleOrderedList().run()"
      :class="editor.isActive('orderedList') ? btnOn : btn"
    >
      1. List
    </button>

    <div class="w-px h-5 bg-gray-300 mx-1" />

    <button
      @click="editor.chain().focus().undo().run()"
      :disabled="!editor.can().undo()"
      :class="btn + ' disabled:opacity-30'"
    >
      ↩
    </button>

    <button
      @click="editor.chain().focus().redo().run()"
      :disabled="!editor.can().redo()"
      :class="btn + ' disabled:opacity-30'"
    >
      ↪
    </button>

    <div class="ml-auto text-xs text-gray-400 font-mono">
      {{ editorStore.wordCount }} words
    </div>
  </div>
</template>
