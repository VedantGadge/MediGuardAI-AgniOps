from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
import time


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle authentication for protected routes
    """
    
    async def dispatch(self, request: Request, call_next):
        # Add request timing
        start_time = time.time()
        
        response = await call_next(request)
        
        # Add process time header
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple rate limiting middleware
    You may want to use a proper rate limiting library like slowapi
    """
    
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = {}
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host
        current_time = time.time()
        
        # Clean old entries
        self.clients = {
            ip: timestamps 
            for ip, timestamps in self.clients.items() 
            if any(t > current_time - self.period for t in timestamps)
        }
        
        # Check rate limit
        if client_ip in self.clients:
            timestamps = [t for t in self.clients[client_ip] if t > current_time - self.period]
            
            if len(timestamps) >= self.calls:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please try again later."
                )
            
            timestamps.append(current_time)
            self.clients[client_ip] = timestamps
        else:
            self.clients[client_ip] = [current_time]
        
        response = await call_next(request)
        return response
