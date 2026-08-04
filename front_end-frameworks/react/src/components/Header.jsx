import { Bot } from "lucide-react";

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between py-4">
        {/* Logo / Brand */}
        <a href="#top" className="flex items-center gap-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500 shadow-lg shadow-violet-500/40">
            <Bot className="w-5 h-5 text-white" />
          </span>
          <span className="text-slate-50 font-semibold text-lg">Agentic AI</span>
        </a>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#about-section"
            className="text-slate-300 hover:text-slate-50 transition-colors text-sm"
          >
            About
          </a>
          <a
            href="#features-section"
            className="text-slate-300 hover:text-slate-50 transition-colors text-sm"
          >
            Features
          </a>
          <a
            href="#insights-section"
            className="text-slate-300 hover:text-slate-50 transition-colors text-sm"
          >
            Insights
          </a>
          <a
            href="#contact-section"
            className="text-slate-300 hover:text-slate-50 transition-colors text-sm"
          >
            Contact
          </a>
        </nav>

        {/* Call to action */}
        <a
          href="#contact-section"
          className="px-4 py-2 font-semibold rounded-md bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/40 text-slate-50 text-sm transition-colors"
        >
          Enroll now
        </a>
      </div>
    </header>
  );
}

export default Header;