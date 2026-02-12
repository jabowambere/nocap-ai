import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { X } from 'lucide-react';

const ClerkAuth = ({ isOpen, onClose }) => {

  if (!isOpen) return null;

  const appearance = {
    elements: {
      formButtonPrimary: 'bg-gradient-to-r from-slate-700 to-black hover:from-slate-800 hover:to-gray-900',
      card: 'shadow-none border-0',
      headerTitle: 'text-slate-900 dark:text-slate-100',
      headerSubtitle: 'text-slate-600 dark:text-slate-400',
      socialButtonsBlockButton: 'border-slate-300 hover:bg-slate-50',
      formFieldLabel: 'text-slate-700 dark:text-slate-300',
      footerActionLink: 'hidden',
      footer: 'hidden'
    },
    layout: {
      socialButtonsPlacement: 'bottom',
      socialButtonsVariant: 'blockButton',
      showOptionalFields: false
    },
    variables: {
      colorPrimary: '#1e293b',
      colorText: '#0f172a',
      colorBackground: '#ffffff',
      colorInputBackground: '#f8fafc',
      colorInputText: '#0f172a'
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg z-10"
        >
          <X size={20} />
        </button>
        
        <div className="p-6">
          <SignIn 
            appearance={appearance}
            redirectUrl="/"
            routing="hash"
          />
        </div>
      </div>
    </div>
  );
};

export default ClerkAuth;