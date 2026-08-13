<script>
  import steps from "../../data/steps.js";
  import SectionBadge from "../ui/SectionBadge.svelte";
  import SectionTitle from "../ui/SectionTitle.svelte";
</script>

<section id="about-section" class="py-24 bg-black">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center">
      <SectionBadge>What is Agentic AI?</SectionBadge>

      <div class="mt-8">
        <SectionTitle
          line1="AI that does more than answer"
          line2="It acts with purpose"
        />
      </div>

      <p class="mt-8 max-w-2xl mx-auto text-sm md:text-base text-slate-300">
        Agentic AI refers to artificial intelligence systems designed to
        pursue goals, make decisions, use tools, and adapt their actions
        across multiple steps. Instead of only responding to a single
        prompt, an AI agent can break down a task, plan a strategy,
        execute actions, evaluate results, and continue until the
        objective is reached.
      </p>
    </div>

    <div class="mt-12 grid md:grid-cols-2 gap-8 items-start">
      <div class="p-6 rounded-xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/40">
        <h3 class="text-slate-50 font-semibold text-lg">
          Traditional AI
        </h3>
        <p class="mt-2 text-sm text-slate-500">
          Responds to direct instructions, generates content, answers
          questions, or analyzes information within a limited
          interaction.
        </p>

        <hr class="my-6 border-slate-800" />

        <h3 class="text-violet-300 font-semibold text-lg">
          Agentic AI
        </h3>
        <p class="mt-2 text-sm text-slate-500">
          Understands a goal, chooses actions, uses external tools,
          follows a plan, and adjusts its behavior based on feedback.
        </p>
      </div>

      <div class="relative">
        {#each steps as step, index (step.number)}
          <div class="relative flex gap-4 pb-10">
            {#if index !== steps.length - 1}
              <span class="absolute left-4 top-8 w-px h-full bg-violet-500/40"></span>
            {/if}

            <span class="relative z-10 flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-violet-500 text-slate-50 text-sm font-bold shadow-lg shadow-violet-500/40">
              {step.number}
            </span>

            <div>
              <h4 class="text-slate-50 font-semibold">
                {step.title}
              </h4>
              <p class="mt-1 text-sm text-slate-300">
                {step.description}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>