import { Bot } from "lucide-react";

function Brand({ href }) {
  const content = (
    <>
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500 shadow-lg shadow-violet-500/40">
        <Bot className="w-5 h-5 text-white" />
      </span>
      <span className="text-slate-50 font-semibold text-lg">Agentic AI</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="flex items-center gap-2">
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-2">{content}</div>;
}

export default Brand;