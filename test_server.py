#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
最小测试服务器 - 用于调试访问问题
"""

from flask import Flask, jsonify, request, render_template_string

app = Flask(__name__)

# 简单的HTML模板
SIMPLE_HTML = '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>测试服务器</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .form-group { margin: 10px 0; }
        input, button { padding: 10px; margin: 5px; }
        .result { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>服务器访问测试</h1>
    <p>如果你能看到这个页面，说明Flask服务器正常工作</p>
    
    <h2>API测试</h2>
    <div class="form-group">
        <input type="text" id="username" placeholder="用户名" value="test">
        <input type="password" id="password" placeholder="密码" value="admin">
        <button onclick="testLogin()">测试登录API</button>
    </div>
    
    <div id="result" class="result">点击按钮测试API...</div>
    
    <script>
        async function testLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const resultDiv = document.getElementById('result');
            
            try {
                console.log('发送请求:', {username, password});
                
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({username, password})
                });
                
                console.log('响应状态:', response.status);
                const responseText = await response.text();
                console.log('响应内容:', responseText);
                
                resultDiv.innerHTML = `
                    <h3>响应结果:</h3>
                    <p><strong>状态:</strong> ${response.status}</p>
                    <p><strong>内容:</strong></p>
                    <pre>${responseText}</pre>
                `;
                
            } catch (error) {
                console.error('请求错误:', error);
                resultDiv.innerHTML = `
                    <h3>请求失败:</h3>
                    <p style="color: red;">${error.message}</p>
                `;
            }
        }
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(SIMPLE_HTML)

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username', '')
        password = data.get('password', '')
        
        print(f"收到登录请求: username={username}, password={password}")
        
        # 简单验证
        valid_passwords = ['admin', '123456', 'password']
        if password in valid_passwords:
            return jsonify({
                'success': True,
                'message': '登录成功',
                'username': username
            })
        else:
            return jsonify({
                'success': False,
                'error': '密码错误'
            }), 401
            
    except Exception as e:
        print(f"登录错误: {e}")
        return jsonify({
            'success': False,
            'error': f'服务器错误: {str(e)}'
        }), 500

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running'
    })

if __name__ == '__main__':
    print("Starting test server...")
    print("Access URL: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    app.run(debug=True, host='0.0.0.0', port=5000)