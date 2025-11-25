"""
Test script for FastAPI Authentication Service
Run this after starting the FastAPI service to verify it's working correctly
"""

import requests
import json

BASE_URL = "http://localhost:8001"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def test_health_check():
    """Test health check endpoint"""
    print_info("Testing health check endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            print_success("Health check passed")
            return True
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to service. Is it running on port 8001?")
        return False
    except Exception as e:
        print_error(f"Health check error: {str(e)}")
        return False

def test_signup():
    """Test user signup"""
    print_info("Testing user signup...")
    
    # Test data
    user_data = {
        "name": "Test User",
        "email": f"test_{id(user_data)}@example.com",  # Unique email
        "password": "TestPass123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            if data.get("success") and data.get("data", {}).get("token"):
                print_success("Signup successful")
                print_info(f"User ID: {data['data']['_id']}")
                print_info(f"Token received: {data['data']['token'][:50]}...")
                return data["data"]["token"], user_data["email"]
            else:
                print_error("Signup response format incorrect")
                return None, None
        else:
            print_error(f"Signup failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return None, None
            
    except Exception as e:
        print_error(f"Signup error: {str(e)}")
        return None, None

def test_signup_validation():
    """Test signup validation"""
    print_info("Testing signup validation...")
    
    # Test weak password
    weak_password_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "weak"  # Too short, no uppercase, no number
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json=weak_password_data
        )
        
        if response.status_code == 422:  # Validation error
            print_success("Password validation working correctly")
            return True
        else:
            print_warning(f"Expected validation error, got status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Validation test error: {str(e)}")
        return False

def test_login(email, password="TestPass123"):
    """Test user login"""
    print_info("Testing user login...")
    
    credentials = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=credentials
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("data", {}).get("token"):
                print_success("Login successful")
                return data["data"]["token"]
            else:
                print_error("Login response format incorrect")
                return None
        else:
            print_error(f"Login failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        return None

def test_get_current_user(token):
    """Test getting current user with token"""
    print_info("Testing get current user endpoint...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("data"):
                print_success("Get current user successful")
                print_info(f"User: {data['data']['name']} ({data['data']['email']})")
                return True
            else:
                print_error("Get current user response format incorrect")
                return False
        else:
            print_error(f"Get current user failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Get current user error: {str(e)}")
        return False

def test_invalid_token():
    """Test with invalid token"""
    print_info("Testing invalid token handling...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        if response.status_code == 401:
            print_success("Invalid token correctly rejected")
            return True
        else:
            print_warning(f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Invalid token test error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("FastAPI Authentication Service - Test Suite")
    print("="*60 + "\n")
    
    results = []
    
    # Test 1: Health check
    results.append(("Health Check", test_health_check()))
    
    if not results[0][1]:
        print_error("\nService is not running. Please start it first:")
        print_info("  cd backend/auth_service")
        print_info("  python main.py")
        return
    
    print()
    
    # Test 2: Signup validation
    results.append(("Signup Validation", test_signup_validation()))
    print()
    
    # Test 3: Signup
    token, email = test_signup()
    results.append(("User Signup", token is not None))
    print()
    
    if token and email:
        # Test 4: Login
        login_token = test_login(email)
        results.append(("User Login", login_token is not None))
        print()
        
        if login_token:
            # Test 5: Get current user
            results.append(("Get Current User", test_get_current_user(login_token)))
            print()
    
    # Test 6: Invalid token
    results.append(("Invalid Token Handling", test_invalid_token()))
    print()
    
    # Summary
    print("="*60)
    print("Test Summary")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{status}{Colors.END} - {test_name}")
    
    print()
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print_success("All tests passed! 🎉")
    else:
        print_warning("Some tests failed. Check the output above for details.")
    
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
