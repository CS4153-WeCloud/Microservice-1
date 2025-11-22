const swaggerJsdoc = require('swagger-jsdoc');

// get the server URL
const getServerUrl = () => {
  // if there is EXTERNAL_IP environment variable, use the external IP
  if (process.env.EXTERNAL_IP) {
    return `http://${process.env.EXTERNAL_IP}:3001`;
  }
  
  // Default to localhost for development
  return 'http://localhost:3001';
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth & User Service API',
      version: '1.0.0',
      description: 'RESTful API for User Management - Auth & User Service',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: getServerUrl(),
        description: process.env.NODE_ENV === 'production' ? 'Production server (GCP)' : 'Development server'
      }
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Health',
        description: 'Health check endpoints'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'firstName', 'lastName'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID (auto-generated)',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '+1234567890'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              description: 'User account status',
              example: 'active'
            },
            role: {
              type: 'string',
              enum: ['student', 'staff', 'faculty', 'other'],
              description: 'User role',
              example: 'student'
            },
            homeArea: {
              type: 'string',
              description: 'Home area (e.g., Flushing, Jersey City)',
              example: 'Flushing'
            },
            preferredDepartureTime: {
              type: 'string',
              format: 'time',
              description: 'Preferred departure time (HH:mm:ss)',
              example: '08:00:00'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            },
            links: {
              type: 'object',
              description: 'HATEOAS links',
              properties: {
                self: {
                  type: 'string',
                  description: 'Link to this user resource',
                  example: '/api/users/1'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message'
            },
            message: {
              type: 'string',
              example: 'Detailed error description'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/server.js']
};

const specs = swaggerJsdoc(options);

module.exports = { specs };

