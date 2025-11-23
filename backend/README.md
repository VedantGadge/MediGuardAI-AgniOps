# MediGuardAI Backend - Authentication API

This is the backend authentication system for MediGuardAI built with Node.js, Express, and MongoDB Atlas. 

## Features

- ✅ User Registration (Signup)
- ✅ User Login
- ✅ Password Hashing with bcrypt
- ✅ JWT Token Authentication
- ✅ Input Validation
- ✅ Security Headers (Helmet)
- ✅ Rate Limiting
- ✅ CORS Support
- ✅ MongoDB Atlas Integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Rename `.env.example` to `.env`
   - Update the following variables in `.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_strong_random_secret_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

**Important:** Generate a strong JWT secret key. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and update `MONGODB_URI` in `.env`

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Authentication Routes

#### 1. User Signup
**POST** `/api/auth/signup`

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

**Validation Rules:**
- Name: Required, max 50 characters
- Email: Required, valid email format
- Password: Required, min 6 characters, must contain uppercase, lowercase, and number

#### 2. User Login
**POST** `/api/auth/login`

Request body:
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

#### 3. Health Check
**GET** `/api/health`

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-22T10:00:00.000Z"
}
```

## Protected Routes

To access protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Example using the auth middleware:
```javascript
const { protect, authorize } = require('./middleware/auth');

// Protected route (requires authentication)
router.get('/profile', protect, getProfile);

// Protected route (requires admin role)
router.get('/admin', protect, authorize('admin'), getAdminData);
```

## Security Features

1. **Password Hashing**: Uses bcryptjs with salt rounds of 10
2. **JWT Tokens**: Secure token-based authentication
3. **Helmet**: Sets various HTTP headers for security
4. **Rate Limiting**: 100 requests per 15 minutes per IP
5. **CORS**: Configured for cross-origin requests
6. **Input Validation**: Express-validator for request validation
7. **Password Requirements**: Enforces strong password policy

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   └── User.js            # User schema with password hashing
├── routes/
│   └── auth.js            # Authentication routes
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment variables
├── .gitignore            # Git ignore file
├── package.json          # Dependencies and scripts
├── server.js             # Main application file
└── README.md             # This file
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // Validation errors if applicable
}
```

## Testing with Postman/Thunder Client

1. **Signup**: POST to `http://localhost:5000/api/auth/signup`
2. **Login**: POST to `http://localhost:5000/api/auth/login`
3. Copy the token from the response
4. For protected routes, add header: `Authorization: Bearer <token>`

## Common Issues

1. **MongoDB Connection Error**: Check your MongoDB URI and network access in Atlas
2. **JWT Error**: Ensure JWT_SECRET is set in .env
3. **CORS Error**: Update CLIENT_URL in .env or cors configuration in server.js

## Next Steps

- Implement password reset functionality
- Add email verification
- Create user profile management routes
- Add refresh token mechanism
- Implement logout functionality with token blacklisting

## License

ISC
