<script>
  import Brand from "../ui/Brand.svelte";
  import SocialLink from "../ui/SocialLink.svelte";

  const year = new Date().getFullYear();
</script>

<footer class="bg-black border-t border-slate-800 py-16">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">

      <div>
        <Brand />

        <p class="mt-4 text-sm text-slate-300">
          Explore the future of development with Agentic AI.
        </p>

        <div class="mt-6 flex gap-3">
          <SocialLink href="https://www.instagram.com/holbertonfrance" label="Instagram">
            <i class="bi bi-instagram text-slate-300 text-base"></i>
          </SocialLink>
          <SocialLink href="https://www.tiktok.com/@holbertonfrance" label="TikTok">
            <i class="bi bi-tiktok text-slate-300 text-base"></i>
          </SocialLink>
          <SocialLink href="https://x.com/holbertonfra" label="X">
            <i class="bi bi-twitter-x text-slate-300 text-base"></i>
          </SocialLink>
          <SocialLink href="https://www.youtube.com/@HolbertonFrance" label="YouTube">
            <i class="bi bi-youtube text-slate-300 text-base"></i>
          </SocialLink>
        </div>
      </div>

      <div>
        <h3 class="text-slate-50 font-semibold text-sm mb-4">Navigation</h3>
        <ul class="flex flex-col gap-2">
          <li><a href="#hero-section" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">Hero section</a></li>
          <li><a href="#about-section" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">About</a></li>
          <li><a href="#features-section" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">Features</a></li>
          <li><a href="#insights-section" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">Insights</a></li>
          <li><a href="#contact-section" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">Contact</a></li>
        </ul>
      </div>

      <div>
        <h3 class="text-slate-50 font-semibold text-sm mb-4">Holberton School</h3>
        <ul class="flex flex-col gap-2">
          <li><a href="https://www.holbertonschool.fr/" target="_blank" rel="noopener noreferrer" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">About</a></li>
          <li><a href="https://www.holbertonschool.fr/methodologie" target="_blank" rel="noopener noreferrer" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">Methodology</a></li>
          <li><a href="https://www.holbertonschool.fr/a-propos" target="_blank" rel="noopener noreferrer" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">Story</a></li>
          <li><a href="https://www.holbertonschool.fr/agenda?campus=France" target="_blank" rel="noopener noreferrer" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">Agenda</a></li>
        </ul>
      </div>

      <div>
        <h3 class="text-slate-50 font-semibold text-sm mb-4">Curriculum</h3>
        <ul class="flex flex-col gap-2">
          <li><a href="https://www.holbertonschool.fr/programme/fullstack-ai-augmented-developper" target="_blank" rel="noopener noreferrer" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">Bachelor</a></li>
          <li><a href="https://www.holbertonschool.fr/programme/bachelor-ai-augmented-software-engineering" target="_blank" rel="noopener noreferrer" class="text-sm text-slate-400 hover:text-slate-50 transition-colors">Program</a></li>
        </ul>
      </div>

    </div>

    <div class="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
      <p>&copy; {year} Benjamin Bommier</p>
      <p>Built for the Holberton School Front-end Frameworks curriculum.</p>
    </div>
  </div>
</footer>