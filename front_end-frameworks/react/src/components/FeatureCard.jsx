function FeatureCard({ icon: Icon, title, description }) {
    return(
        <article className="p-8 rounded-3xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/40">
            <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-500 shadow-lg shadow-violet-500/40 mb-4">
                <Icon className="w-6 h-6 text-white" />
            </span>
            <h3 className="text-slate-50 font-semibold text-lg">{title}</h3>
            <p className="mt-2 text-sm md:text-base text-slate-300">{description}</p>
        </article>
    );
}

export default FeatureCard;