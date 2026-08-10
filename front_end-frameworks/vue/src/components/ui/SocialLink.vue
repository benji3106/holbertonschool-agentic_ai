<script setup>
defineProps({
  href: { type: String, required: true },
  label: { type: String, required: true },
});
</script>

<template>
  <a :href="href" target="_blank" rel="noopener noreferrer" :aria-label="label" class="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
    <slot />
  </a>
</template>