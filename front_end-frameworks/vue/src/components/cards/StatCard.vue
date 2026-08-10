<script setup>
defineProps({
  value: { type: String, required: true },
  label: { type: String, required: true },
});
</script>

<template>
  <div class="p-6 rounded-xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/40">
    <p class="text-3xl font-black text-violet-300">{{ value }}</p>
    <p class="mt-1 text-sm text-slate-500">{{ label }}</p>
  </div>
</template>