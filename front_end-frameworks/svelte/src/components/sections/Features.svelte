<script>
  import features from "../../data/features.js";
  import FeatureCard from "../cards/FeatureCard.svelte";
  import SectionBadge from "../ui/SectionBadge.svelte";
  import SectionTitle from "../ui/SectionTitle.svelte";
</script>

<section id="features-section" class="py-24 bg-black">
  <div class="text-center max-w-6xl mx-auto px-6">
    <SectionBadge>Features</SectionBadge>

    <div class="mt-8">
      <SectionTitle
        line1="Everything You Need to Build"
        line2="With powerful AI agents"
      />
    </div>
  </div>

  <div class="mt-16 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
    {#each features as feature (feature.title)}
      <FeatureCard
        icon={feature.icon}
        title={feature.title}
        description={feature.description}
      />
    {/each}
  </div>
</section>