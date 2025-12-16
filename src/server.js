require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const session = require('express-session');
const passport = require('./config/passport');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const { specs } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration (for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Swagger Documentation - dynamically set server URL based on request
app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
  try {
    // Get the current request's protocol and host
    // Cloud Run sets x-forwarded-proto header
    let protocol = 'https';
    if (req.headers['x-forwarded-proto']) {
      protocol = req.headers['x-forwarded-proto'].split(',')[0].trim();
    } else if (req.protocol === 'http' || req.secure === false) {
      protocol = 'http';
    }
    
    const host = req.get('host') || req.headers.host || 'localhost:3001';
    const baseUrl = `${protocol}://${host}`;
    
    // Clone specs to avoid modifying the original
    const dynamicSpecs = JSON.parse(JSON.stringify(specs));
    
    // Ensure servers array exists
    if (!dynamicSpecs.servers || !Array.isArray(dynamicSpecs.servers)) {
      dynamicSpecs.servers = [];
    }
    
    // Replace all servers with just the current one (simplest approach)
    dynamicSpecs.servers = [{
      url: baseUrl,
      description: 'Current Server'
    }];
    
    // Setup Swagger UI with dynamic specs
    const swaggerUiHandler = swaggerUi.setup(dynamicSpecs, {
      swaggerOptions: {
        persistAuthorization: true
      }
    });
    
    swaggerUiHandler(req, res, next);
  } catch (error) {
    console.error('Swagger UI setup error:', error);
    // Fallback to default setup
    swaggerUi.setup(specs)(req, res, next);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    service: 'auth-user-service',
    timestamp: new Date().toISOString()
  });
});

// Debug: Log environment variables at startup
console.log('🔍 Environment check:', {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
  SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'NOT SET'
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Debug route to test if auth routes are registered
app.get('/debug/auth', (req, res) => {
  res.json({
    message: 'Auth routes debug',
    timestamp: new Date().toISOString(),
    env: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'NOT SET'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Auth & User Service API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Auth & User Service running on port ${PORT}`);
  
  // if there is EXTERNAL_IP environment variable, use the external IP
  if (process.env.EXTERNAL_IP) {
    console.log(`API Documentation available at http://${process.env.EXTERNAL_IP}:${PORT}/api-docs`);
    console.log(`API Endpoints: http://${process.env.EXTERNAL_IP}:${PORT}/api/users`);
  } else {
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    console.log(`API Endpoints: http://localhost:${PORT}/api/users`);
  }
});

module.exports = app;

