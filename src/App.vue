<!-- <script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template> -->
<script setup lang="ts">
import EditorCanvas from "@/components/editor/EditorCanvas.vue";
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto h-[calc(100vh-3rem)]">
      <EditorCanvas />
    </div>
  </div>
</template>
