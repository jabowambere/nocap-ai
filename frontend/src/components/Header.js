import React from 'react';
import { Moon, Sun, LogIn, LogOut, ArrowRight } from 'lucide-react';
import { useUser, useAuth, UserButton } from '@clerk/clerk-react';

const Header = ({ isDark, setIsDark, currentPath, navigate, onShowAuth }) => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useAuth();
  
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const isLanding = currentPath === '/';

  const goTo = (pathOrHash) => {
    if (pathOrHash.startsWith('#')) {
      const id = pathOrHash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    if (pathOrHash === '/') {
      navigate('/');
      return;
    }

    if (pathOrHash.startsWith('/')) {
      navigate(pathOrHash);
      return;
    }
  };


  return (
    <header className="bg-white/90 dark:bg-neutral-950/85 backdrop-blur-sm border-b border-slate-200/70 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <div className="flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform duration-200 min-w-0" onClick={() => goTo('/')}>
            <div className="relative">
              <img src="/favicon.svg" alt="Nocap AI Logo" loading="eager" width="48" height="48" className={`w-12 h-12 hover:shadow-xl transition-all duration-300 hover:rotate-3 ${isDark ? 'brightness-0 invert' : 'brightness-0'}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-black dark:from-slate-300 dark:to-white bg-clip-text text-transparent animate-in fade-in slide-in-from-left-4 duration-300 delay-400">Nocap AI</h1>
              <span className="text-xs text-slate-500 dark:text-slate-400 animate-in fade-in slide-in-from-left-4 duration-300 delay-500">{isSignedIn && isAdmin ? 'Admin Dashboard' : 'Truth Verification'}</span>
            </div>
          </div>

          {/* Navigation */}
          {isLanding && !isSignedIn && (
            <nav className="hidden md:flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
            </nav>
          )}

          {isSignedIn && isAdmin && (
            <nav className="flex gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
              <button
                onClick={() => navigate('/admin')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-105 ${
                  currentPath === '/admin'
                    ? 'bg-gradient-to-r from-slate-700 to-black text-white shadow-lg animate-pulse'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:shadow-md'
                }`}
              >
                Dashboard
              </button>
            </nav>
          )}
          
          {isSignedIn && !isAdmin && (
            <nav className="flex gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-105 ${
                  currentPath === '/dashboard'
                    ? 'bg-gradient-to-r from-slate-700 to-black text-white shadow-lg animate-pulse'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:shadow-md'
                }`}
              >
                My Dashboard
              </button>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-5 sm:gap-4 animate-in fade-in slide-in-from-right-8 duration-500 delay-300">
          {isSignedIn ? (
            <div className="flex items-center gap-5 sm:gap-4">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8'
                  }
                }}
              />
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <LogOut size={16} className="animate-pulse" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onShowAuth}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <LogIn size={16} />
                <span className="text-sm font-medium">Sign in</span>
              </button>
              <button
                onClick={() => goTo('#demo')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-900 text-white rounded-xl font-semibold shadow-[0_16px_40px_rgba(37,99,235,0.25)] transition-colors"
              >
                <span className="text-sm">Get demo</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
          
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-right-4 delay-800"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={20} className="text-slate-600 dark:text-slate-400" />
            ) : (
              <Moon size={20} className="text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
