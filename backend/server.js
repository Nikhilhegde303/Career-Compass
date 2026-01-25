const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE ==========
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== BASIC ROUTES ==========


app.get('/', (req, res) => {
  res.json({
    message: '🎯 Career Compass API',
    version: '1.0.0',
    status: 'operational',
    documentation: 'Coming soon...'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ========== API ROUTES ==========
// We'll add these later
app.use('/api/auth', authRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// ========== ERROR HANDLING ==========
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`
  🚀 Career Compass Backend Server
  📍 Port: ${PORT}
  🌐 Environment: ${process.env.NODE_ENV || 'development'}
  ⏰ Started: ${new Date().toLocaleString()}
  
  🔗 Test Endpoints:
     • Home: http://localhost:${PORT}/
     • Health: http://localhost:${PORT}/api/health
     • API Test: http://localhost:${PORT}/api/test
  `);
});