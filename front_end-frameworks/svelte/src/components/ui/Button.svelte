<script>
  let { href, variant = "primary", target = null, rel = null, children } = $props();

  const baseClasses = "px-4 py-2 font-semibold rounded-md transition-colors";
</script>

<a {href} {target} {rel} class="{baseClasses} {variant === 'primary' ? 'bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/40 text-slate-50' : 'border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-50'}">
  {@render children?.()}
</a>