<script setup>
import Header from "./components/layout/Header.vue";
import Hero from "./components/sections/Hero.vue";
import About from "./components/sections/About.vue";
import Features from "./components/sections/Features.vue";
import Insights from "./components/sections/Insights.vue";
import Contact from "./components/sections/Contact.vue";
import Footer from "./components/layout/Footer.vue";
</script>

<template>
  <Header />
  <main>
    <Hero />
    <About />
    <Features />
    <Insights />
    <Contact />
  </main>
  <Footer />
</template>