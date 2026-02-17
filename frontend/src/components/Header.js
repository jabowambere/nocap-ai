import React from 'react';
import { Moon, Sun, LogIn, LogOut, Sparkles } from 'lucide-react';
import { useUser, useAuth, UserButton } from '@clerk/clerk-react';

const Header = ({ isDark, setIsDark, currentPath, navigate, onShowAuth }) => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useAuth();
  
  const isAdmin = user?.publicMetadata?.role === 'admin';
  return (
    <header className="bg-white/95 dark:bg-neutral-950 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer animate-in fade-in slide-in-from-left-8 duration-500 delay-200 hover:scale-105 transition-transform duration-200" onClick={() => navigate('/')}>
            <div className="relative">
              <img src="/favicon.svg" alt="Nocap AI Logo" className={`w-12 h-12 hover:shadow-xl transition-all duration-300 hover:rotate-3 ${isDark ? 'invert-0' : 'invert'}`} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={10} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-black dark:from-slate-300 dark:to-white bg-clip-text text-transparent animate-in fade-in slide-in-from-left-4 duration-300 delay-400">Nocap AI</h1>
              <span className="text-xs text-slate-500 dark:text-slate-400 animate-in fade-in slide-in-from-left-4 duration-300 delay-500">{isSignedIn && isAdmin ? 'Admin Dashboard' : 'Truth Verification'}</span>
            </div>
          </div>

          {/* Navigation */}
          {isSignedIn && isAdmin && (
            <nav className="flex gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
              <button
                onClick={() => navigate('/admin')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
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
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
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
        
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-500 delay-300">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
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
            <button
              onClick={onShowAuth}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700 to-black text-white rounded-xl font-semibold hover:from-slate-800 hover:to-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-in fade-in slide-in-from-right-4 delay-700"
            >
              <LogIn size={16} className="animate-bounce" />
              <span>Sign In</span>
            </button>
          )}
          
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-3 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 animate-in fade-in slide-in-from-right-4 delay-800"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={20} className="animate-spin text-yellow-500" />
            ) : (
              <Moon size={20} className="animate-pulse text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
