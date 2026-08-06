import { Bot } from "lucide-react";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-slate-800 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Colonne 1 : marque */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500 shadow-lg shadow-violet-500/40">
                <Bot className="w-5 h-5 text-white" />
              </span>
              <span className="text-slate-50 font-semibold text-lg">Agentic AI</span>
            </div>

            <p className="mt-4 text-sm text-slate-300">
              Explore the future of development with Agentic AI.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/holbertonfrance"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                <i className="bi bi-instagram text-slate-300 text-base"></i>
              </a>
              <a
                href="https://www.tiktok.com/@holbertonfrance"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                <i className="bi bi-tiktok text-slate-300 text-base"></i>
              </a>
              <a
                href="https://x.com/holbertonfra"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                <i className="bi bi-twitter-x text-slate-300 text-base"></i>
              </a>
              <a
                href="https://www.youtube.com/@HolbertonFrance"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                <i className="bi bi-youtube text-slate-300 text-base"></i>
              </a>
            </div>
          </div>

          {/* Colonne 2 : Navigation */}
          <div>
            <h3 className="text-slate-50 font-semibold text-sm mb-4">Navigation</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="#hero-section" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  Hero section
                </a>
              </li>
              <li>
                <a href="#about-section" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#features-section" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#insights-section" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  Insights
                </a>
              </li>
              <li>
                <a href="#contact-section" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Holberton School */}
          <div>
            <h3 className="text-slate-50 font-semibold text-sm mb-4">Holberton School</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="https://www.holbertonschool.fr/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="https://www.holbertonschool.fr/methodologie" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  Methodology
                </a>
              </li>
              <li>
                <a href="https://www.holbertonschool.fr/a-propos" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  Story
                </a>
              </li>
              <li>
                <a href="https://www.holbertonschool.fr/agenda?campus=France" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  Agenda
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Curriculum */}
          <div>
            <h3 className="text-slate-50 font-semibold text-sm mb-4">Curriculum</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="https://www.holbertonschool.fr/programme/fullstack-ai-augmented-developper" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  Bachelor
                </a>
              </li>
              <li>
                <a href="https://www.holbertonschool.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                  Program
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
          <p>&copy; {year} Benjamin Bommier</p>
          <p>Built for the Holberton School Front-end Frameworks curriculum.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;