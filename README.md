# User Service Microservice

A RESTful microservice for user management with OpenAPI documentation and MySQL database integration.

## Features

- ✅ Complete REST API (GET, POST, PUT, DELETE)
- ✅ OpenAPI 3.0 documentation with Swagger UI
- ✅ MySQL database integration
- ✅ MVC architecture with models
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
npm run dev
```

5. Access the API:
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

The database schema is defined in the `database-repo`. To set up locally:

```bash
mysql -u root -p < ../database-repo/schema/user_service_schema.sql
```

## GCP Deployment

### 1. Create a VM Instance

```bash
gcloud compute instances create user-service-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --tags=http-server
```

### 2. Configure Firewall

```bash
gcloud compute firewall-rules create allow-user-service \
  --allow=tcp:3001 \
  --target-tags=http-server
```

### 3. Deploy Application

```bash
# SSH into VM
gcloud compute ssh user-service-vm --zone=us-central1-a

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repo
git clone <your-repo-url>
cd microservice-1-user

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with MySQL VM internal IP

# Start with PM2 (process manager)
sudo npm install -g pm2
pm2 start src/server.js --name user-service
pm2 save
pm2 startup
```

### 4. Connect to MySQL VM

Update your `.env` file with the MySQL VM's internal IP:

```
DB_HOST=<mysql-vm-internal-ip>
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=user_service_db
```

## Testing the Deployment

```bash
# Get external IP
gcloud compute instances describe user-service-vm --zone=us-central1-a --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Test the API
curl http://<external-ip>:3001/health
curl http://<external-ip>:3001/api/users
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

