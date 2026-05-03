import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import './App.css';
import Header from './components/Header';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import LandingSections from './components/LandingSections';
import FeedbackSection from './components/FeedbackSection';

// Lazy load heavy components
const Hero = lazy(() => import('./components/Hero'));
const DetectionForm = lazy(() => import('./components/DetectionForm'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const History = lazy(() => import('./components/History'));
const ClerkAuth = lazy(() => import('./components/ClerkAuth'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="animate-spin text-slate-400" size={48} />
  </div>
);

function AppContent() {
  const [isDark, setIsDark] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDevBanner, setShowDevBanner] = useState(true);
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.publicMetadata?.role === 'admin';

  console.log('User:', user);
  console.log('Is Admin:', isAdmin);
  console.log('Public Metadata:', user?.publicMetadata);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (isSignedIn && user) {
      const syncUser = async () => {
        try {
          const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
          const response = await fetch(`${API_URL}/api/sync/sync-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName
            })
          });
          const result = await response.json();
          console.log('User sync result:', result);
          if (result.role === 'admin' && !user.publicMetadata?.role) {
            console.log('User is admin in Supabase, should update Clerk metadata manually');
          }
        } catch (error) {
          console.error('Failed to sync user:', error);
        }
      };

      syncUser();

      if (location.pathname === '/') {
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [isSignedIn, user, isAdmin, navigate, location.pathname]);

  return (
    <div className={isDark ? 'dark' : 'light'}>
      <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-50 transition-colors duration-300">
        {showDevBanner && (
          <div className="bg-amber-100 text-amber-950 dark:bg-amber-500/15 dark:text-amber-200 border-b border-amber-300/80 dark:border-amber-400/20">
            <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm font-medium">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-center sm:text-left flex-1">
                <AlertTriangle size={16} className="flex-shrink-0" />
                <span>NoCap AI is still under development. Results may change as we continue improving the platform.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDevBanner(false)}
                className="p-1 rounded-md hover:bg-amber-200/80 dark:hover:bg-amber-400/10 transition-colors"
                aria-label="Dismiss development alert"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        <Header
          isDark={isDark}
          setIsDark={setIsDark}
          currentPath={location.pathname}
          navigate={navigate}
          onShowAuth={() => setShowAuthModal(true)}
        />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <LandingSections />
                <DetectionForm isAuthenticated={isSignedIn} onShowAuth={() => setShowAuthModal(true)} />
                <FeedbackSection />
              </>
            } />
            <Route path="/admin" element={
              isSignedIn && isAdmin ? <AdminDashboard /> : <Navigate to="/" />
            } />
            <Route path="/dashboard" element={
              isSignedIn ? <UserDashboard /> : <Navigate to="/" />
            } />
            <Route path="/history" element={
              isSignedIn && isAdmin ? <History /> : <Navigate to="/" />
            } />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </Suspense>

        <Suspense fallback={null}>
          <ClerkAuth
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </Suspense>

        <footer className="border-t border-slate-200/70 dark:border-slate-800 py-6 mt-10 bg-white dark:bg-black z-40">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>© 2025 NoCap AI. All rights reserved.</span>
            <span className="text-xs text-center text-slate-400 dark:text-slate-500 italic">NoCap AI can make mistakes — always verify important information from trusted sources.</span>
            <span>Designed & Developed by <span className="font-medium text-slate-700 dark:text-slate-300">Junior JABO GABIRO</span></span>
            <button
              onClick={() => navigate('/privacy')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors underline underline-offset-2"
            >
              Privacy Policy
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
