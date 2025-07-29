/**
 * 主页面JavaScript - 登录和菜单逻辑
 * 上班打牌！肉鸽版
 */

let gameData = {
    player: null,
    sessionId: null
};

// 页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 上班打牌！肉鸽版 已启动');
    
    // 检查是否有保存的用户信息
    const savedPlayer = localStorage.getItem('sbdp2_player');
    if (savedPlayer) {
        const player = JSON.parse(savedPlayer);
        document.getElementById('username').value = player.username;
    }
});

/**
 * 开始游戏 - 登录流程
 */
async function startGame() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username) {
        showNotification('请输入您的员工工号', 'error');
        return;
    }
    
    if (!password) {
        showNotification('请输入系统密码', 'error');
        return;
    }
    
    // 显示加载状态
    const loginButton = document.querySelector('.btn-primary');
    const originalText = loginButton.innerHTML;
    loginButton.innerHTML = '<div class="loading-spinner"></div>正在验证身份...';
    loginButton.disabled = true;
    
    try {
        const response = await fetch('/api/start_game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: username,
                password: password 
            })
        });
        
        // 检查响应是否成功
        if (!response.ok) {
            // 尝试解析错误响应
            const errorResponseText = await response.text();
            console.log('错误响应文本:', errorResponseText); // 调试信息
            
            let errorData;
            try {
                errorData = JSON.parse(errorResponseText);
            } catch (jsonError) {
                // 如果不是JSON响应，使用状态文本
                console.error('错误响应JSON解析失败:', jsonError);
                throw new Error(`HTTP ${response.status}: ${response.statusText}. 响应: ${errorResponseText}`);
            }
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        // 解析成功响应
        let data;
        const responseText = await response.text();
        console.log('服务器响应:', responseText); // 调试信息
        
        try {
            data = JSON.parse(responseText);
        } catch (jsonError) {
            console.error('JSON解析错误:', jsonError);
            console.error('响应文本:', responseText);
            console.error('响应文本长度:', responseText.length);
            console.error('响应文本前100字符:', responseText.substring(0, 100));
            throw new Error(`服务器响应格式错误: ${jsonError.message}`);
        }
        
        if (data.success) {
            // 保存游戏数据
            gameData.player = data.player;
            gameData.sessionId = data.session_id;
            
            // 保存到本地存储
            localStorage.setItem('sbdp2_player', JSON.stringify(data.player));
            
            // 显示主菜单
            showMainMenu();
            
            showNotification(`身份验证成功！欢迎回来，${data.player.username}！`, 'success');
        } else {
            throw new Error(data.error || '登录失败');
        }
    } catch (error) {
        console.error('登录错误:', error);
        // 显示具体的错误信息
        let errorMessage = '身份验证失败，请检查工号和密码';
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage = '网络连接失败，请检查服务器是否启动';
        } else if (error.message.includes('JSON')) {
            errorMessage = '服务器响应异常，请重试';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        // 恢复按钮状态
        loginButton.innerHTML = originalText;
        loginButton.disabled = false;
    }
}

/**
 * 显示主菜单
 */
function showMainMenu() {
    const loginPanel = document.getElementById('loginPanel');
    const mainMenu = document.getElementById('mainMenu');
    
    // 更新玩家信息显示
    if (gameData.player) {
        document.getElementById('playerName').textContent = gameData.player.username;
        document.getElementById('playerLevel').textContent = gameData.player.level;
    }
    
    // 切换界面
    loginPanel.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    
    // 添加渐入动画
    mainMenu.style.opacity = '0';
    setTimeout(() => {
        mainMenu.style.transition = 'opacity 0.5s ease';
        mainMenu.style.opacity = '1';
    }, 100);
}

/**
 * 进入游戏
 */
function enterGame() {
    if (!gameData.sessionId) {
        showNotification('请先登录', 'error');
        return;
    }
    
    // 跳转到游戏页面
    window.location.href = '/game';
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 监听回车键登录
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const loginPanel = document.getElementById('loginPanel');
        if (!loginPanel.classList.contains('hidden')) {
            startGame();
        }
    }
});

// 监听密码字段的回车键
document.addEventListener('DOMContentLoaded', function() {
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                startGame();
            }
        });
    }
});

// 添加一些职场风格的随机标语
const corporateMessages = [
    "今天又是充满挑战的一天呢... 🫠",
    "让我们用数据驱动决策！ 📊",
    "记住，没有最卷，只有更卷 💪",
    "工作使我快乐，加班使我更快乐 😄",
    "让我们赋能业务，实现增长闭环 🔄",
    "今天你PUA了吗？ 😊"
];

// 页面加载时随机显示标语
window.addEventListener('load', function() {
    setTimeout(() => {
        const randomMessage = corporateMessages[Math.floor(Math.random() * corporateMessages.length)];
        const disclaimerFlavor = document.querySelector('.disclaimer .flavor-text');
        if (disclaimerFlavor) {
            disclaimerFlavor.textContent = randomMessage;
        }
    }, 2000);
});

// 添加CSS动画样式
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        background: #10B981;
    }
    
    .notification-error {
        background: #EF4444;
    }
    
    .notification-info {
        background: #3B82F6;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);