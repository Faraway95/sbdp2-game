#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test connectivity to port 8000
"""

import urllib.request
import urllib.parse
import json

def test_get(url, description):
    """Test a GET request"""
    print(f"Testing: {description}")
    print(f"URL: {url}")
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            status = response.status
            content_type = response.headers.get('content-type', 'Unknown')
            
            print(f"Status: {status}")
            print(f"Content-Type: {content_type}")
            
            if status == 200:
                print("[OK] Request successful")
                return True
            else:
                print(f"[ERROR] HTTP {status}")
                return False
                
    except urllib.error.URLError as e:
        if hasattr(e, 'code'):
            print(f"[ERROR] HTTP {e.code}")
        else:
            print(f"[ERROR] Connection error: {e.reason}")
        return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False
    
    print("-" * 40)

def test_post_login():
    """Test the login API"""
    print("Testing Login API")
    url = "http://localhost:8000/api/start_game"
    
    login_data = {
        "username": "test",
        "password": "admin"
    }
    
    try:
        data = json.dumps(login_data).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            content_type = response.headers.get('content-type', 'Unknown')
            content = response.read().decode('utf-8')
            
            print(f"Status: {status}")
            print(f"Content-Type: {content_type}")
            
            if content_type.startswith('application/json'):
                try:
                    response_data = json.loads(content)
                    print(f"Response: {response_data}")
                    if response_data.get('success'):
                        print("[OK] Login API working correctly")
                        return True
                    else:
                        print(f"[WARNING] Login failed: {response_data.get('error', 'Unknown')}")
                        return False
                except json.JSONDecodeError as e:
                    print(f"[ERROR] JSON decode error: {e}")
                    return False
            else:
                print("[ERROR] Response is not JSON")
                return False
                
    except urllib.error.URLError as e:
        if hasattr(e, 'code'):
            print(f"[ERROR] HTTP {e.code}")
        else:
            print(f"[ERROR] Connection error: {e.reason}")
        return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False
    
    print("-" * 40)

if __name__ == "__main__":
    print("Testing application on port 8000...")
    print("=" * 50)
    
    # Test basic endpoints
    home_ok = test_get("http://localhost:8000", "Home page")
    api_ok = test_get("http://localhost:8000/api/test", "Test API endpoint")
    
    # Test login API
    login_ok = test_post_login()
    
    print("=" * 50)
    print("SUMMARY:")
    print(f"Home page: {'OK' if home_ok else 'FAILED'}")
    print(f"Test API: {'OK' if api_ok else 'FAILED'}")
    print(f"Login API: {'OK' if login_ok else 'FAILED'}")
    
    if all([home_ok, api_ok, login_ok]):
        print("")
        print("SUCCESS: All tests passed!")
        print("The application is working correctly on port 8000.")
        print("Access the game at: http://localhost:8000")
    else:
        print("")
        print("Some tests failed. Check the errors above.")