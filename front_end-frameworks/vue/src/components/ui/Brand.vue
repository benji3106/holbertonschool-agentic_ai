<script setup>
import { BrainCircuit } from "lucide-vue-next";

defineProps({
  href: {
    type: String,
    default: null,
  },
});
</script>

<template>
  <a v-if="href" :href="href" class="flex items-center gap-2">
    <span class="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500 shadow-lg shadow-violet-500/40">
      <BrainCircuit class="w-5 h-5 text-white" />
    </span>
    <span class="text-slate-50 font-semibold text-lg">Agentic AI</span>
  </a>
  <div v-else class="flex items-center gap-2">
    <span class="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500 shadow-lg shadow-violet-500/40">
      <BrainCircuit class="w-5 h-5 text-white" />
    </span>
    <span class="text-slate-50 font-semibold text-lg">Agentic AI</span>
  </div>
</template>