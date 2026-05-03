import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Publishable Key');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

// Add spinner keyframe animation
const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);

// Dynamically import heavy dependencies after first paint
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadApp, { timeout: 500 });
} else {
  setTimeout(loadApp, 100);
}

function loadApp() {
  Promise.all([
    import('./App'),
    import('@clerk/clerk-react')
  ]).then(([AppModule, ClerkModule]) => {
    const App = AppModule.default;
    const { ClerkProvider } = ClerkModule;

    root.render(
      <ClerkProvider publishableKey={clerkPubKey}>
        <App />
      </ClerkProvider>
    );

    // Hide the CSS loader once React has mounted
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 350);
    }
  });
}
