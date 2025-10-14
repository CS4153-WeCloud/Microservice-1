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

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'User Service API',
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

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;

