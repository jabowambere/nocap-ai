import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { FileText, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle, Search, Filter, Zap, Link, ExternalLink, Loader2, X } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const recommendedSources = [
    { name: 'Reuters', url: 'https://reuters.com', category: 'News Agency' },
    { name: 'AP News', url: 'https://apnews.com', category: 'News Agency' },
    { name: 'BBC News', url: 'https://bbc.com/news', category: 'International' },
    { name: 'NPR', url: 'https://npr.org', category: 'Public Radio' },
    { name: 'Snopes', url: 'https://snopes.com', category: 'Fact Check' },
    { name: 'FactCheck.org', url: 'https://factcheck.org', category: 'Fact Check' }
  ];
  
  const userAnalyses = [
    { id: 1, title: 'Climate Change Report 2024', verdict: 'LIKELY REAL', score: 87, date: '2024-01-20', content: 'Scientists confirm rising global temperatures...' },
    { id: 2, title: 'Miracle Weight Loss Pill', verdict: 'LIKELY FAKE', score: 18, date: '2024-01-19', content: 'Lose 50 pounds in one week...' },
    { id: 3, title: 'Tech Company Earnings', verdict: 'LIKELY REAL', score: 82, date: '2024-01-18', content: 'Q4 earnings exceed expectations...' },
    { id: 4, title: 'Celebrity Scandal Exposed', verdict: 'UNCERTAIN', score: 54, date: '2024-01-17', content: 'Anonymous sources claim...' },
    { id: 5, title: 'New Medical Breakthrough', verdict: 'LIKELY REAL', score: 76, date: '2024-01-16', content: 'Peer-reviewed study shows...' },
  ];

  const stats = {
    totalAnalyses: userAnalyses.length,
    avgScore: Math.round(userAnalyses.reduce((acc, a) => acc + a.score, 0) / userAnalyses.length),
    realCount: userAnalyses.filter(a => a.verdict === 'LIKELY REAL').length,
    fakeCount: userAnalyses.filter(a => a.verdict === 'LIKELY FAKE').length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please enter news content to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/detection/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: content.trim(),
          sourceUrl: sourceUrl.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Error analyzing content. Make sure backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'LIKELY REAL':
        return <CheckCircle className="text-emerald-500" size={20} />;
      case 'LIKELY FAKE':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <AlertCircle className="text-yellow-500" size={20} />;
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'LIKELY REAL':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'LIKELY FAKE':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredAnalyses = userAnalyses.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            My Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back, {user?.firstName || user?.username || 'User'}
          </p>
        </div>

        {/* Analysis Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Analysis Form */}
          <div className="lg:col-span-2 animate-in fade-in slide-in-from-left-8 duration-500 delay-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-3xl transition-all duration-300">
              <div className="bg-gradient-to-r from-slate-700 to-black p-6">
                <h2 className="text-2xl font-bold text-white mb-2">Analyze News Content</h2>
                <p className="text-slate-200">Paste any news article or claim to verify its credibility</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-black">
                <div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste news article, headline, or any content you want to verify..."
                    rows={8}
                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 resize-none text-sm leading-relaxed hover:border-gray-400 dark:hover:border-gray-500"
                  />
                </div>

                <div>
                  <div className="relative">
                    <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="Source URL (optional)"
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200">
                    <X size={20} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-slate-700 to-black hover:from-slate-800 hover:to-gray-900 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={24} />
                      <span>Verify Content</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Trusted Sources Sidebar */}
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-right-8 duration-500 delay-400">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-slate-700 to-black p-6">
                <h3 className="text-xl font-bold text-white mb-2">Trusted Sources</h3>
                <p className="text-slate-200 text-sm">Verify with reliable news outlets</p>
              </div>
              
              <div className="p-6 space-y-4 bg-white dark:bg-black">
                {recommendedSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20 transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-200">{source.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{source.category}</p>
                    </div>
                    <ExternalLink size={16} className="text-slate-400 group-hover:text-gray-500 transition-all duration-200 group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mt-12">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText className="text-slate-600 dark:text-slate-400" size={20} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Checks</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalAnalyses}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 delay-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Verified Real</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.realCount}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 delay-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Flagged Fake</span>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.fakeCount}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 delay-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Avg Score</span>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.avgScore}%</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 mb-6 animate-in fade-in slide-in-from-left-8 delay-400">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search your analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
              />
            </div>
            <button className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
              <Filter size={20} />
              <span className="hidden md:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* Analysis History */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-8 delay-500">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Analysis History</h2>
          </div>
          
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredAnalyses.map((analysis, idx) => (
              <div 
                key={analysis.id}
                className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer animate-in fade-in slide-in-from-left-4 delay-${600 + idx * 50}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {getVerdictIcon(analysis.verdict)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {analysis.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
                        {analysis.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(analysis.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                        {analysis.score}%
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">confidence</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getVerdictColor(analysis.verdict)}`}>
                      {analysis.verdict}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredAnalyses.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto text-slate-400 mb-4" size={48} />
            <p className="text-slate-600 dark:text-slate-400">No analyses found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;