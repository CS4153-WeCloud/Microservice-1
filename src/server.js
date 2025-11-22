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
  // Get the current request's protocol and host
  const protocol = req.protocol || (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.get('host') || req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  
  // Clone specs and update server URLs dynamically
  const dynamicSpecs = JSON.parse(JSON.stringify(specs));
  
  // Update or add the current server URL
  if (!dynamicSpecs.servers) {
    dynamicSpecs.servers = [];
  }
  
  // Check if current URL already exists
  const currentServerExists = dynamicSpecs.servers.some(s => s.url === baseUrl);
  if (!currentServerExists) {
    // Add current server as the first option (default)
    dynamicSpecs.servers.unshift({
      url: baseUrl,
      description: 'Current Server'
    });
  } else {
    // Move current server to first position
    const index = dynamicSpecs.servers.findIndex(s => s.url === baseUrl);
    if (index > 0) {
      const server = dynamicSpecs.servers.splice(index, 1)[0];
      dynamicSpecs.servers.unshift(server);
    }
  }
  
  // Setup Swagger UI with dynamic specs
  swaggerUi.setup(dynamicSpecs)(req, res, next);
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

