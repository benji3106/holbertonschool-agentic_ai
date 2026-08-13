<script>
  let { as = "h2", line1, line2 } = $props();

  let sizeClasses = $derived(as === "h1" ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl");
</script>

<svelte:element this={as} class="{sizeClasses} font-black tracking-tight leading-none text-slate-50">
  {line1}
  <br />
  <span class="text-violet-300">{line2}</span>
</svelte:element>