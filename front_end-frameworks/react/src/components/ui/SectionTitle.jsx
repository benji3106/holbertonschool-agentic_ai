function SectionTitle({ as = "h2", line1, line2 }) {
  const Tag = as;

  const sizeClasses =
    as === "h1"
      ? "text-5xl md:text-7xl"
      : "text-4xl md:text-5xl";

  return (
    <Tag className={`${sizeClasses} font-black tracking-tight leading-none text-slate-50`}>
      {line1}
      <br />
      <span className="text-violet-300">{line2}</span>
    </Tag>
  );
}

export default SectionTitle;