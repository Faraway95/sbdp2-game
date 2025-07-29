#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Fixed version of the application that should work
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db

if __name__ == '__main__':
    print("Starting FIXED Office Card Game on port 8000...")
    print("Access URL: http://localhost:8000")
    
    # Ensure the database is set up
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created/verified")
        except Exception as e:
            print(f"Database setup error: {e}")
    
    try:
        app.run(debug=True, host='0.0.0.0', port=8000)
    except Exception as e:
        print(f"Failed to start server: {e}")