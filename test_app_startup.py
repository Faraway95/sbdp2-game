#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test script to verify main application startup
"""

try:
    print("1. Testing imports...")
    import app
    print("   [OK] App imports successfully")
    
    print("2. Testing Flask app creation...")
    flask_app = app.app
    print("   [OK] Flask app created")
    
    print("3. Testing database initialization...")
    with flask_app.app_context():
        app.db.create_all()
    print("   [OK] Database initialized successfully")
    
    print("4. Testing basic route setup...")
    routes = [str(rule) for rule in flask_app.url_map.iter_rules()]
    print(f"   [OK] Found {len(routes)} routes")
    
    print("5. Testing dependencies...")
    from flask import Flask, render_template, request, jsonify, session
    from flask_sqlalchemy import SQLAlchemy
    from flask_cors import CORS
    import json, random, uuid
    from datetime import datetime
    from game_data import CARDS, ENEMIES, RELICS, PROJECT_STAGES, GameLogic
    print("   [OK] All dependencies available")
    
    print("")
    print("SUCCESS: Main application is ready to start!")
    print("Run: python app.py")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()