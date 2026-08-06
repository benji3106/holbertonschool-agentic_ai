import Brand from "../ui/Brand";
import Button from "../ui/Button";

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between py-4">
        <Brand href="#top" />

        <nav className="hidden md:flex items-center gap-8">
          <a href="#about-section" className="text-slate-300 hover:text-slate-50 transition-colors text-sm">
            About
          </a>
          <a href="#features-section" className="text-slate-300 hover:text-slate-50 transition-colors text-sm">
            Features
          </a>
          <a href="#insights-section" className="text-slate-300 hover:text-slate-50 transition-colors text-sm">
            Insights
          </a>
          <a href="#contact-section" className="text-slate-300 hover:text-slate-50 transition-colors text-sm">
            Contact
          </a>
        </nav>

        <Button href="#contact-section">Enroll now</Button>
      </div>
    </header>
  );
}

export default Header;
