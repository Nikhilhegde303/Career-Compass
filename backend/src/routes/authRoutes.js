const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes are working!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile'
    }
  });
});

// User registration (placeholder)
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  
  // Basic validation
  if (!email || !password || !name) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['email', 'password', 'name'] 
    });
  }
  
  res.json({
    message: 'User registered successfully (placeholder)',
    user: { email, name },
    note: 'Database integration coming in next step'
  });
});

// User login (placeholder)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password required' 
    });
  }
  
  res.json({
    message: 'Login successful (placeholder)',
    token: 'dummy-jwt-token-for-now',
    user: { email, name: 'John Doe' }
  });
});

module.exports = router;