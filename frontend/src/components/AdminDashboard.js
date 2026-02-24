import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { BarChart3, Users, FileText, TrendingUp, Activity, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Search, ArrowUpDown, X } from 'lucide-react';

const AdminDashboard = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
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

  useEffect(() => {
    if (getToken) {
      fetchAdminData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = await getToken();
      
      console.log('Fetching admin data...');
      
      // Fetch all analyses
      const analysesRes = await fetch(`${API_URL}/api/detection/all-analyses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!analysesRes.ok) {
        console.error('Analyses fetch failed:', analysesRes.status);
        setLoading(false);
        return;
      }
      
      const analyses = await analysesRes.json();
      console.log('Analyses:', analyses);
      
      setAllAnalyses(analyses);

      // Fetch users count
      const usersRes = await fetch(`${API_URL}/api/users`, {
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
        date: new Date(a.created_at).toLocaleString()
      })));

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
            +{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back, {user?.firstName || 'Admin'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Accuracy Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left-8 delay-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Detection Overview</h2>
              <BarChart3 className="text-slate-400" size={24} />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Real News</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {stats.totalAnalyses > 0 ? Math.round((stats.realNews / stats.totalAnalyses) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.totalAnalyses > 0 ? (stats.realNews / stats.totalAnalyses) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Fake News</span>
                  <span className="text-sm font-semibold text-red-600">
                    {stats.totalAnalyses > 0 ? Math.round((stats.fakeNews / stats.totalAnalyses) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.totalAnalyses > 0 ? (stats.fakeNews / stats.totalAnalyses) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Uncertain</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {stats.totalAnalyses > 0 ? Math.round((stats.uncertain / stats.totalAnalyses) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.totalAnalyses > 0 ? (stats.uncertain / stats.totalAnalyses) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right-8 delay-300">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Quick Stats</h2>
            <div className="space-y-4">
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 delay-400">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Recent Analyses</h2>
          {recentAnalyses.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">No analyses yet</p>
          ) : (
          <div className="space-y-3">
            {recentAnalyses.map((analysis, idx) => (
              <div 
                key={analysis.id}
                className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer animate-in fade-in slide-in-from-left-4 delay-${500 + idx * 100}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {getVerdictIcon(analysis.verdict)}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{analysis.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{analysis.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}%
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    analysis.verdict === 'LIKELY REAL' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : analysis.verdict === 'LIKELY FAKE'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {analysis.verdict}
                  </span>
                </div>
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
                      <div key={user.clerk_id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              analysis.verdict === 'LIKELY REAL' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : analysis.verdict === 'LIKELY FAKE'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {analysis.verdict}
                            </span>
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
    </div>
  );
};

export default AdminDashboard;