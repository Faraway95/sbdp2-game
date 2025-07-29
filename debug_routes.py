#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Debug script to check available routes
"""

import app

def list_routes():
    """List all available routes in the Flask app"""
    print("Available routes in Flask application:")
    print("=" * 50)
    
    with app.app.app_context():
        for rule in app.app.url_map.iter_rules():
            methods = ', '.join(rule.methods - {'HEAD', 'OPTIONS'})
            print(f"{rule.rule:<30} | {methods}")
    
    print("=" * 50)
    print(f"Total routes: {len(list(app.app.url_map.iter_rules()))}")

if __name__ == "__main__":
    list_routes()