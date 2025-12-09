# Auth & User Service

A RESTful microservice for user management with OpenAPI documentation, MySQL database integration, and Sprint 2 features.

## Project: Columbia Point2Point Semester Shuttle

This service handles user registration, login, and user profiles, storing basic commuter info such as home area and preferred departure time.

## Demo

- **Video**: https://www.youtube.com/watch?v=4Hm1THJjvkU
- **Production URL**: https://user-service-1081353560639.us-central1.run.app  
- **API Documentation**: https://user-service-1081353560639.us-central1.run.app/api-docs

## Features
- ✅ Complete REST API (GET, POST, PUT, DELETE)
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

- `GET /api/users` - Get all users
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

**Local:** `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`  
**Cloud Run:** `PORT`, `INSTANCE_CONNECTION_NAME`, `DB_SOCKET_PATH`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

See `env.example` for details.
