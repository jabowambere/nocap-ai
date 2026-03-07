import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Publishable Key');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

// Render a lightweight shell immediately
root.render(
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: '#f8fafc'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        border: '4px solid #e2e8f0',
        borderTopColor: '#475569',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <div style={{ fontSize: '18px', color: '#64748b', fontFamily: 'system-ui' }}>Loading Nocap AI...</div>
    </div>
  </div>
);

// Add spinner animation
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
  });
}
