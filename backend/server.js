const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const supabase = require('./config/supabase');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://nocap-ai.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const { router: detectionRoutes } = require('./routes/detection');
const webhookRoutes = require('./routes/webhook');
const syncRoutes = require('./routes/sync');
const userRoutes = require('./routes/users');
const feedbackRoutes = require('./routes/feedback');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/detection', detectionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nocap AI Backend API',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      detection: '/api/detection',
      webhooks: '/api/webhooks',
      sync: '/api/sync'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Backend is running',
    database: 'Supabase Connected'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✓ Server running on port ${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ Auth endpoints available at http://localhost:${PORT}/api/auth\n`);

  // Ping AI service every 14 minutes to prevent Render sleep
  if (process.env.NODE_ENV === 'production' && process.env.AI_SERVICE_URL) {
    const pingAI = async () => {
      try {
        await fetch(`${process.env.AI_SERVICE_URL}/health`);
        console.log('✅ AI service ping successful');
      } catch {
        console.log('⚠️ AI service ping failed');
      }
    };
    // Ping immediately on startup to wake it up
    pingAI();
    // Then keep pinging every 14 minutes
    setInterval(pingAI, 14 * 60 * 1000);
  }
});
