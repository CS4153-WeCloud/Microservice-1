# Sprint 2 Demo Script - Auth & User Service

## Local Development

### Start Service
```bash
cd /Users/cathzzr2/Desktop/Microservice-1
npm start
```

### Access Swagger UI
Open in browser: http://localhost:3001/api-docs

### Local Test Commands
```bash
# Health check
curl http://localhost:3001/health

# Get all users
curl "http://localhost:3001/api/users" | python3 -m json.tool

# Query parameters
curl "http://localhost:3001/api/users?role=student&home_area=Flushing" | python3 -m json.tool
```

---

## Production (Cloud Run)

### Service URL
```
https://user-service-1081353560639.us-central1.run.app
```

### Demo Commands

```bash
SERVICE_URL="https://user-service-1081353560639.us-central1.run.app"

# 0. API Documentation (open in browser)
echo "API Docs: $SERVICE_URL/api-docs"

# 1. Health Check
curl $SERVICE_URL/health

# 2. Get All Users
curl "$SERVICE_URL/api/users" | python3 -m json.tool

# 3. Query Parameters: Filter by Role
curl "$SERVICE_URL/api/users?role=student" | python3 -m json.tool

# 4. Query Parameters: Filter by Home Area
curl "$SERVICE_URL/api/users?home_area=Flushing" | python3 -m json.tool

# 5. Query Parameters: Multiple Filters + Sort
curl "$SERVICE_URL/api/users?role=student&home_area=Flushing&sortBy=created_at&sortOrder=DESC" | python3 -m json.tool

# 6. HTTP 201 Created: Create User
curl -v -X POST $SERVICE_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "firstName": "Demo",
    "lastName": "User",
    "role": "student",
    "homeArea": "Jersey City"
  }' 2>&1 | grep -E "(HTTP|Location|201)"

# 7. Linked Data: Get Single User
curl "$SERVICE_URL/api/users/1" | python3 -m json.tool
```

## Redeployment After Code Changes

### 1. Build Docker Image (Local or Cloud Shell)
```bash
export PROJECT_ID=wecloud-475402
gcloud builds submit --tag gcr.io/$PROJECT_ID/user-service
```

### 2. Deploy to Cloud Run (Cloud Shell)
```bash
gcloud run services update user-service \
    --image gcr.io/$PROJECT_ID/user-service \
    --region us-central1
```