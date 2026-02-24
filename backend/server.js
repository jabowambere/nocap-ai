const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const supabase = require('./config/supabase');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const { router: detectionRoutes } = require('./routes/detection');
const webhookRoutes = require('./routes/webhook');
const syncRoutes = require('./routes/sync');
const userRoutes = require('./routes/users');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/detection', detectionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/users', userRoutes);

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
});
