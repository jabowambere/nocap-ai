import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import './App.css';
import Header from './components/Header';
import { Loader2 } from 'lucide-react';
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

        <footer className="border-t border-slate-200/70 dark:border-slate-800 py-6 mt-10">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>© 2025 NoCap AI. All rights reserved.</span>
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
