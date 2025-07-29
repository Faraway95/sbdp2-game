#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test connectivity to the running Flask application
"""

import requests
import json

def test_url(url, description):
    """Test a URL and print results"""
    print(f"Testing: {description}")
    print(f"URL: {url}")
    try:
        response = requests.get(url, timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'Unknown')}")
        
        if response.status_code == 200:
            content = response.text[:200]  # First 200 chars
            print(f"Content preview: {content}")
            print("[OK] Request successful")
        else:
            print(f"[ERROR] HTTP {response.status_code}")
        
    except requests.exceptions.ConnectionError:
        print("[ERROR] Connection refused - server may not be running")
    except requests.exceptions.Timeout:
        print("[ERROR] Request timed out")
    except Exception as e:
        print(f"[ERROR] {e}")
    
    print("-" * 50)

def test_login_api():
    """Test the login API specifically"""
    print("Testing Login API")
    url = "http://localhost:5000/api/start_game"
    
    login_data = {
        "username": "test",
        "password": "admin"
    }
    
    try:
        response = requests.post(
            url, 
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'Unknown')}")
        print(f"Response text: {response.text}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                data = response.json()
                print(f"JSON data: {data}")
                if data.get('success'):
                    print("[OK] Login API working correctly")
                else:
                    print(f"[WARNING] Login failed: {data.get('error', 'Unknown error')}")
            except json.JSONDecodeError as e:
                print(f"[ERROR] JSON decode error: {e}")
        else:
            print("[ERROR] Response is not JSON")
            
    except Exception as e:
        print(f"[ERROR] {e}")
    
    print("-" * 50)

if __name__ == "__main__":
    print("Starting connectivity tests...")
    print("=" * 50)
    
    # Test basic pages
    test_url("http://localhost:5000", "Home page")
    test_url("http://localhost:5000/api/test", "Test API endpoint")
    test_url("http://localhost:5000/test", "Test page")
    
    # Test login API
    test_login_api()
    
    print("Connectivity tests completed.")