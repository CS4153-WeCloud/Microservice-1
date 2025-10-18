# User Service Microservice

A RESTful microservice for user management with OpenAPI documentation and MySQL database integration.

## Features

- ✅ Complete REST API (GET, POST, PUT, DELETE)
- ✅ OpenAPI 3.0 documentation with Swagger UI
- ✅ MySQL database integration
- ✅ Health check endpoint
- ✅ Ready for GCP VM deployment

## Tech Stack

- Node.js + Express
- MySQL
- Swagger/OpenAPI 3.0
- Docker support

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Create database and tables (see database setup below)

4. Start the server:
```bash
npm start
```

5. Access the API locally:
   - API Base: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs
   - Health Check: http://localhost:3001/health

## API Endpoints

### Users Resource

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Example Request

```bash
# Create a user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "status": "active"
  }'
```

## Database Setup

The database schema is defined in the `database`. To set up locally:

```bash
mysql -u root -p < ../database/schema.sql
```

## GCP VM Deployment

### Quick Setup for Team Members

**1. Create VM in GCP Console**
- Go to [GCP Console](https://console.cloud.google.com/)
- Create VM: `user-service-vm`, `e2-medium`, `us-central1-c`
- Enable HTTP traffic

**2. SSH into VM**
```bash
gcloud compute ssh user-service-vm --zone=us-central1-c
```

**3. Install & Setup**
```bash
# Install software
sudo apt-get update
sudo apt-get install -y git default-mysql-server
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Clone repo
git clone https://github.com/CS4153-WeCloud/Microservice-1.git
cd Microservice-1

# Install dependencies
npm install

# Setup database
sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS user_service_db;"
sudo mysql -u root -e "CREATE USER IF NOT EXISTS 'user_service'@'localhost' IDENTIFIED BY 'password123';"
sudo mysql -u root -e "GRANT ALL PRIVILEGES ON user_service_db.* TO 'user_service'@'localhost';"
sudo mysql -u root -e "FLUSH PRIVILEGES;"
sudo mysql -u root < database/schema.sql

# Configure environment
cp env.example .env
# Edit .env with: DB_HOST=localhost, DB_USER=user_service, DB_PASSWORD=password123, DB_NAME=user_service_db

# Start service
npm start
```

**4. Configure Firewall**
- GCP Console > VPC network > Firewall
- Create rule: `allow-user-service`, TCP:3001, Target: `http-server`

**5. Set External IP and Test**
```bash
# Get your VM's external IP
curl ifconfig.me

# Set the external IP environment variable
export EXTERNAL_IP=$(curl -s ifconfig.me)

# Start the service
npm start

# Test API
curl http://$EXTERNAL_IP:3001/health
# Open in browser: http://$EXTERNAL_IP:3001/api-docs
```

## Project Structure

```
microservice-1-user/
├── src/
│   ├── config/
│   │   ├── database.js      # MySQL connection pool
│   │   └── swagger.js       # OpenAPI configuration
│   ├── models/
│   │   └── User.js          # User model
│   ├── routes/
│   │   └── userRoutes.js    # User API routes
│   └── server.js            # Express app entry point
├── .env.example
├── package.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL user | root |
| DB_PASSWORD | MySQL password | |
| DB_NAME | Database name | user_service_db |
| DB_PORT | MySQL port | 3306 |

## Development Team Notes

- OpenAPI documentation is auto-generated from JSDoc comments in routes
- Database connection is pooled for better performance
- All endpoints include error handling
- Health check endpoint for monitoring
- Ready for horizontal scaling

## Next Steps

1. Add authentication/authorization
2. Implement rate limiting
3. Add request validation middleware
4. Set up logging (Winston/Morgan)
5. Add unit and integration tests
6. Implement caching (Redis)

