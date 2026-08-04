import { ArrowRight } from "lucide-react";

function Hero() {
  const stats = [
    { value: "10K+", label: "Active agents" },
    { value: "99.9%", label: "Uptime" },
    { value: "50M+", label: "Tasks automated" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <section
      id="hero-section"
      className="relative pt-36 pb-24 overflow-hidden bg-slate-950"
    >
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <span className="inline-block px-4 py-2 text-xs text-violet-300 rounded-full border border-violet-500/20 bg-violet-500/10">
          ✦ The future of coding ✦
        </span>

        {/* Main title */}
        <h1 className="mt-8 text-5xl md:text-7xl font-black tracking-tight leading-none text-slate-50">
          Build smarter workflows
          <br />
          <span className="text-violet-300">with Agentic AI</span>
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-2xl mx-auto text-sm md:text-base text-slate-300">
          Create autonomous AI agents that think, plan, and execute complex
          tasks. Transform your business with intelligent automation.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact-section"
            className="flex items-center gap-2 px-4 py-2 font-semibold rounded-md bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/40 text-slate-50 transition-colors"
          >
            Start learning with Holberton School
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#about-section"
            className="px-4 py-2 font-semibold rounded-md border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-50 transition-colors"
          >
            Methodology
          </a>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/40"
            >
              <p className="text-3xl font-black text-violet-300">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;