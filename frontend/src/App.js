import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import './App.css';
import Header from './components/Header';
import { Loader2 } from 'lucide-react';
import LandingSections from './components/LandingSections';

// Lazy load heavy components
const Hero = lazy(() => import('./components/Hero'));
const DetectionForm = lazy(() => import('./components/DetectionForm'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const History = lazy(() => import('./components/History'));
const ClerkAuth = lazy(() => import('./components/ClerkAuth'));

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
    // Theme handling
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sync user to Supabase when they sign in
  useEffect(() => {
    if (isSignedIn && user) {
      const syncUser = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/sync/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
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
          
          // If user is admin in Supabase, update Clerk metadata
          if (result.role === 'admin' && !user.publicMetadata?.role) {
            console.log('User is admin in Supabase, should update Clerk metadata manually');
          }
        } catch (error) {
          console.error('Failed to sync user:', error);
        }
      };
      
      syncUser();
      
      // Redirect to appropriate dashboard after sign in
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
          </Routes>
        </Suspense>

        <Suspense fallback={null}>
          <ClerkAuth 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </Suspense>
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
