import React from 'react';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, FileText, Link as LinkIcon, Calendar } from 'lucide-react';

const ResultCard = ({ result }) => {
  const getVerdictConfig = () => {
    switch (result.verdict) {
      case 'LIKELY REAL':
        return {
          icon: CheckCircle,
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
          borderColor: 'border-emerald-200 dark:border-emerald-800',
          textColor: 'text-emerald-900 dark:text-emerald-100',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          badgeColor: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
        };
      case 'LIKELY FAKE':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-900 dark:text-red-100',
          iconColor: 'text-red-600 dark:text-red-400',
          badgeColor: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
        };
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-900 dark:text-yellow-100',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          badgeColor: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Verdict */}
        <div className={`${config.bgColor} ${config.borderColor} border-b p-4 sm:p-8`}>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${config.iconColor} bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg flex-shrink-0`}>
                <Icon size={24} className="sm:hidden" />
                <Icon size={32} className="hidden sm:block" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold ${config.badgeColor} mb-2 sm:mb-3`}>
                  {result.verdict}
                </span>
                <h3 className={`text-xl sm:text-2xl font-bold ${config.textColor} mb-1 sm:mb-2`}>Analysis Complete</h3>
                <p className={`${config.textColor} opacity-90 leading-relaxed text-sm sm:text-base`}>{result.analysis}</p>
              </div>
            </div>
            
            {/* Score Badge */}
            <div className="w-full sm:w-auto text-center bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg sm:min-w-[140px]">
              <div className="text-4xl sm:text-5xl font-bold mb-1">
                <span className={config.iconColor}>{result.credibilityScore}</span>
                <span className="text-xl sm:text-2xl text-slate-400">%</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Credibility</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          {/* Score Visualization */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <TrendingUp size={14} className="sm:hidden" />
                <TrendingUp size={16} className="hidden sm:block" />
                Credibility Meter
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {result.credibilityScore < 50 ? 'Low' : result.credibilityScore < 70 ? 'Medium' : 'High'} Confidence
              </span>
            </div>
            <div className="relative">
              {/* Background bar */}
              <div className="h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-emerald-200 dark:from-red-900/30 dark:via-yellow-900/30 dark:to-emerald-900/30 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${config.iconColor.replace('text-', 'bg-')} opacity-40`}
                  style={{ width: `${result.credibilityScore}%` }}
                />
              </div>
              {/* Score indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
                style={{ left: `${result.credibilityScore}%` }}
              >
                <div className="relative -translate-x-1/2">
                  <div className={`w-6 h-6 rounded-full ${config.iconColor.replace('text-', 'bg-')} border-4 border-white dark:border-slate-900 shadow-lg`} />
                  <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md ${config.badgeColor} text-xs font-bold whitespace-nowrap shadow-md`}>
                    {result.credibilityScore}%
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-3">
              <span>0% Fake</span>
              <span>50%</span>
              <span>100% Real</span>
            </div>
          </div>

          {/* Key Indicators */}
          {result.indicators && result.indicators.length > 0 && (
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <FileText size={14} className="sm:hidden" />
                <FileText size={16} className="hidden sm:block" />
                Analysis Based On ({result.indicators.length} factors)
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {result.indicators.map((indicator, idx) => {
                  const isPositive = indicator.toLowerCase().includes('credible') || 
                                   indicator.toLowerCase().includes('neutral') || 
                                   indicator.toLowerCase().includes('trusted') ||
                                   indicator.toLowerCase().includes('citations') ||
                                   indicator.toLowerCase().includes('research');
                  const isNegative = indicator.toLowerCase().includes('excessive') || 
                                   indicator.toLowerCase().includes('sensational') ||
                                   indicator.toLowerCase().includes('emotional') ||
                                   indicator.toLowerCase().includes('many');
                  
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                        isPositive 
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                          : isNegative
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className={`mt-0.5 ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' :
                        isNegative ? 'text-red-600 dark:text-red-400' :
                        'text-slate-600 dark:text-slate-400'
                      }`}>
                        {isPositive ? '✓' : isNegative ? '✗' : '•'}
                      </span>
                      <span className={`text-sm flex-1 ${
                        isPositive ? 'text-emerald-900 dark:text-emerald-100' :
                        isNegative ? 'text-red-900 dark:text-red-100' :
                        'text-slate-700 dark:text-slate-300'
                      }`}>{indicator}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Source Analysis */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <LinkIcon size={14} className="sm:hidden" />
                <LinkIcon size={16} className="hidden sm:block" />
                Source Analysis
              </h4>
              <div className="space-y-2">
                {result.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                  >
                    <span className={`${config.iconColor} mt-0.5`}>•</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{source}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <FileText size={14} className="sm:hidden" />
                <FileText size={16} className="hidden sm:block" />
                <span>{result.contentLength} characters</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="sm:hidden" />
                <Calendar size={16} className="hidden sm:block" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            {result.sourceUrl && (
              <a
                href={result.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View Source
                <LinkIcon size={12} className="sm:hidden" />
                <LinkIcon size={14} className="hidden sm:block" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
