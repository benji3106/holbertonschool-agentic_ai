// src/components/cards/StatCard.jsx
function StatCard({ value, label }) {
  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/40">
      <p className="text-3xl font-black text-violet-300">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default StatCard;