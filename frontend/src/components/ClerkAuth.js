import React, { useEffect, useState } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { X } from 'lucide-react';

const ClerkAuth = ({ isOpen, onClose }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  if (!isOpen) return null;

  const appearance = {
    baseTheme: isDark ? 'dark' : 'light',
    elements: {
      formButtonPrimary: 'bg-gradient-to-r from-slate-700 to-black hover:from-slate-800 hover:to-gray-900',
      card: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
      headerTitle: isDark ? 'text-slate-100' : 'text-slate-900',
      headerSubtitle: isDark ? 'text-slate-400' : 'text-slate-600',
      socialButtonsBlockButton: isDark 
        ? 'border-slate-700 hover:bg-slate-800 text-slate-100' 
        : 'border-slate-300 hover:bg-slate-50 text-slate-900',
      formFieldLabel: isDark ? 'text-slate-300' : 'text-slate-700',
      formFieldInput: isDark 
        ? 'bg-slate-800 border-slate-700 text-slate-100' 
        : 'bg-slate-50 border-slate-200 text-slate-900',
      logoImage: isDark ? 'brightness-0 invert' : 'brightness-0',
      footerActionLink: 'hidden',
      footer: 'hidden'
    },
    layout: {
      socialButtonsPlacement: 'bottom',
      socialButtonsVariant: 'blockButton',
      showOptionalFields: false,
      logoImageUrl: '/favicon.svg'
    },
    variables: {
      colorPrimary: '#1e293b',
      colorText: isDark ? '#f1f5f9' : '#0f172a',
      colorBackground: isDark ? '#0f172a' : '#ffffff',
      colorInputBackground: isDark ? '#1e293b' : '#f8fafc',
      colorInputText: isDark ? '#f1f5f9' : '#0f172a'
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg z-10 text-slate-900 dark:text-slate-100"
        >
          <X size={20} />
        </button>
        
        <SignIn 
          appearance={appearance}
          redirectUrl="/"
          routing="hash"
        />
      </div>
    </div>
  );
};

export default ClerkAuth;
