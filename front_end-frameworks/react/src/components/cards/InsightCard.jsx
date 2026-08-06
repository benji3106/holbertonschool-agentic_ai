function InsightCard({ category, title, description, image, index }) {
  return (
    <article
      className={`relative overflow-hidden rounded-3xl border border-slate-800 shadow-xl shadow-slate-950/40 h-80 ${
        index === 0 ? "md:col-span-2" : ""
      }`}
    >
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src={image}
        alt={title}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
      <div className="relative h-full flex flex-col justify-end items-start p-6">
        <span className="inline-block px-4 py-2 text-xs text-violet-300 rounded-full border border-violet-500/20 bg-violet-500/10 mb-4">
          {category}
        </span>
        <h3 className="text-slate-50 font-semibold text-lg">{title}</h3>
        <p className="mt-2 text-sm md:text-base text-slate-300">
          {description}
        </p>
      </div>
    </article>
  );
}

export default InsightCard;
