import InsightCard from "../cards/InsightCard";
import { getInsights } from "../../services/insightsService";
import { useState, useEffect } from "react";
import SectionBadge from "../ui/SectionBadge";
import SectionTitle from "../ui/SectionTitle";

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
      <div className="text-center max-w-6xl mx-auto px-6">
        <SectionBadge>Insights</SectionBadge>

        <div className="mt-8">
          <SectionTitle
            line1="Explore Agentic AI"
            line2="Through real-world scenes"
          />
        </div>
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-red-400">{error}</p>
      )}

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