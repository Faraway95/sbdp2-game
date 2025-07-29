// 简单的登录测试脚本
async function debugLogin() {
    console.log('开始调试登录...');
    
    const testData = {
        username: 'test',
        password: 'admin'
    };
    
    try {
        console.log('发送请求数据:', testData);
        
        const response = await fetch('http://localhost:5000/api/start_game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('响应状态:', response.status);
        console.log('响应状态文本:', response.statusText);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));
        
        // 获取原始响应文本
        const responseText = await response.text();
        console.log('原始响应文本:', responseText);
        console.log('响应文本长度:', responseText.length);
        console.log('响应文本前100字符:', responseText.substring(0, 100));
        
        // 尝试解析JSON
        try {
            const data = JSON.parse(responseText);
            console.log('JSON解析成功:', data);
            return data;
        } catch (jsonError) {
            console.error('JSON解析失败:', jsonError);
            console.error('可能的问题: 响应不是有效的JSON格式');
            return null;
        }
        
    } catch (error) {
        console.error('请求失败:', error);
        return null;
    }
}

// 如果在浏览器中运行
if (typeof window !== 'undefined') {
    window.debugLogin = debugLogin;
    console.log('可以在控制台中运行 debugLogin() 来测试');
}