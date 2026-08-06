import features from "../../data/features";
import FeatureCard from "../cards/FeatureCard";
import SectionBadge from "../ui/SectionBadge";
import SectionTitle from "../ui/SectionTitle";

function Features() {
  return (
    <section id="features-section" className="py-24 bg-black">
      <div className="text-center max-w-6xl mx-auto px-6">
        <SectionBadge>Features</SectionBadge>

        <div className="mt-8">
          <SectionTitle
            line1="Everything You Need to Build"
            line2="With powerful AI agents"
          />
        </div>
      </div>

      <div className="mt-16 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}

export default Features;