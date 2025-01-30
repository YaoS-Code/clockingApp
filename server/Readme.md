## **Base URL**

```

http://localhost:13000/api

```

## **Authentication**

### **Login**

```
HTTPCollapse

POST /auth/login
Content-Type: application/json

{
    "username": "string",
    "password": "string"
}

Response:
{
    "message": "Login successful",
    "token": "jwt_token",
    "user": {
        "id": number,
        "username": "string",
        "email": "string",
        "full_name": "string",
        "role": "admin" | "user"
    }
}

```

### **Get Profile**

```
HTTP

GET /auth/profile
Authorization: Bearer token

Response:
{
    "id": number,
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "string",
    "created_at": "datetime",
    "last_login": "datetime",
    "status": "active" | "inactive"
}

```

## **User Management (Admin Only)**

### **Register New User**

```
HTTPCollapse

POST /auth/register
Authorization: Bearer admin_token
Content-Type: application/json

{
    "username": "string",
    "password": "string",
    "email": "string",
    "full_name": "string",
    "role": "user" | "admin"
}

Response:
{
    "message": "User registered successfully",
    "userId": number,
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "string"
}

```

## **Clock Operations**

### **Clock In**

```
HTTP

POST /clock/in
Authorization: Bearer token
Content-Type: application/json

{
    "notes": "string",
    "location": "string" (optional)
}

Response:
{
    "message": "Clocked in successfully",
    "recordId": number
}

```

### **Clock Out**

```
HTTP

POST /clock/out
Authorization: Bearer token
Content-Type: application/json

{
    "notes": "string",
    "location": "string" (optional)
}

Response:
{
    "message": "Clocked out successfully"
}

```

### **Get Personal Records**

```
HTTPCollapse

GET /clock/records
Authorization: Bearer token
Query Parameters:
- start_date (optional): "YYYY-MM-DD"
- end_date (optional): "YYYY-MM-DD"

Response:
[
    {
        "id": number,
        "clock_in": "datetime",
        "clock_out": "datetime",
        "status": "in" | "out",
        "notes": "string",
        "hours_worked": number,
        "location": "string"
    }
]

```

## **Admin Operations**

### **Get All Users**

```
HTTPCollapse

GET /admin/users
Authorization: Bearer admin_token

Response:
[
    {
        "id": number,
        "username": "string",
        "email": "string",
        "full_name": "string",
        "role": "string",
        "status": "string",
        "created_at": "datetime",
        "last_login": "datetime"
    }
]

```

### **Get Records Summary by Period**

```
HTTPCollapse

GET /admin/records/summary
Authorization: Bearer admin_token
Query Parameters:
- start_date: "YYYY-MM-DD"
- end_date: "YYYY-MM-DD"

Response:
[
    {
        "user_id": number,
        "username": "string",
        "full_name": "string",
        "total_records": number,
        "total_hours": number,
        "first_clock_in": "datetime",
        "last_clock_out": "datetime"
    }
]

```

### **Get User Records**

```
HTTPCollapse

GET /admin/users/:user_id/records
Authorization: Bearer admin_token
Query Parameters:
- start_date (optional): "YYYY-MM-DD"
- end_date (optional): "YYYY-MM-DD"

Response:
{
    "user": {
        "id": number,
        "username": "string",
        "full_name": "string"
    },
    "records": [
        {
            "id": number,
            "clock_in": "datetime",
            "clock_out": "datetime",
            "status": "string",
            "notes": "string",
            "hours_worked": number,
            "location": "string",
            "modification_info": 
            "modifier": "string",
                "modified_at": "datetime"
            }
        }
    ],
    "total_records": number,
    "total_hours": number
}

```

### **Modify Record**

```
HTTPCollapse

PUT /admin/records/:id
Authorization: Bearer admin_token
Content-Type: application/json

{
    "clock_in": "YYYY-MM-DD HH:mm:ss",
    "clock_out": "YYYY-MM-DD HH:mm:ss",
    "notes": "string"
}

Response:
{
    "message": "Record updated successfully",
    "record": {
        "id": number,
        "clock_in": "datetime",
        "clock_out": "datetime",
        "hours_worked": number,
        "notes": "string",
        "modified_by": "string"
    }
}

```

## **Error Responses**

```json
JSON

{
    "error": "Error message"
}

```

Common HTTP Status Codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## **Rate Limiting and Security**

- JWT expiration: 24 hours
- Required headers:
    - Content-Type: application/json
    - Authorization: Bearer token
- Input validation for all endpoints
- Audit logging for admin operations

This API documentation provides a complete reference for all available endpoints in the ClockingApp. Each endpoint includes:

- HTTP method
- URL
- Required headers
- Request body (if applicable)
- Query parameters (if applicable)
- Response format
- Error handling