<script setup>
import { ref, onMounted } from "vue";
import InsightCard from "../cards/InsightCard.vue";
import { getInsights } from "../../services/insightsService.js";
import SectionBadge from "../ui/SectionBadge.vue";
import SectionTitle from "../ui/SectionTitle.vue";

const insights = ref([]);
const error = ref(null);

onMounted(async () => {
  try {
    const data = await getInsights();
    insights.value = data;
  } catch (err) {
    error.value = err.message;
  }
});
</script>

<template>
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

    <p v-if="error" class="mt-6 text-center text-sm text-red-400">{{ error }}</p>

    <div class="mt-16 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
      <InsightCard
        v-for="(insight, index) in insights"
        :key="insight.title"
        :category="insight.category"
        :title="insight.title"
        :description="insight.description"
        :image="insight.image"
        :index="index"
      />
    </div>
  </section>
</template>