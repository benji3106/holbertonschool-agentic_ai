<script>
  let { icon: Icon, title, description } = $props();
</script>

<article class="p-8 rounded-3xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/40">
  <span class="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-500 shadow-lg shadow-violet-500/40 mb-4">
    <Icon class="w-6 h-6 text-white" />
  </span>
  <h3 class="text-slate-50 font-semibold text-lg">{title}</h3>
  <p class="mt-2 text-sm md:text-base text-slate-300">{description}</p>
</article>