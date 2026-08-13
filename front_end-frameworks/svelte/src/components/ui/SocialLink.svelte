<script>
  let { href, label, children } = $props();
</script>

<a {href} target="_blank" rel="noopener noreferrer" aria-label={label} class="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
  {@render children?.()}
</a>