# Quick Start Guide - FastAPI Authentication Service

## 🚀 Get Started in 3 Minutes

### Step 1: Setup (1 minute)

```powershell
# Navigate to the auth service directory
cd backend\auth_service

# Run the startup script
.\start.ps1
```

The script will:
- ✅ Create a virtual environment
- ✅ Install all dependencies
- ✅ Copy .env.example to .env
- ✅ Start the service

### Step 2: Configure (30 seconds)

Edit `.env` file with your settings:

```env
MONGODB_URI=mongodb://localhost:27017/mediguard
JWT_SECRET=your-jwt-secret-from-nodejs-backend
JWT_EXPIRE=30d
AUTH_PORT=8001
CLIENT_URL=http://localhost:3000
```

**⚠️ IMPORTANT**: Use the **same JWT_SECRET** as your Node.js backend!

### Step 3: Test (30 seconds)

Open your browser:
- 📚 **API Docs**: http://localhost:8001/docs
- 🏥 **Health Check**: http://localhost:8001/api/health

Or run the test suite:

```powershell
python test_auth.py
```

---

## 📋 API Endpoints

### Health Check
```bash
GET http://localhost:8001/api/health
```

### Signup
```bash
POST http://localhost:8001/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Login
```bash
POST http://localhost:8001/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User (Protected)
```bash
GET http://localhost:8001/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🎯 Integration with Frontend

Update your frontend API configuration:

```javascript
// config.js or similar
const AUTH_API_URL = 'http://localhost:8001';

// Login example
const login = async (email, password) => {
  const response = await fetch(`${AUTH_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data;
  }
  
  throw new Error(data.message);
};

// Protected request example
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${AUTH_API_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  return data.data;
};
```

---

## 🐛 Troubleshooting

### Service won't start

```powershell
# Check if port 8001 is already in use
netstat -ano | findstr :8001

# If in use, kill the process or change port in .env
taskkill /PID <PID> /F
```

### MongoDB connection error

```
✗ Ensure MongoDB is running
✗ Check MONGODB_URI in .env
✗ Test connection: mongosh mongodb://localhost:27017
```

### JWT tokens not working

```
✗ Verify JWT_SECRET matches Node.js backend
✗ Check token format: "Bearer <token>"
✗ Ensure token hasn't expired
```

### CORS errors

```
✗ Update CLIENT_URL in .env
✗ Restart the service after changing .env
```

---

## 📖 Learn More

- 📄 **Full Documentation**: See `README.md`
- 🔄 **Migration Guide**: See `MIGRATION.md`
- 🌐 **Interactive API Docs**: http://localhost:8001/docs

---

## 🎉 Success Checklist

After setup, verify:

- [ ] Service starts without errors
- [ ] Health check returns 200 OK
- [ ] Can create new user (signup)
- [ ] Can login with credentials
- [ ] Token is returned
- [ ] Protected endpoint works with token
- [ ] Frontend can communicate with service

---

## 💡 Pro Tips

1. **Use the interactive docs** at `/docs` to test endpoints
2. **Run test_auth.py** to verify everything works
3. **Keep JWT_SECRET same** as Node.js for token compatibility
4. **Use environment variables** for configuration
5. **Check logs** in the terminal for debugging

---

## 🚀 Next Steps

1. ✅ Test all endpoints thoroughly
2. ✅ Update frontend to use new auth service
3. ✅ Monitor performance and logs
4. ✅ Consider deploying to production
5. ✅ Migrate other endpoints if needed

---

## 📞 Support

If you encounter issues:

1. Check the terminal logs for errors
2. Review the full `README.md` documentation
3. Test using the Swagger UI at `/docs`
4. Verify environment variables in `.env`
5. Run `test_auth.py` to identify issues

---

**🎊 You're all set! Your FastAPI authentication service is ready to use!**
