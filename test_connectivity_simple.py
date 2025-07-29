#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Simple connectivity test using built-in modules
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
            content = response.read().decode('utf-8')
            
            print(f"Status: {status}")
            print(f"Content-Type: {content_type}")
            
            if status == 200:
                preview = content[:200] if len(content) > 200 else content
                print(f"Content preview: {preview}")
                print("[OK] Request successful")
            else:
                print(f"[ERROR] HTTP {status}")
                
    except urllib.error.URLError as e:
        if hasattr(e, 'code'):
            print(f"[ERROR] HTTP {e.code}")
        else:
            print(f"[ERROR] Connection error: {e.reason}")
    except Exception as e:
        print(f"[ERROR] {e}")
    
    print("-" * 50)

def test_post_login():
    """Test the login API"""
    print("Testing Login API")
    url = "http://localhost:5000/api/start_game"
    
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
            print(f"Response: {content}")
            
            if content_type.startswith('application/json'):
                try:
                    response_data = json.loads(content)
                    if response_data.get('success'):
                        print("[OK] Login API working correctly")
                    else:
                        print(f"[WARNING] Login failed: {response_data.get('error', 'Unknown')}")
                except json.JSONDecodeError as e:
                    print(f"[ERROR] JSON decode error: {e}")
            else:
                print("[ERROR] Response is not JSON")
                
    except urllib.error.URLError as e:
        if hasattr(e, 'code'):
            print(f"[ERROR] HTTP {e.code}")
        else:
            print(f"[ERROR] Connection error: {e.reason}")
    except Exception as e:
        print(f"[ERROR] {e}")
    
    print("-" * 50)

if __name__ == "__main__":
    print("Starting simple connectivity tests...")
    print("=" * 50)
    
    # Test basic endpoints
    test_get("http://localhost:5000", "Home page")
    test_get("http://localhost:5000/api/test", "Test API endpoint")
    test_get("http://localhost:5000/test", "Test page")
    
    # Test login API
    test_post_login()
    
    print("Simple connectivity tests completed.")
    print("")
    print("NEXT STEPS:")
    print("1. If all tests show [OK], the server is working correctly")
    print("2. Try accessing http://localhost:5000 in your browser")
    print("3. If browser still shows issues, try clearing cache/cookies")
    print("4. Try using a different browser or incognito mode")