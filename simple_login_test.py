#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Simple Flask app to test login without game_data
"""

from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
import uuid
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'test_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test_login.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    level = db.Column(db.Integer, default=1)
    experience = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@app.route('/')
def index():
    return '<h1>Simple Login Test</h1><p>Access <a href="/test">test page</a></p>'

@app.route('/test')
def test_page():
    return '''
    <!DOCTYPE html>
    <html>
    <head><title>Login Test</title></head>
    <body>
        <h1>Login Test</h1>
        <button onclick="testLogin()">Test Login</button>
        <div id="result"></div>
        <script>
        async function testLogin() {
            try {
                const response = await fetch('/api/start_game', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username: 'test', password: 'admin'})
                });
                const text = await response.text();
                document.getElementById('result').innerHTML = '<pre>' + text + '</pre>';
            } catch (e) {
                document.getElementById('result').innerHTML = 'Error: ' + e.message;
            }
        }
        </script>
    </body>
    </html>
    '''

@app.route('/api/start_game', methods=['POST'])
def start_game():
    try:
        if not request.is_json:
            return jsonify({'success': False, 'error': 'Invalid request format, JSON required'}), 400
        
        data = request.get_json(force=True)
        if not data:
            return jsonify({'success': False, 'error': 'Invalid request data'}), 400
            
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        print(f"Login attempt - user: {username}, password: {password}")
        
        if not username:
            return jsonify({'success': False, 'error': 'Please enter employee ID'}), 400
            
        if not password:
            return jsonify({'success': False, 'error': 'Please enter password'}), 400
        
        # Simple password validation
        valid_passwords = ['123456', 'admin', 'password', '666666', '888888', 'project']
        if password not in valid_passwords:
            return jsonify({'success': False, 'error': 'Password incorrect, please contact system administrator'}), 401
        
        # Create or get player
        player = Player.query.filter_by(username=username).first()
        if not player:
            player = Player(username=username)
            db.session.add(player)
            db.session.flush()
        
        session_id = str(uuid.uuid4())
        session['game_session_id'] = session_id
        
        response_data = {
            'success': True,
            'session_id': session_id,
            'player': {
                'username': player.username,
                'level': player.level,
                'experience': player.experience
            }
        }
        
        print(f"Login success - response: {response_data}")
        db.session.commit()
        return jsonify(response_data)
        
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        print(f"Login error: {error_msg}")
        return jsonify({'success': False, 'error': f'System error: {error_msg}'}), 500

if __name__ == '__main__':
    print("Starting Simple Login Test on port 8001...")
    print("Access URL: http://localhost:8001")
    
    with app.app_context():
        db.create_all()
        print("Database initialized")
    
    app.run(debug=True, host='0.0.0.0', port=8001)