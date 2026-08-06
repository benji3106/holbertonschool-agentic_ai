function SocialLink({ href, label, children }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
        >
            {children}
        </a>
    );
}

export default SocialLink;