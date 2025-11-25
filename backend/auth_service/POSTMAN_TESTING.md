# Testing FastAPI Auth Service with Postman

## Prerequisites

1. ✅ FastAPI service running on `http://localhost:8001`
2. ✅ MongoDB running and connected
3. ✅ Postman installed

---

## Step 1: Start the FastAPI Service

```powershell
cd backend\auth_service
.\start.ps1
```

Wait until you see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
MongoDB Connected: ...
```

---

## Step 2: Create a Postman Collection

1. Open Postman
2. Click **Collections** → **New Collection**
3. Name it: `MediGuard FastAPI Auth`
4. Click **Create**

---

## Step 3: Test Health Check Endpoint

### Request 1: Health Check

1. **Click** "Add Request" in your collection
2. **Name**: `Health Check`
3. **Method**: `GET`
4. **URL**: `http://localhost:8001/api/health`
5. **Click** "Send"

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Auth service is running",
  "timestamp": "2025-11-23T12:34:56.789123"
}
```

✅ If you see this, your service is running correctly!

---

## Step 4: Test User Signup

### Request 2: Signup (Valid User)

1. **Click** "Add Request"
2. **Name**: `Signup - Valid User`
3. **Method**: `POST`
4. **URL**: `http://localhost:8001/api/auth/signup`
5. **Go to** "Headers" tab:
   - Key: `Content-Type`
   - Value: `application/json`
6. **Go to** "Body" tab:
   - Select **raw**
   - Select **JSON** from dropdown
   - Enter:
   ```json
   {
     "name": "John Doe",
     "email": "john.doe@example.com",
     "password": "SecurePass123"
   }
   ```
7. **Click** "Send"

**Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "673c2a1b9f8e4d2b1c3a5678",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M2MyYT..."
  }
}
```

📋 **Important**: Copy the `token` value - you'll need it for protected endpoints!

---

## Step 5: Test Signup Validation

### Request 3: Signup - Weak Password

1. **Duplicate** the previous request (right-click → Duplicate)
2. **Name**: `Signup - Weak Password`
3. **Change Body** to:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "weak"
   }
   ```
4. **Click** "Send"

**Expected Response** (422 Unprocessable Entity):
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "password"],
      "msg": "Value error, Password must be at least 6 characters",
      "input": "weak"
    }
  ]
}
```

### Request 4: Signup - Invalid Email

1. **Duplicate** the signup request
2. **Name**: `Signup - Invalid Email`
3. **Change Body** to:
   ```json
   {
     "name": "Test User",
     "email": "not-an-email",
     "password": "SecurePass123"
   }
   ```
4. **Click** "Send"

**Expected Response** (422 Unprocessable Entity):
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "value is not a valid email address"
    }
  ]
}
```

### Request 5: Signup - Duplicate Email

1. **Use** the original valid signup request
2. **Name**: `Signup - Duplicate Email`
3. **Click** "Send" again (same email as Request 2)

**Expected Response** (400 Bad Request):
```json
{
  "detail": "User already exists with this email"
}
```

---

## Step 6: Test User Login

### Request 6: Login - Valid Credentials

1. **Click** "Add Request"
2. **Name**: `Login - Valid Credentials`
3. **Method**: `POST`
4. **URL**: `http://localhost:8001/api/auth/login`
5. **Headers**:
   - Key: `Content-Type`
   - Value: `application/json`
6. **Body** (raw JSON):
   ```json
   {
     "email": "john.doe@example.com",
     "password": "SecurePass123"
   }
   ```
7. **Click** "Send"

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "673c2a1b9f8e4d2b1c3a5678",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

📋 **Copy this token** for the next steps!

### Request 7: Login - Invalid Password

1. **Duplicate** the login request
2. **Name**: `Login - Invalid Password`
3. **Change Body**:
   ```json
   {
     "email": "john.doe@example.com",
     "password": "WrongPassword123"
   }
   ```
4. **Click** "Send"

**Expected Response** (401 Unauthorized):
```json
{
  "detail": "Invalid credentials"
}
```

### Request 8: Login - Non-existent User

1. **Duplicate** the login request
2. **Name**: `Login - Non-existent User`
3. **Change Body**:
   ```json
   {
     "email": "nonexistent@example.com",
     "password": "SecurePass123"
   }
   ```
4. **Click** "Send"

**Expected Response** (401 Unauthorized):
```json
{
  "detail": "Invalid credentials"
}
```

---

## Step 7: Test Protected Endpoint (Get Current User)

### Request 9: Get Current User - With Valid Token

1. **Click** "Add Request"
2. **Name**: `Get Current User - Valid Token`
3. **Method**: `GET`
4. **URL**: `http://localhost:8001/api/auth/me`
5. **Go to** "Authorization" tab:
   - Type: `Bearer Token`
   - Token: *Paste the token from login response*
   
   **OR** use "Headers" tab:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (paste your token)

6. **Click** "Send"

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "673c2a1b9f8e4d2b1c3a5678",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

### Request 10: Get Current User - No Token

1. **Duplicate** the previous request
2. **Name**: `Get Current User - No Token`
3. **Remove** the Authorization header
4. **Click** "Send"

**Expected Response** (403 Forbidden):
```json
{
  "detail": "Not authenticated"
}
```

### Request 11: Get Current User - Invalid Token

1. **Duplicate** the valid token request
2. **Name**: `Get Current User - Invalid Token`
3. **Change** Authorization to:
   - `Bearer invalid_token_here`
4. **Click** "Send"

**Expected Response** (401 Unauthorized):
```json
{
  "detail": "Invalid or expired token"
}
```

---

## Step 8: Save Token as Collection Variable (Advanced)

To automatically use tokens across requests:

1. **Click** on your collection name
2. **Go to** "Variables" tab
3. **Add variable**:
   - Variable: `auth_token`
   - Initial Value: (leave empty)
   - Current Value: (leave empty)
4. **Save**

### Update Login Request to Save Token

1. **Open** "Login - Valid Credentials" request
2. **Go to** "Tests" tab
3. **Add this script**:
   ```javascript
   // Parse response
   var jsonData = pm.response.json();
   
   // Save token to collection variable
   if (jsonData.success && jsonData.data.token) {
       pm.collectionVariables.set("auth_token", jsonData.data.token);
       console.log("Token saved:", jsonData.data.token);
   }
   ```
4. **Save**

### Use Token Variable in Protected Requests

1. **Open** "Get Current User" request
2. **Authorization** tab → Bearer Token
3. **Token**: `{{auth_token}}`
4. **Save**

Now when you login, the token is automatically saved and used!

---

## Step 9: Import as Postman Collection (Quick Setup)

Create a file `MediGuard-Auth.postman_collection.json`:

```json
{
  "info": {
    "name": "MediGuard FastAPI Auth",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8001/api/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8001",
          "path": ["api", "health"]
        }
      }
    },
    {
      "name": "Signup",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"SecurePass123\"\n}"
        },
        "url": {
          "raw": "http://localhost:8001/api/auth/signup",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8001",
          "path": ["api", "auth", "signup"]
        }
      }
    },
    {
      "name": "Login",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "var jsonData = pm.response.json();",
              "if (jsonData.success && jsonData.data.token) {",
              "    pm.collectionVariables.set(\"auth_token\", jsonData.data.token);",
              "}"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john.doe@example.com\",\n  \"password\": \"SecurePass123\"\n}"
        },
        "url": {
          "raw": "http://localhost:8001/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8001",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "Get Current User",
      "request": {
        "method": "GET",
        "header": [],
        "auth": {
          "type": "bearer",
          "bearer": [
            {
              "key": "token",
              "value": "{{auth_token}}",
              "type": "string"
            }
          ]
        },
        "url": {
          "raw": "http://localhost:8001/api/auth/me",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8001",
          "path": ["api", "auth", "me"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "auth_token",
      "value": ""
    }
  ]
}
```

**To Import:**
1. Open Postman
2. Click **Import**
3. Drag and drop the JSON file
4. Collection is ready to use!

---

## Testing Workflow

### Quick Test Sequence:

1. ✅ **Health Check** → Verify service is running
2. ✅ **Signup** → Create a new user (use unique email)
3. ✅ **Login** → Get authentication token
4. ✅ **Get Current User** → Test protected endpoint

### Complete Test Sequence:

1. Health Check
2. Signup - Valid User
3. Signup - Weak Password (should fail)
4. Signup - Invalid Email (should fail)
5. Signup - Duplicate Email (should fail)
6. Login - Valid Credentials
7. Login - Invalid Password (should fail)
8. Login - Non-existent User (should fail)
9. Get Current User - Valid Token
10. Get Current User - No Token (should fail)
11. Get Current User - Invalid Token (should fail)

---

## Tips for Testing

### 1. Use Environment Variables

Create an environment for different setups:

**Postman → Environments → Create New**

Variables:
- `base_url`: `http://localhost:8001`
- `auth_token`: (set automatically via tests)

Then use in requests:
- URL: `{{base_url}}/api/auth/signup`

### 2. Use Pre-request Scripts

Generate unique emails:

```javascript
// In Pre-request Script tab
const timestamp = Date.now();
pm.variables.set("unique_email", `test${timestamp}@example.com`);
```

Then in body:
```json
{
  "email": "{{unique_email}}"
}
```

### 3. Add Tests for Validation

In the "Tests" tab:

```javascript
// Test status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test response structure
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

// Test token exists
pm.test("Token is present", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('token');
    pm.expect(jsonData.data.token).to.be.a('string');
});
```

### 4. Run Collection

Run all requests at once:

1. Click **...** on collection
2. Click **Run collection**
3. Select all requests
4. Click **Run MediGuard FastAPI Auth**
5. View results summary

---

## Troubleshooting

### Issue: Connection Refused

**Solution**: Ensure FastAPI service is running
```powershell
cd backend\auth_service
python main.py
```

### Issue: 404 Not Found

**Check**:
- URL is correct: `http://localhost:8001`
- Path is correct: `/api/auth/signup`
- Service is running

### Issue: Token Not Working

**Check**:
- Authorization header format: `Bearer <token>`
- Token is not expired
- JWT_SECRET is configured

### Issue: Validation Errors

**Check**:
- Content-Type header is `application/json`
- Body is valid JSON
- Required fields are present

---

## Video Tutorial Alternative

If you prefer visual learning:

1. Start the service
2. Visit: `http://localhost:8001/docs`
3. Use the **interactive Swagger UI**
4. Click "Try it out" on any endpoint
5. Fill in the parameters
6. Click "Execute"

Swagger UI is often easier than Postman for initial testing!

---

## Next Steps

After testing with Postman:

1. ✅ Integrate with your frontend
2. ✅ Test token compatibility with Node.js backend
3. ✅ Run automated test suite: `python test_auth.py`
4. ✅ Deploy to production

---

**Happy Testing! 🚀**
