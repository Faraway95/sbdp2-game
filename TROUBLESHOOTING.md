# 访问问题故障排除指南

## 🔍 当前状态检查

根据测试结果，服务器组件本身是正常的：
- ✅ 所有依赖包正常导入
- ✅ Flask路由配置正确
- ✅ 数据库初始化成功
- ✅ 应用可以正常启动
- ✅ 端口5000可用

## 🚀 启动服务器

### 方法1: 启动完整应用
```bash
cd D:\SBDP2
python app.py
```

### 方法2: 启动测试服务器（如果主应用有问题）
```bash
cd D:\SBDP2
python test_server.py
```

## 🌐 访问测试步骤

### 1. 确认服务器启动
启动后应该看到类似输出：
```
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5000
* Running on http://10.86.80.93:5000
```

### 2. 测试基本连接
在浏览器中访问以下URL：

#### 主页面
- http://localhost:5000
- http://127.0.0.1:5000

#### API健康检查
- http://localhost:5000/api/test

#### 测试页面
- http://localhost:5000/test

### 3. 如果无法访问，尝试不同端口
```bash
# 尝试端口8000
python -c "
import app
app.app.run(debug=True, host='0.0.0.0', port=8000)
"
```
然后访问 http://localhost:8000

## 🔧 常见问题解决

### 问题1: "This site can't be reached" 或连接被拒绝

**可能原因和解决方案：**

1. **防火墙阻止**
   ```bash
   # Windows防火墙设置
   # 控制面板 > 系统和安全 > Windows Defender防火墙 > 允许应用通过防火墙
   # 添加Python.exe到允许列表
   ```

2. **端口被占用**
   ```bash
   # 检查端口使用情况
   netstat -ano | findstr :5000
   ```

3. **localhost解析问题**
   - 尝试使用 127.0.0.1:5000 而不是 localhost:5000
   - 检查 hosts 文件：C:\Windows\System32\drivers\etc\hosts

### 问题2: 页面加载但显示错误

**调试步骤：**
1. 按F12打开开发者工具
2. 查看Console标签的错误信息
3. 查看Network标签的请求状态

### 问题3: API请求失败

**测试API：**
```javascript
// 在浏览器控制台中运行
fetch('/api/test')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## 🛠️ 高级调试

### 1. 使用不同的浏览器
- Chrome
- Firefox  
- Edge
- 或者无痕模式

### 2. 清除浏览器缓存
- Ctrl+F5 强制刷新
- 或清除浏览器缓存和Cookie

### 3. 检查网络设置
- 确保没有使用代理
- 检查VPN是否影响本地连接

### 4. 使用curl测试（如果有的话）
```bash
curl http://localhost:5000
curl http://localhost:5000/api/test
```

## 📋 收集调试信息

如果问题仍然存在，请收集以下信息：

### 1. 服务器启动日志
完整的Python控制台输出

### 2. 浏览器错误信息
- 地址栏显示的确切URL
- 浏览器错误页面的完整截图
- 开发者工具Console的错误信息

### 3. 系统信息
- 操作系统版本
- Python版本
- 浏览器版本
- 是否使用杀毒软件或防火墙

### 4. 网络环境
- 是否在企业网络环境
- 是否使用VPN或代理

## 🔄 重置方案

如果所有方法都失败，尝试重置：

### 1. 重启Python进程
关闭所有Python进程，重新启动

### 2. 更换端口
```python
# 在app.py最后一行修改
app.run(debug=True, host='0.0.0.0', port=8080)
```

### 3. 最小化测试
使用提供的test_server.py进行最基本的连接测试

## 📞 获取帮助

如果以上步骤都无法解决问题，请提供：
1. 完整的错误截图
2. 服务器启动日志
3. 浏览器开发者工具的错误信息
4. 尝试过的解决步骤

我们将根据具体情况提供针对性的解决方案。