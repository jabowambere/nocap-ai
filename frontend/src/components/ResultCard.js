import React from 'react';
import { Check, AlertTriangle, AlertCircle } from 'lucide-react';

const ResultCard = ({ result }) => {
  const getVerdictConfig = () => {
    switch (result.verdict) {
      case 'LIKELY REAL':
        return {
          icon: Check,
          color: 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-900 dark:text-gray-200',
          badgeColor: 'bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-gray-200'
        };
      case 'LIKELY FAKE':
        return {
          icon: AlertTriangle,
          color: 'bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700',
          textColor: 'text-gray-900 dark:text-gray-200',
          badgeColor: 'bg-gray-200 dark:bg-gray-800/50 text-gray-900 dark:text-gray-200'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-gray-75 dark:bg-gray-925/30 border-gray-250 dark:border-gray-750',
          textColor: 'text-gray-900 dark:text-gray-200',
          badgeColor: 'bg-gray-150 dark:bg-gray-850/50 text-gray-900 dark:text-gray-200'
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Verdict Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] animate-in fade-in slide-in-from-left-8 delay-200">
        <div className="p-8 bg-black border-none animate-in fade-in slide-in-from-top-4 duration-500 delay-400">
          <div className="flex items-center gap-4 mb-4 animate-in fade-in slide-in-from-left-8 duration-400 delay-600">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors duration-300 hover:scale-110 hover:rotate-12">
              <Icon size={32} className="text-white animate-pulse" />
            </div>
            <div>
              <p className="text-gray-300 text-sm font-medium uppercase tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-300 delay-700">Verification Result</p>
              <p className="text-3xl font-bold text-white animate-in fade-in slide-in-from-bottom-4 duration-400 delay-800">{result.verdict}</p>
            </div>
          </div>
          <p className="text-gray-200 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-400 delay-900">{result.analysis}</p>
        </div>
      </div>

      {/* Score Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-right-8 delay-400">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 animate-in fade-in slide-in-from-top-4 duration-300 delay-1000">Credibility Score</p>
          <div className="text-6xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-1100">
            <span className={`${
              result.credibilityScore >= 70
                ? 'text-gray-700'
                : result.credibilityScore >= 50
                ? 'text-gray-600'
                : 'text-gray-500'
            } animate-pulse`}>{result.credibilityScore}</span>
            <span className="text-2xl text-slate-400">%</span>
          </div>
        </div>
        
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 delay-1200">
          <div className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-2000 ease-out rounded-full bg-black hover:bg-gray-800"
              style={{ width: `${result.credibilityScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 animate-in fade-in duration-300 delay-1400">
            <span>0% Fake</span>
            <span>50% Uncertain</span>
            <span>100% Real</span>
          </div>
        </div>
      </div>

      {/* Key Indicators */}
      {result.indicators.length > 0 && (
        <div className="animate-in fade-in slide-in-from-left-8 duration-500 delay-600">
          <p className="text-sm font-medium mb-3 animate-in fade-in slide-in-from-top-4 duration-300 delay-1500">Key Indicators Found</p>
          <div className="space-y-2">
            {result.indicators.map((indicator, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-left-4 delay-${1600 + idx * 100}`}
              >
                <span className="text-slate-400 dark:text-slate-600 flex-shrink-0 mt-0.5 animate-pulse">•</span>
                <span className="text-slate-700 dark:text-slate-300">{indicator}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {result.sources.length > 0 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 delay-800">
          <p className="text-sm font-medium mb-3 animate-in fade-in slide-in-from-top-4 duration-300 delay-1700">Source Analysis</p>
          <div className="space-y-2">
            {result.sources.map((source, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-right-4 delay-${1800 + idx * 100}`}
              >
                <span className="text-slate-400 dark:text-slate-600 flex-shrink-0 mt-0.5 animate-pulse">•</span>
                <span className="text-slate-700 dark:text-slate-300">{source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 delay-1000">
        <div className="animate-in fade-in slide-in-from-left-4 duration-300 delay-1900">
          <p className="text-xs text-slate-600 dark:text-slate-400">Content Length</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 animate-pulse">{result.contentLength} chars</p>
        </div>
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 delay-2000">
          <p className="text-xs text-slate-600 dark:text-slate-400">Analysis Date</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 animate-pulse">{new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
