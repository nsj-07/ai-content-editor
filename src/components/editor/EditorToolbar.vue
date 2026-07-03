<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { useEditorStore } from "@/stores/editor.store";

defineProps<{ editor: Editor | undefined }>();

const editorStore = useEditorStore();

const btn =
  "p-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer flex items-center justify-center min-w-[28px] border border-transparent scale-on-hover active:scale-95";
const btnOn =
  "p-1.5 rounded-lg text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 transition-all flex items-center justify-center min-w-[28px]";
</script>

<template>
  <div
    v-if="editor"
    class="flex flex-wrap items-center gap-1.5 border-b border-gray-150 bg-slate-50/60 px-6 py-2.5 shrink-0 select-none"
  >
    <!-- Bold -->
    <button
      @click="editor.chain().focus().toggleBold().run()"
      :class="editor.isActive('bold') ? btnOn : btn"
      title="Bold (⌘+B)"
    >
      <strong>B</strong>
    </button>

    <!-- Italic -->
    <button
      @click="editor.chain().focus().toggleItalic().run()"
      :class="editor.isActive('italic') ? btnOn : btn"
      title="Italic (⌘+I)"
    >
      <em class="font-serif">I</em>
    </button>

    <!-- Strike -->
    <button
      @click="editor.chain().focus().toggleStrike().run()"
      :class="editor.isActive('strike') ? btnOn : btn"
      title="Strikethrough"
    >
      <span class="line-through">S</span>
    </button>

    <!-- Code inline -->
    <button
      @click="editor.chain().focus().toggleCode().run()"
      :class="editor.isActive('code') ? btnOn : btn"
      title="Inline Code"
    >
      <span class="font-mono bg-gray-100/80 px-1 py-0.5 rounded text-[10px]">code</span>
    </button>

    <div class="w-px h-5 bg-gray-200 mx-1" />

    <!-- Headings -->
    <button
      v-for="level in [1, 2, 3]"
      :key="level"
      @click="editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()"
      :class="editor.isActive('heading', { level }) ? btnOn : btn"
      :title="'Heading ' + level"
    >
      H{{ level }}
    </button>

    <div class="w-px h-5 bg-gray-200 mx-1" />

    <!-- Bullet list -->
    <button
      @click="editor.chain().focus().toggleBulletList().run()"
      :class="editor.isActive('bulletList') ? btnOn : btn"
      title="Bullet List"
    >
      • List
    </button>

    <!-- Ordered list -->
    <button
      @click="editor.chain().focus().toggleOrderedList().run()"
      :class="editor.isActive('orderedList') ? btnOn : btn"
      title="Numbered List"
    >
      1. List
    </button>

    <!-- Blockquote -->
    <button
      @click="editor.chain().focus().toggleBlockquote().run()"
      :class="editor.isActive('blockquote') ? btnOn : btn"
      title="Blockquote"
    >
      “ ”
    </button>

    <div class="w-px h-5 bg-gray-200 mx-1" />

    <!-- Undo -->
    <button
      @click="editor.chain().focus().undo().run()"
      :disabled="!editor.can().undo()"
      :class="[btn, 'disabled:opacity-30 disabled:pointer-events-none']"
      title="Undo (⌘+Z)"
    >
      ↩
    </button>

    <!-- Redo -->
    <button
      @click="editor.chain().focus().redo().run()"
      :disabled="!editor.can().redo()"
      :class="[btn, 'disabled:opacity-30 disabled:pointer-events-none']"
      title="Redo (⌘+Shift+Z)"
    >
      ↪
    </button>

    <!-- Live Statistics word count -->
    <div class="ml-auto flex items-center gap-3">
      <span class="text-[10px] text-gray-400 font-bold font-mono tracking-wide uppercase bg-white border border-gray-150 px-2.5 py-1 rounded-md">
        {{ editorStore.wordCount }} words
      </span>
    </div>
  </div>
</template>
