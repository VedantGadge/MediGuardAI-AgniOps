# MongoDB SSL/TLS Connection Fix for Hugging Face

## Problem

When deploying to Hugging Face Spaces, you may encounter SSL handshake errors:

```
SSL handshake failed: [SSL: TLSV1_ALERT_INTERNAL_ERROR] tlsv1 alert internal error
```

This happens because Hugging Face's Docker environment has SSL/TLS compatibility issues with MongoDB Atlas.

## Solutions Applied

### 1. Updated MongoDB Connection Code

Modified `app.py` to include SSL/TLS compatibility parameters:

```python
mongodb_client = AsyncIOMotorClient(
    MONGODB_URI,
    tls=True,
    tlsAllowInvalidCertificates=True,  # Required for Hugging Face
    serverSelectionTimeoutMS=30000,
    connectTimeoutMS=30000,
    socketTimeoutMS=30000,
    maxPoolSize=10,
    minPoolSize=1,
    retryWrites=True,
    w='majority'
)
```

### 2. Added SSL/TLS Dependencies

Added to `requirements.txt`:
```
certifi==2024.2.2
pyopenssl==24.0.0
```

### 3. Updated MongoDB URI Format

In your Hugging Face Space Secrets, use this format:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&tls=true
```

## For Hugging Face Deployment

### Option A: Use Environment Variable (Recommended)

In your Hugging Face Space:
1. Go to Settings → Variables and secrets
2. Update `MONGODB_URI` to include `&tls=true`:

```
mongodb+srv://yashcric80803_db_user:KYPws1Lzb1A0SOrn@cluster0.zkpwbf0.mongodb.net/?retryWrites=true&w=majority&tls=true
```

### Option B: Alternative - Use srv_max_connection_pool

If Option A doesn't work, try this connection string format:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true
```

## Verification Steps

1. **Push the updated code** to Hugging Face
2. **Wait for rebuild** (3-5 minutes)
3. **Check logs** - You should see:
   ```
   MongoDB Connected successfully!
   ```
4. **Test the endpoints** at `/docs`

## If Still Not Working

### Try MongoDB Atlas Configuration Changes:

1. **Network Access**:
   - Go to MongoDB Atlas
   - Network Access → Add IP Address
   - Enter: `0.0.0.0/0` (Allow from anywhere)
   - Confirm

2. **Database User Permissions**:
   - Database Access → Edit user
   - Role: "Read and write to any database"
   - Update User

3. **Connection String Format**:
   Try removing special characters from password or regenerate password without special characters.

### Alternative: Use Standard MongoDB URI

If srv connection fails, try standard format (not recommended for production):

```
mongodb://username:password@host1:27017,host2:27017,host3:27017/database?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

## Testing Locally First

Before deploying, test locally:

```powershell
cd D:\MediGuardAI\MediGuardAI-AgniOps\backend\ML\huggingface-deployment
python app.py
```

If it works locally but fails on Hugging Face, the issue is environment-specific.

## Common Errors and Solutions

### Error: `SSL: CERTIFICATE_VERIFY_FAILED`
**Solution**: Set `tlsAllowInvalidCertificates=True` (already applied)

### Error: `SSL: TLSV1_ALERT_INTERNAL_ERROR`
**Solution**: 
- Add `tls=true` to connection string
- Ensure certifi and pyopenssl are installed (already added)

### Error: `ServerSelectionTimeoutError`
**Solution**:
- Increase timeout values (already set to 30000ms)
- Check MongoDB Atlas network access whitelist

### Error: `Authentication failed`
**Solution**:
- Verify username and password are correct
- Check database user has proper permissions
- Ensure password special characters are URL-encoded

## URL Encoding Special Characters

If your password contains special characters, encode them:

| Character | Encoded |
|-----------|---------|
| @ | %40 |
| # | %23 |
| $ | %24 |
| % | %25 |
| ^ | %5E |
| & | %26 |
| * | %2A |

Example:
```
Password: Pass@123
Encoded: Pass%40123
```

## Final Connection String Template

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority&tls=true
```

Replace:
- `USERNAME` - Your MongoDB Atlas username
- `PASSWORD` - Your password (URL-encoded if it has special characters)
- `CLUSTER` - Your cluster address (e.g., cluster0.xxxxx)
- `DATABASE` - Database name (optional, defaults to "test")

## Summary of Changes Made

✅ Added SSL/TLS parameters to MongoDB client initialization  
✅ Added fallback connection mechanism  
✅ Installed certifi and pyopenssl for SSL handling  
✅ Updated connection string format with `tls=true`  
✅ Increased timeout values for better reliability  

## After Deployment

1. Monitor Hugging Face logs for "MongoDB Connected successfully!"
2. Test auth endpoints at `/docs`
3. Check if signup/login work properly
4. Verify data is being stored in MongoDB Atlas

If you continue to experience issues, consider:
- Using MongoDB's free tier with less restrictive SSL requirements
- Contacting Hugging Face support about SSL/TLS configuration
- Using an alternative database like PostgreSQL with Supabase (which has better Hugging Face compatibility)
