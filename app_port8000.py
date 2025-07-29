#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Main application running on port 8000 to avoid conflicts
"""

from app import app, db

if __name__ == '__main__':
    print("Starting Office Card Game on port 8000...")
    print("Access URL: http://localhost:8000")
    
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, host='0.0.0.0', port=8000)