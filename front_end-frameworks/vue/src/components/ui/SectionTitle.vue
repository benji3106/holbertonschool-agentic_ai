<script setup>
import { computed } from "vue";

const props = defineProps({
  as: { type: String, default: "h2" },
  line1: { type: String, required: true },
  line2: { type: String, required: true },
});

const sizeClasses = computed(() =>
  props.as === "h1" ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl"
);
</script>

<template>
  <component
    :is="as"
    :class="`${sizeClasses} font-black tracking-tight leading-none text-slate-50`"
  >
    {{ line1 }}
    <br />
    <span class="text-violet-300">{{ line2 }}</span>
  </component>
</template>