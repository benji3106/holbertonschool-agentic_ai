<script>
  import { BrainCircuit } from "@lucide/svelte";

  let { href = null } = $props();
</script>

{#if href}
  <a {href} class="flex items-center gap-2">
    <span class="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500 shadow-lg shadow-violet-500/40">
      <BrainCircuit class="w-5 h-5 text-white" />
    </span>
    <span class="text-slate-50 font-semibold text-lg">Agentic AI</span>
  </a>
{:else}
  <div class="flex items-center gap-2">
    <span class="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500 shadow-lg shadow-violet-500/40">
      <BrainCircuit class="w-5 h-5 text-white" />
    </span>
    <span class="text-slate-50 font-semibold text-lg">Agentic AI</span>
  </div>
{/if}