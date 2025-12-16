# Auth & User Service

A RESTful microservice for user management with OpenAPI documentation, MySQL database integration, and Sprint 2 features.

## Project: Columbia Point2Point Semester Shuttle

This service handles user registration, login, and user profiles, storing basic commuter info such as home area and preferred departure time.

## Demo

- **Video**: https://www.youtube.com/watch?v=4Hm1THJjvkU
- **Production URL**: https://user-service-1081353560639.us-central1.run.app
- **API Documentation**: https://user-service-1081353560639.us-central1.run.app/api-docs

### OAuth/JWT Authentication Demo

1. **OAuth Login**: Visit `https://user-service-1081353560639.us-central1.run.app/api/auth/google`
2. **Authenticate**: Login with Google account and grant permissions
3. **Receive Token**: Get JWT token in JSON response
4. **Use Token**: Include in `Authorization: Bearer <token>` header for API calls
5. **Verify Token**: Use `/api/auth/verify` endpoint for token validation

#### API Integration
- Other microservices authenticate using: `Authorization: Bearer <jwt_token>`
- Validate tokens via: `POST /api/auth/verify`

#### Useful Commands
```bash
# Get current user info
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://user-service-1081353560639.us-central1.run.app/api/auth/me"

# Verify token
curl -X POST "https://user-service-1081353560639.us-central1.run.app/api/auth/verify" \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN"}'

# Get all users (authenticated)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://user-service-1081353560639.us-central1.run.app/api/users"
```


## Features
- ✅ Complete REST API (GET, POST, PUT, DELETE)
- ✅ Google OAuth2 / OIDC Authentication with JWT tokens
- ✅ OpenAPI 3.0 documentation with Swagger UI
- ✅ MySQL database integration (Cloud SQL)
- ✅ Query Parameters: Filter and sort users by role, home area, status
- ✅ Linked Data**: All responses include relative path links
- ✅ HTTP 201 Created: POST methods return 201 status with Location header
- ✅ Cloud Run Deployment: Deployed on Cloud Run with Cloud SQL Database A

# Quick Start

## Local Development
```bash
npm install
cp env.example .env
npm start
# Access: http://localhost:3001/api-docs
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Handle OAuth callback and return JWT token
- `GET /api/auth/me` - Get current authenticated user (requires JWT)
- `POST /api/auth/verify` - Verify JWT token validity
- `POST /api/auth/logout` - Logout (client-side token removal)

### Users
- `GET /api/users` - Get all users (requires JWT)
- `GET /api/users?role=student&home_area=Flushing` - Filter by role and home area
- `GET /api/users/:id` - Get user by ID (includes links)
- `POST /api/users` - Create new user (returns 201 Created with Location header)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Query Parameters:** `role`, `home_area`, `status`, `sortBy`, `sortOrder`

## Deployment

Deployed on **Cloud Run** using MySQL.

**Production URL**: https://user-service-1081353560639.us-central1.run.app
## Environment Variables

### Database
**Local:** `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`  
**Cloud Run:** `PORT`, `INSTANCE_CONNECTION_NAME`, `DB_SOCKET_PATH`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### OAuth & JWT
**Both:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SESSION_SECRET`

See `env.example` for complete configuration details.
