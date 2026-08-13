<script>
  import InsightCard from "../cards/InsightCard.svelte";
  import { getInsights } from "../../services/insightsService.js";
  import SectionBadge from "../ui/SectionBadge.svelte";
  import SectionTitle from "../ui/SectionTitle.svelte";

  let insights = $state([]);
  let error = $state(null);

  $effect(() => {
    getInsights()
      .then((data) => {
        insights = data;
      })
      .catch((err) => {
        error = err.message;
      });
  });
</script>

<section id="insights-section" class="py-24 bg-black">
  <div class="text-center max-w-6xl mx-auto px-6">
    <SectionBadge>Insights</SectionBadge>

    <div class="mt-8">
      <SectionTitle
        line1="Explore Agentic AI"
        line2="Through real-world scenes"
      />
    </div>
  </div>

  {#if error}
    <p class="mt-6 text-center text-sm text-red-400">{error}</p>
  {/if}

  <div class="mt-16 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
    {#each insights as insight, index (insight.title)}
      <InsightCard
        category={insight.category}
        title={insight.title}
        description={insight.description}
        image={insight.image}
        {index}
      />
    {/each}
  </div>
</section>