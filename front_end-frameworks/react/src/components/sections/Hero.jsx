import Button from "../ui/Button";
import SectionBadge from "../ui/SectionBadge";
import SectionTitle from "../ui/SectionTitle";
import StatCard from "../cards/StatCard";

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
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center">
        <SectionBadge>The future of coding</SectionBadge>

        <div className="mt-8">
          <SectionTitle as="h1" line1="Build smarter workflows" line2="with Agentic AI" />
        </div>

        <p className="mt-8 max-w-2xl mx-auto text-sm md:text-base text-slate-300">
          Create autonomous AI agents that think, plan, and execute complex tasks. Transform your business with intelligent automation.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="#contact-section">
            Start learning with Holberton School →
          </Button>
          <Button href="#about-section" variant="secondary">
            Methodology
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;