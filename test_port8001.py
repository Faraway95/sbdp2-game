#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test connectivity to port 8001 simple app
"""

import urllib.request
import urllib.parse
import json

def test_post_login():
    """Test the simple login API"""
    print("Testing Simple Login API on port 8001")
    url = "http://localhost:8001/api/start_game"
    
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
                        print("[OK] Simple Login API working correctly")
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
                
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

if __name__ == "__main__":
    test_post_login()