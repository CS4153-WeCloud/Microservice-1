require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const userRoutes = require('./routes/userRoutes');
const { specs } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Routes
app.use('/api/users', userRoutes);

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

