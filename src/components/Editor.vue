<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { ListItem } from "@tiptap/extension-list";

const editor = ref<Editor | null>(null);

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({ types: [ListItem.name] }),
      StarterKit,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-5 focus:outline-none max-w-none dark:prose-invert min-h-[300px]",
      },
    },
    content: `
      <h2>Hi there,</h2>
      <p>This is a <em>basic</em> example of <strong>Tiptap</strong>.</p>
    `,
  });
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

const btnClass =
  "px-2.5 py-1.5 text-sm font-medium rounded border transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none";
const activeClass = "bg-blue-100 text-blue-700 border-blue-200";
const inactiveClass =
  "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";
</script>

<template>
  <div
    v-if="editor"
    class="flex flex-col w-full max-w-4xl mx-auto border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm mt-8"
  >
    <div class="bg-gray-50 border-b border-gray-300 p-2">
      <div class="flex flex-wrap gap-1.5 items-center">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :disabled="!editor.can().chain().focus().toggleBold().run()"
          :class="[
            btnClass,
            editor.isActive('bold') ? activeClass : inactiveClass,
          ]"
        >
          Bold
        </button>

        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
          :class="[
            btnClass,
            editor.isActive('italic') ? activeClass : inactiveClass,
          ]"
        >
          Italic
        </button>

        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
          :class="[
            btnClass,
            editor.isActive('strike') ? activeClass : inactiveClass,
          ]"
        >
          Strike
        </button>

        <button
          @click="editor.chain().focus().toggleCode().run()"
          :disabled="!editor.can().chain().focus().toggleCode().run()"
          :class="[
            btnClass,
            editor.isActive('code') ? activeClass : inactiveClass,
          ]"
        >
          Code
        </button>

        <button
          @click="editor.chain().focus().unsetAllMarks().run()"
          :class="[btnClass, inactiveClass]"
        >
          Clear marks
        </button>

        <button
          @click="editor.chain().focus().clearNodes().run()"
          :class="[btnClass, inactiveClass]"
        >
          Clear nodes
        </button>

        <div class="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          @click="editor.chain().focus().setParagraph().run()"
          :class="[
            btnClass,
            editor.isActive('paragraph') ? activeClass : inactiveClass,
          ]"
        >
          Paragraph
        </button>

        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="[
            btnClass,
            editor.isActive('heading', { level: 1 })
              ? activeClass
              : inactiveClass,
          ]"
        >
          H1
        </button>

        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="[
            btnClass,
            editor.isActive('bulletList') ? activeClass : inactiveClass,
          ]"
        >
          Bullet list
        </button>

        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="[
            btnClass,
            editor.isActive('orderedList') ? activeClass : inactiveClass,
          ]"
        >
          Ordered list
        </button>

        <div class="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().chain().focus().undo().run()"
          :class="[btnClass, inactiveClass]"
        >
          Undo
        </button>

        <button
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().chain().focus().redo().run()"
          :class="[btnClass, inactiveClass]"
        >
          Redo
        </button>

        <button
          @click="editor.chain().focus().setColor('#958DF1').run()"
          :class="[
            btnClass,
            editor.isActive('textStyle', { color: '#958DF1' })
              ? activeClass
              : inactiveClass,
          ]"
          style="color: #958df1"
        >
          Purple
        </button>
      </div>
    </div>

    <div
      class="bg-white overflow-y-auto cursor-text text-left"
      @click="editor?.commands.focus()"
    >
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.tiptap) {
  /* Remove top margin of the first child to align with container */
  > *:first-child {
    margin-top: 0;
  }
}
</style>
