function Button({ href, children, variant = "primary", target, rel }) {
  const baseClasses = "px-4 py-2 font-semibold rounded-md transition-colors";

  const variantClasses =
    variant === "primary"
      ? "bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/40 text-slate-50"
      : "border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-50";

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </a>
  );
}

export default Button;