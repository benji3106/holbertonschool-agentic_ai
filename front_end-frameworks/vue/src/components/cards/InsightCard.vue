<script setup>
defineProps({
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  index: { type: Number, required: true },
});
</script>

<template>
  <article
    class="relative overflow-hidden rounded-3xl border border-slate-800 shadow-xl shadow-slate-950/40 h-80 hover:[&>img]:scale-110 hover:[&>img]:brightness-50"
    :class="{ 'md:col-span-2': index === 0 }"
  >
    <img
      class="absolute inset-0 w-full h-full object-cover"
      :src="image"
      :alt="title"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
    <div class="relative h-full flex flex-col justify-end items-start p-6">
      <span class="inline-block px-4 py-2 text-xs text-violet-300 rounded-full border border-violet-500/20 bg-violet-500/10 mb-4">
        {{ category }}
      </span>
      <h3 class="text-slate-50 font-semibold text-lg">{{ title }}</h3>
      <p class="mt-2 text-sm md:text-base text-slate-300">
        {{ description }}
      </p>
    </div>
  </article>
</template>