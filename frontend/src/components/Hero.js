import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const DotLogo = () => (
    <div className="mx-auto mb-8 w-14 h-14 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-neutral-950/60 backdrop-blur-sm shadow-[0_16px_50px_rgba(15,23,42,0.12)] flex items-center justify-center">
      <div className="grid grid-cols-2 gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-slate-50" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-slate-50" />
      </div>
    </div>
  );

  const FloatingPoster = ({ className, src, alt, caption, tone = 'light' }) => (
    <div
      className={[
        'pointer-events-none select-none absolute hidden md:block',
        'rounded-3xl border shadow-[0_30px_90px_rgba(15,23,42,0.18)]',
        tone === 'light'
          ? 'border-slate-200/80 bg-white/90'
          : 'border-slate-800/70 bg-neutral-950/60',
        'backdrop-blur-sm overflow-hidden',
        className,
      ].join(' ')}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" draggable="false" />
      {caption ? (
        <div className="absolute bottom-0 inset-x-0 px-4 py-3 bg-gradient-to-t from-white/95 via-white/60 to-transparent dark:from-neutral-950/90 dark:via-neutral-950/40">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{caption}</p>
        </div>
      ) : null}
    </div>
  );

  return (
    <section className="bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-50 relative overflow-hidden">
      <div className="relative pb-8 sm:pb-10">
        <div className="relative border-y border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-neutral-950/50 backdrop-blur-sm shadow-[0_30px_120px_rgba(15,23,42,0.14)] overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.55] dark:opacity-[0.25]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230F172A' fill-opacity='0.06'%3E%3Ccircle cx='32' cy='32' r='1.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_20%,rgba(59,130,246,0.10),transparent_55%)]" />

          <FloatingPoster
            src="/landing/poster-1.svg"
            alt="Poster 1"
            caption="Check the truth behind the news"
            className="left-[5%] lg:left-[10%] top-10 w-56 h-40 rotate-[-10deg] float-slow"
          />
          <FloatingPoster
            src="/landing/poster-4.png"
            alt="Poster 2"
            caption="Product highlight card"
            className="right-[5%] lg:right-[10%] top-8 w-64 h-48 rotate-[10deg] float-medium"
          />
          <FloatingPoster
            src="/landing/poster-2.png"
            alt="Poster 3"
            caption="Dashboard preview"
            className="left-[5%] lg:left-[10%] bottom-10 w-50 h-48 rotate-[6deg] float-fast"
          />
          <FloatingPoster
            src="/landing/poster-3.svg"
            alt="Poster 4"
            caption="Don't guess, Verify."
            className="right-[5%] lg:right-[10%] bottom-10 w-60 h-44 rotate-[-6deg] float-slow"
          />

          <div className="relative px-6 py-16 sm:px-12 sm:py-20 text-center">
            <DotLogo />

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.06]">
              Think, verify, and trust
              <br />
              <span className="text-slate-400 dark:text-slate-400 font-medium">all in one place</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Nocap AI helps you check credibility, spot bias, and reduce misinformation—fast.
            </p>

            <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => scrollToId('demo')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 hover:bg-black-700 text-white font-semibold shadow-[0_16px_50px_rgba(37,99,235,0.28)] transition-colors"
              >
                Get free demo <ArrowRight size={18} />
              </button>
              <button
                onClick={() => scrollToId('features')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-neutral-950/40 backdrop-blur-sm text-slate-800 dark:text-slate-100 font-semibold hover:bg-white/80 dark:hover:bg-neutral-950/55 transition-colors"
              >
                View features
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
