import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { BarChart3, Users, FileText, TrendingUp, Activity, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Search, ArrowUpDown, X, Trash2, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  // normalize backend URL and remove trailing slashes
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const joinUrl = (base, path) => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    realNews: 0,
    fakeNews: 0,
    uncertain: 0,
    totalUsers: 0,
    avgScore: 0
  });
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterVerdict, setFilterVerdict] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAnalyses, setUserAnalyses] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [deleteFeedbackConfirm, setDeleteFeedbackConfirm] = useState(null);

  useEffect(() => {
    if (getToken) {
      fetchAdminData();
      fetchFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = await getToken();
      
      console.log('🔍 Fetching admin data from:', API_URL);
      console.log('🔑 Token available:', !!token);
      
      // Fetch all analyses
      const analysesUrl = joinUrl(API_URL, '/api/detection/all-analyses');
      console.log('📊 Fetching analyses from:', analysesUrl);
      
      const analysesRes = await fetch(analysesUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Analyses response status:', analysesRes.status);
      
      if (!analysesRes.ok) {
        const errorText = await analysesRes.text();
        console.error('❌ Analyses fetch failed:', analysesRes.status, errorText);
        setLoading(false);
        return;
      }
      
      const analyses = await analysesRes.json();
      console.log('✅ Analyses fetched:', analyses.length, 'items');
      console.log('📋 Sample analysis:', analyses[0]);
      
      setAllAnalyses(analyses);

      // Fetch users count
      const usersRes = await fetch(joinUrl(API_URL, '/api/users'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!usersRes.ok) {
        console.error('Users fetch failed:', usersRes.status);
        setLoading(false);
        return;
      }
      
      const users = await usersRes.json();
      console.log('Users:', users);
      
      setAllUsers(users);

      // Calculate stats
      const realCount = analyses.filter(a => a.verdict === 'LIKELY REAL').length;
      const fakeCount = analyses.filter(a => a.verdict === 'LIKELY FAKE').length;
      const uncertainCount = analyses.filter(a => a.verdict === 'UNCERTAIN').length;
      const avgScore = analyses.length > 0
        ? Math.round(analyses.reduce((sum, a) => sum + a.credibility_score, 0) / analyses.length)
        : 0;

      setStats({
        totalAnalyses: analyses.length,
        realNews: realCount,
        fakeNews: fakeCount,
        uncertain: uncertainCount,
        totalUsers: users.length,
        avgScore
      });

      // Format recent analyses
      setRecentAnalyses(analyses.slice(0, 5).map(a => ({
        id: a.id,
        title: a.text.substring(0, 50) + '...',
        verdict: a.verdict,
        score: a.credibility_score,
        date: new Date(a.created_at).toLocaleString(),
        username: a.username || 'Anonymous'
      })));

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="text-white" size={20} />
        </div>
        {trend && (
          <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
            +{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</p>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{label}</p>
    </div>
  );

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

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getFilteredAnalyses = () => {
    let filtered = allAnalyses;
    
    if (filterVerdict !== 'all') {
      filtered = filtered.filter(a => a.verdict === filterVerdict);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.source_url?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'score') return b.credibility_score - a.credibility_score;
      return 0;
    });
    
    return sorted;
  };

  const getFilteredUsers = () => {
    if (!searchTerm) return allUsers;
    return allUsers.filter(u => 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.clerk_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const fetchUserAnalyses = async (userId, userEmail) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/detection/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUserAnalyses(data);
      setSelectedUser({ id: userId, email: userEmail });
    } catch (error) {
      console.error('Failed to fetch user analyses:', error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(joinUrl(API_URL, '/api/feedback/all'));
      if (res.ok) setFeedbacks(await res.json());
    } catch (err) {
      console.error('Failed to fetch feedbacks:', err);
    }
  };

  const deleteFeedback = async (id) => {
    try {
      await fetch(joinUrl(API_URL, `/api/feedback/${id}`), { method: 'DELETE' });
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      setDeleteFeedbackConfirm(null);
    } catch (err) {
      console.error('Failed to delete feedback:', err);
    }
  };

  const deleteAnalysis = async (analysisId) => {
    try {
      const token = await getToken();
      const response = await fetch(joinUrl(API_URL, `/api/detection/history/${analysisId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to delete: ${error.error || 'Unknown error'}`);
        return;
      }
      setAllAnalyses(prev => prev.filter(a => a.id !== analysisId));
      setRecentAnalyses(prev => prev.filter(a => a.id !== analysisId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert('Failed to delete analysis');
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Welcome back, {user?.firstName || 'Admin'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div onClick={() => { setShowModal('all'); setFilterVerdict('all'); setSearchTerm(''); }} className="cursor-pointer">
            <StatCard
              icon={FileText}
              label="Total Analyses"
              value={stats.totalAnalyses}
              color="bg-gradient-to-br from-slate-700 to-black"
              trend={12}
            />
          </div>
          <div onClick={() => { setShowModal('all'); setFilterVerdict('LIKELY REAL'); setSearchTerm(''); }} className="cursor-pointer">
            <StatCard
              icon={CheckCircle}
              label="Real News Detected"
              value={stats.realNews}
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              trend={8}
            />
          </div>
          <div onClick={() => { setShowModal('all'); setFilterVerdict('LIKELY FAKE'); setSearchTerm(''); }} className="cursor-pointer">
            <StatCard
              icon={XCircle}
              label="Fake News Detected"
              value={stats.fakeNews}
              color="bg-gradient-to-br from-red-500 to-red-600"
              trend={-5}
            />
          </div>
          <div onClick={() => { setShowModal('users'); setSearchTerm(''); }} className="cursor-pointer">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend={15}
            />
          </div>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Pie Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left-8 delay-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Detection Overview</h2>
              <BarChart3 className="text-slate-400" size={20} />
            </div>
            {stats.totalAnalyses === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-12">No data yet</p>
            ) : (() => {
              const total = stats.totalAnalyses;
              const slices = [
                { label: 'Real News', value: stats.realNews, color: '#10b981' },
                { label: 'Fake News', value: stats.fakeNews, color: '#ef4444' },
                { label: 'Uncertain', value: stats.uncertain, color: '#f59e0b' },
              ];
              const cx = 100, cy = 100, r = 80;
              let cumulative = 0;
              const paths = slices.map(slice => {
                const pct = slice.value / total;
                const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
                cumulative += pct;
                const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
                const x1 = cx + r * Math.cos(startAngle);
                const y1 = cy + r * Math.sin(startAngle);
                const x2 = cx + r * Math.cos(endAngle);
                const y2 = cy + r * Math.sin(endAngle);
                const largeArc = pct > 0.5 ? 1 : 0;
                return { ...slice, pct, d: pct === 0 ? '' : `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z` };
              });
              return (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <svg viewBox="0 0 200 200" className="w-44 h-44 shrink-0">
                    {paths.map((s, i) => s.d && <path key={i} d={s.d} fill={s.color} stroke="white" strokeWidth="2" />)}
                    <circle cx={cx} cy={cy} r="44" fill="white" className="dark:fill-slate-900" />
                    <text x={cx} y={cy - 8} textAnchor="middle" className="text-xs" fill="currentColor" fontSize="14" fontWeight="bold">{total}</text>
                    <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="9">total</text>
                  </svg>
                  <div className="flex flex-col gap-3 w-full">
                    {slices.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{s.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.value}</span>
                          <span className="text-xs text-slate-500 w-10 text-right">{Math.round((s.value / total) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right-8 delay-300">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6">Quick Stats</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Activity className="text-blue-500" size={20} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Avg Score</span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.avgScore}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-emerald-500" size={20} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Real Rate</span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {stats.totalAnalyses > 0 ? Math.round((stats.realNews / stats.totalAnalyses) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="text-yellow-500" size={20} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Fake Rate</span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {stats.totalAnalyses > 0 ? Math.round((stats.fakeNews / stats.totalAnalyses) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 delay-400">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6">Recent Analyses</h2>
          {recentAnalyses.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No analyses yet</p>
          ) : (
          <div className="space-y-3">
            {recentAnalyses.map((analysis, idx) => (
              <div 
                key={analysis.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer gap-3 sm:gap-4"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {getVerdictIcon(analysis.verdict)}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">{analysis.title}</p>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      <span className="truncate">{analysis.date}</span>
                      {analysis.username && analysis.username !== 'Anonymous' && (
                        <>
                          <span>•</span>
                          <span className="text-xs">By: {analysis.username}</span>
                        </>
                      )}
                      {(!analysis.username || analysis.username === 'Anonymous') && (
                        <>
                          <span>•</span>
                          <span className="text-xs italic">Anonymous</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className={`text-xl sm:text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}%
                  </span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                    analysis.verdict === 'LIKELY REAL' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : analysis.verdict === 'LIKELY FAKE'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {analysis.verdict}
                  </span>
                  <button onClick={() => setDeleteConfirm(analysis.id)} className="p-1.5 sm:p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition">
                    <Trash2 size={16} className="sm:hidden" />
                    <Trash2 size={18} className="hidden sm:block" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Feedbacks Section */}
        <div className="mt-6 sm:mt-8 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-slate-400" size={20} />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">User Feedback & Comments</h2>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{feedbacks.length} total</span>
          </div>
          {feedbacks.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No feedback yet</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {feedbacks.map(fb => (
                <div key={fb.id} className="flex items-start justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold">
                        {fb.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{fb.name || 'Anonymous'}</span>
                      {fb.rating && <span className="text-xs text-yellow-500">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>}
                      <span className="text-xs text-slate-400 ml-auto">{new Date(fb.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{fb.comment}</p>
                    {fb.user_id && <p className="text-xs text-slate-400 mt-1">User ID: {fb.user_id}</p>}
                  </div>
                  <button onClick={() => setDeleteFeedbackConfirm(fb.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {showModal === 'users' ? 'All Users' : filterVerdict === 'all' ? 'All Analyses' : `${filterVerdict} News`}
              </h2>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
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
                    placeholder={showModal === 'users' ? 'Search users...' : 'Search analyses...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>
                {showModal === 'all' && (
                  <button
                    onClick={() => setSortBy(sortBy === 'date' ? 'score' : 'date')}
                    className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <ArrowUpDown size={20} />
                    <span>Sort by {sortBy === 'date' ? 'Score' : 'Date'}</span>
                  </button>
                )}
              </div>
              
              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto space-y-3">
                {showModal === 'users' ? (
                  getFilteredUsers().length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No users found</p>
                  ) : (
                    getFilteredUsers().map(user => (
                      <div 
                        key={user.clerk_id} 
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        onClick={() => fetchUserAnalyses(user.clerk_id, user.email)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{user.email}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.clerk_id}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  getFilteredAnalyses().length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No analyses found</p>
                  ) : (
                    getFilteredAnalyses().map(analysis => (
                      <div key={analysis.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            {getVerdictIcon(analysis.verdict)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                  {analysis.text.substring(0, 100)}...
                                </p>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                {analysis.username && analysis.username !== 'Anonymous' ? (
                                  <span>By: <span className="font-medium">{analysis.username}</span></span>
                                ) : (
                                  <span className="italic">Anonymous</span>
                                )}
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
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              analysis.verdict === 'LIKELY REAL' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : analysis.verdict === 'LIKELY FAKE'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {analysis.verdict}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(analysis.id); }} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* User Analyses Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedUser.email}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{userAnalyses.length} analyses</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
              {userAnalyses.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No analyses yet</p>
              ) : (
                userAnalyses.map(analysis => (
                  <div key={analysis.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {getVerdictIcon(analysis.verdict)}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            {analysis.text.substring(0, 150)}...
                          </p>
                          {analysis.source_url && (
                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 break-all">{analysis.source_url}</p>
                          )}
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{analysis.analysis}</p>
                          {analysis.indicators && analysis.indicators.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Indicators:</p>
                              {analysis.indicators.map((ind, idx) => (
                                <p key={idx} className="text-xs text-slate-600 dark:text-slate-400">• {ind}</p>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            {new Date(analysis.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.credibility_score)}`}>
                          {analysis.credibility_score}%
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          analysis.verdict === 'LIKELY REAL' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : analysis.verdict === 'LIKELY FAKE'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {analysis.verdict}
                        </span>
                        <button onClick={() => setDeleteConfirm(analysis.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
                Delete Analysis?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                This action cannot be undone. The analysis will be permanently removed from the database.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAnalysis(deleteConfirm)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Feedback Confirmation Modal */}
      {deleteFeedbackConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteFeedbackConfirm(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">Delete Feedback?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteFeedbackConfirm(null)} className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-all">Cancel</button>
                <button onClick={() => deleteFeedback(deleteFeedbackConfirm)} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all shadow-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;