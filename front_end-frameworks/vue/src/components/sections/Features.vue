<script setup>
import features from "../../data/features.js";
import FeatureCard from "../cards/FeatureCard.vue";
import SectionBadge from "../ui/SectionBadge.vue";
import SectionTitle from "../ui/SectionTitle.vue";
</script>

<template>
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
      <FeatureCard
        v-for="feature in features"
        :key="feature.title"
        :icon="feature.icon"
        :title="feature.title"
        :description="feature.description"
      />
    </div>
  </section>
</template>