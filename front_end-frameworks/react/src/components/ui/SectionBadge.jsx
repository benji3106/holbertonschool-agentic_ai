function SectionBadge({ children }) {
  return (
    <span className="inline-block px-4 py-2 text-xs text-violet-300 rounded-full border border-violet-500/20 bg-violet-500/10">
      ✦ {children} ✦
    </span>
  );
}

export default SectionBadge;