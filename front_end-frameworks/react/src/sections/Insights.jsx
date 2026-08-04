import InsightCard from "../components/InsightCard";
import { getInsights } from "../services/insightsService";
import { useState, useEffect } from "react";

function Insights() {
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await getInsights();
        setInsights(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchInsights();
  }, []);

  return (
    <section id="insights-section" className="py-24 bg-black">
      {/*Eyebrow*/}
      <div className="text-center max-w-6xl mx-auto px-6">
        <span className="inline-block px-4 py-2 text-xs text-violet-300 rounded-full border border-violet-500/20 bg-violet-500/10">
          ✦ Insights ✦
        </span>

        {/*Title*/}
        <h2 className="mt-8 text-4xl md:text-5xl font-black tracking-tight leading-none text-slate-50">
          Explore Agentic AI
          <br />
          <span className="text-violet-300">Through real-world scenes</span>
        </h2>
      </div>

      {/*Error message*/}
      {error && (
        <p className="mt-6 text-center text-sm text-red-400">
          {error}
        </p>
      )}

      {/*Insights grid*/}
      <div className="mt-16 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {insights.map((insight, index) => (
          <InsightCard
            key={insight.title}
            category={insight.category}
            title={insight.title}
            description={insight.description}
            image={insight.image}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

export default Insights;