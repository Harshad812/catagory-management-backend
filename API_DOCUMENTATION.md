# 📚 API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## Category Endpoints

**Note:** All category endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### Create Category

```http
POST /api/category
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Electronics",
  "parent": null,  // Optional: ID of parent category
  "status": "active"  // Optional: "active" or "inactive"
}
```

### Get All Categories (Tree Structure)

```http
GET /api/category
Authorization: Bearer <token>
```

### Update Category

```http
PUT /api/category/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",  // Optional
  "status": "inactive"  // Optional: Cascades to all descendants
}
```

### Delete Category

```http
DELETE /api/category/:id
Authorization: Bearer <token>
```
