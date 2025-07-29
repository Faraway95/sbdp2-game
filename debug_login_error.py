#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Debug the login error by simulating the request directly
"""

import app
import json
from unittest.mock import Mock

def debug_login():
    """Debug the login function directly"""
    print("Debugging login function...")
    
    with app.app.app_context():
        # Mock the request object
        mock_request = Mock()
        mock_request.is_json = True
        mock_request.get_json.return_value = {
            "username": "test",
            "password": "admin"
        }
        
        # Import the Flask app components we need
        from flask import Flask
        
        # Set up the mock in the Flask context
        app.app.config['TESTING'] = True
        client = app.app.test_client()
        
        try:
            # Test the start_game endpoint
            response = client.post('/api/start_game', 
                                 json={"username": "test", "password": "admin"},
                                 content_type='application/json')
            
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.get_data(as_text=True)}")
            
            if response.status_code == 500:
                print("500 Error detected - checking for specific issues...")
                
                # Check if database tables exist
                print("Checking database tables...")
                with app.app.app_context():
                    from sqlalchemy import inspect
                    inspector = inspect(app.db.engine)
                    tables = inspector.get_table_names()
                    print(f"Available tables: {tables}")
                    
                    if 'player' not in tables or 'game_session' not in tables:
                        print("Missing database tables - creating them...")
                        app.db.create_all()
                        print("Database tables created")
                        
                        # Try the request again
                        response = client.post('/api/start_game',
                                             json={"username": "test", "password": "admin"},
                                             content_type='application/json')
                        print(f"Retry response status: {response.status_code}")
                        print(f"Retry response data: {response.get_data(as_text=True)}")
            
        except Exception as e:
            print(f"Error during debug: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    debug_login()