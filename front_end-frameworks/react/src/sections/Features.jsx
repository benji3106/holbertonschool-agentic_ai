import features from "../data/features";
import FeatureCard from "../components/FeatureCard";

function Features() {
    return (
        <section id="features-section" className="py-24 bg-black">
            {/*Eyebrow*/}
            <div className="text-center max-w-6xl mx-auto px-6">
                <span className="inline-block px-4 py-2 text-xs text-violet-300 rounded-full border border-violet-500/20 bg-violet-500/10">
                    ✦ Features ✦
                </span>

                {/*Title*/}
                <h2 className="mt-8 text-4xl md:text-5xl font-black tracking-tight leading-none text-slate-50">
                    Everything You Need to Build
                    <br />
                    <span className="text-violet-300">With powerful AI agents</span>
                </h2>
            </div>

            {/*Features grid*/}
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