# Unexpected Token 错误调试指南

## 🔍 问题诊断

"Unexpected token" 错误通常发生在以下情况：
1. 服务器返回的不是有效的JSON格式
2. 响应被截断或损坏
3. 服务器返回HTML错误页面而不是JSON
4. 网络请求失败但返回了错误页面

## 🛠️ 调试步骤

### 1. 重启服务器
```bash
cd D:\SBDP2
python app.py
```

### 2. 测试方法

#### 方法A: 使用浏览器开发者工具
1. 打开 http://localhost:5000
2. 按F12打开开发者工具
3. 切换到"Console"标签
4. 输入账号密码并尝试登录
5. 查看控制台输出的调试信息

#### 方法B: 使用测试页面
1. 访问 http://localhost:5000/test
2. 点击"测试API连接"按钮
3. 点击"测试登录"按钮
4. 查看详细的错误信息

### 3. 查看调试信息

现在的JavaScript会输出以下调试信息：
- `服务器响应: [响应文本]`
- `错误响应文本: [错误内容]`
- `JSON解析错误: [具体错误]`

### 4. 常见问题和解决方案

#### 问题1: 服务器返回HTML而不是JSON
**症状**: 控制台显示响应内容以`<!DOCTYPE html>`开头
**解决**: 检查Flask路由是否正确，确保API路径正确

#### 问题2: 响应被截断
**症状**: 响应文本不完整或突然结束
**解决**: 检查服务器是否有异常，查看Flask控制台输出

#### 问题3: 网络请求失败
**症状**: 显示"Failed to fetch"错误
**解决**: 确保Flask服务器正在运行在 http://localhost:5000

#### 问题4: CORS问题
**症状**: 浏览器控制台显示CORS相关错误
**解决**: 在Flask中添加CORS支持

## 🧪 测试用例

### 有效的登录数据
```javascript
{
    "username": "test",
    "password": "admin"
}
```

### 预期的成功响应
```json
{
    "success": true,
    "session_id": "uuid-string",
    "player": {
        "username": "test",
        "level": 1,
        "experience": 0
    }
}
```

### 预期的错误响应
```json
{
    "success": false,
    "error": "密码错误，请联系系统管理员"
}
```

## 🔧 临时修复方案

如果问题仍然存在，可以尝试以下临时修复：

### 1. 添加CORS支持
在 `app.py` 的顶部添加：
```python
from flask_cors import CORS
CORS(app)
```

### 2. 强制JSON响应
确保所有API响应都设置正确的Content-Type：
```python
response = jsonify(data)
response.headers['Content-Type'] = 'application/json'
return response
```

### 3. 使用备用登录方法
创建一个简化的登录函数：
```javascript
async function simpleLogin() {
    try {
        const response = await fetch('/api/start_game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"username":"test","password":"admin"}'
        });
        const text = await response.text();
        console.log('Raw response:', text);
        const data = JSON.parse(text);
        console.log('Parsed data:', data);
    } catch (e) {
        console.error('Error:', e);
    }
}
```

## 📝 报告问题

如果上述方法都无法解决问题，请提供以下信息：
1. 浏览器控制台的完整错误信息
2. Flask服务器控制台的输出
3. 使用的浏览器和版本
4. 网络环境（是否使用代理等）

完成调试后，我们可以移除这些调试语句并部署最终版本。