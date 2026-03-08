import React from 'react';
import { Shield, Zap, Search, CheckCircle2 } from 'lucide-react';

const items = [
  {
    icon: Zap,
    title: 'Instant analysis',
    description: 'Paste a claim or article and get a credibility signal in seconds.',
  },
  {
    icon: Search,
    title: 'Source-aware checks',
    description: 'Add a link and compare against trusted reporting patterns.',
  },
  {
    icon: Shield,
    title: 'Bias & misinformation',
    description: 'Flag common manipulation tactics and suspicious language.',
  },
  {
    icon: CheckCircle2,
    title: 'Clear next steps',
    description: 'Get suggestions for what to verify and where to look next.',
  },
];

const LandingSections = () => {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <section id="features" className="py-16 scroll-mt-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Features</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-50">
              Built for fast, confident decisions
            </h2>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-neutral-950/40 backdrop-blur-sm p-5 shadow-[0_10px_40px_rgba(15,23,42,0.10)]"
              >
                <div className="w-11 h-11 rounded-2xl bg-slate-900/5 dark:bg-white/10 flex items-center justify-center">
                  <Icon size={20} className="text-slate-700 dark:text-slate-200" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-16 border-t border-slate-200/70 dark:border-slate-800 scroll-mt-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div id="solutions">
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Solutions</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50">
              For teams and individuals
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              Use Nocap AI for newsroom workflows, classrooms, community moderation, or personal fact checking.
            </p>
          </div>

          <div id="pricing">
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Pricing</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50">
              Start free, scale later
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              Replace this placeholder with your real pricing cards when you're ready.
            </p>
          </div>

          <div id="resources">
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Resources</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50">
              Learn how to verify better
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              Add your own guides, blog posts, or docs here and link to them from the top navigation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingSections;
