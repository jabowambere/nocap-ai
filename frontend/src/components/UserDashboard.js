import React, { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { FileText, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle, Search, Filter, Zap, Link, ExternalLink, Loader2, X, ArrowUpDown } from 'lucide-react';

const UserDashboard = () => {
  // normalize backend URL and remove trailing slashes
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
  const { user } = useUser();
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userAnalyses, setUserAnalyses] = useState([]);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    avgScore: 0,
    realCount: 0,
    fakeCount: 0
  });
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterVerdict, setFilterVerdict] = useState('all');
  
  const fetchHistory = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/detection/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      setUserAnalyses(data);
      
      const realCount = data.filter(a => a.verdict === 'LIKELY REAL').length;
      const fakeCount = data.filter(a => a.verdict === 'LIKELY FAKE').length;
      const avgScore = data.length > 0
        ? Math.round(data.reduce((sum, a) => sum + a.credibility_score, 0) / data.length)
        : 0;
      
      setStats({
        totalAnalyses: data.length,
        avgScore,
        realCount,
        fakeCount
      });
      
      setFetchingHistory(false);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setFetchingHistory(false);
    }
  }, [API_URL, getToken]);
  
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  
  const recommendedSources = [
    { name: 'Reuters', url: 'https://reuters.com', category: 'News Agency' },
    { name: 'AP News', url: 'https://apnews.com', category: 'News Agency' },
    { name: 'BBC News', url: 'https://bbc.com/news', category: 'International' },
    { name: 'NPR', url: 'https://npr.org', category: 'Public Radio' },
    { name: 'Snopes', url: 'https://snopes.com', category: 'Fact Check' },
    { name: 'FactCheck.org', url: 'https://factcheck.org', category: 'Fact Check' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please enter news content to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/detection/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: content.trim(),
          sourceUrl: sourceUrl.trim(),
          userId: user?.id || 'anonymous'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      await response.json();
      setContent('');
      setSourceUrl('');
      fetchHistory();
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
    a.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModalFilteredAnalyses = () => {
    let filtered = userAnalyses;
    
    if (filterVerdict !== 'all') {
      filtered = filtered.filter(a => a.verdict === filterVerdict);
    }
    
    if (modalSearchTerm) {
      filtered = filtered.filter(a => 
        a.text?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
        a.source_url?.toLowerCase().includes(modalSearchTerm.toLowerCase())
      );
    }
    
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'score') return b.credibility_score - a.credibility_score;
      return 0;
    });
    
    return sorted;
  };

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
          <div onClick={() => { setShowModal(true); setFilterVerdict('all'); setModalSearchTerm(''); }} className="cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText className="text-slate-600 dark:text-slate-400" size={20} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Checks</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalAnalyses}</p>
          </div>

          <div onClick={() => { setShowModal(true); setFilterVerdict('LIKELY REAL'); setModalSearchTerm(''); }} className="cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 delay-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Verified Real</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.realCount}</p>
          </div>

          <div onClick={() => { setShowModal(true); setFilterVerdict('LIKELY FAKE'); setModalSearchTerm(''); }} className="cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 delay-200">
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
          
          {fetchingHistory ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600 dark:text-slate-400">No analyses found</p>
            </div>
          ) : (
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
                        {analysis.text.substring(0, 60)}...
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
                        {analysis.source_url || 'No source URL'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(analysis.credibility_score)}`}>
                        {analysis.credibility_score}%
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
          )}
        </div>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {filterVerdict === 'all' ? 'All My Analyses' : `${filterVerdict} News`}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Search and Sort */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search analyses..."
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>
                <button
                  onClick={() => setSortBy(sortBy === 'date' ? 'score' : 'date')}
                  className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <ArrowUpDown size={20} />
                  <span>Sort by {sortBy === 'date' ? 'Score' : 'Date'}</span>
                </button>
              </div>
              
              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto space-y-3">
                {getModalFilteredAnalyses().length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No analyses found</p>
                ) : (
                  getModalFilteredAnalyses().map(analysis => (
                    <div key={analysis.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {getVerdictIcon(analysis.verdict)}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                              {analysis.text.substring(0, 100)}...
                            </p>
                            {analysis.source_url && (
                              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{analysis.source_url}</p>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(analysis.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold ${getScoreColor(analysis.credibility_score)}`}>
                            {analysis.credibility_score}%
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getVerdictColor(analysis.verdict)}`}>
                            {analysis.verdict}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;