/**
 * 游戏核心JavaScript - 战斗和游戏逻辑
 * 上班打牌！肉鸽版
 */

// 游戏状态管理
let gameState = {
    player: {
        hp: 100,
        maxHp: 100,
        energy: 3,
        money: 100,
        block: 0
    },
    enemy: null,
    hand: [],
    inCombat: false,
    floor: 1
};

// 卡牌数据 (从后端同步)
const cardData = {
    "甩锅": {
        name: "甩锅",
        cost: 1,
        type: "攻击",
        department: "general",
        description: "造成7点业绩压力，施加1层问责",
        flavor: "这事儿从一开始就不是我负责的。"
    },
    "摸鱼": {
        name: "摸鱼", 
        cost: 1,
        type: "技能",
        department: "general",
        description: "获得5点心理防线，抽1张牌",
        flavor: "带薪上厕所，职场第一课。"
    },
    "画饼": {
        name: "画饼",
        cost: 0,
        type: "技能", 
        department: "market",
        description: "获得2点精力，抽3张牌。下回合开始时失去3点精力",
        flavor: "等项目上市了，咱们都财务自由！"
    },
    "需求变更": {
        name: "需求变更",
        cost: 2,
        type: "攻击",
        department: "tech", 
        description: "造成4次2点业绩压力",
        flavor: "我们想要一个五彩斑斓的黑。"
    },
    "向上管理": {
        name: "向上管理",
        cost: 1,
        type: "技能",
        department: "general",
        description: "获得8点心理防线，下回合获得1点额外精力",
        flavor: "领导您说的都对，另外这个资源..."
    }
};

// 页面加载完成
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎮 游戏界面已加载');
    
    try {
        await loadGameState();
        initializeGame();
    } catch (error) {
        console.error('游戏初始化失败:', error);
        showNotification('游戏加载失败，请返回主菜单重试', 'error');
    }
});

/**
 * 加载游戏状态
 */
async function loadGameState() {
    try {
        const response = await fetch('/api/get_game_state');
        const data = await response.json();
        
        if (response.ok) {
            gameState.player.hp = data.hp;
            gameState.player.maxHp = data.max_hp;
            gameState.player.energy = data.energy;
            gameState.player.money = data.money;
            gameState.floor = data.floor;
            
            updateUI();
        } else {
            throw new Error(data.error || '加载游戏状态失败');
        }
    } catch (error) {
        console.error('加载游戏状态错误:', error);
        throw error;
    }
}

/**
 * 初始化游戏界面
 */
function initializeGame() {
    updateUI();
    showMapArea();
    
    // 添加键盘快捷键
    document.addEventListener('keydown', handleKeypress);
    
    showNotification('欢迎来到职场修罗场！', 'info');
}

/**
 * 更新UI显示
 */
function updateUI() {
    // 更新资源显示
    document.getElementById('currentFloor').textContent = gameState.floor;
    document.getElementById('currentHP').textContent = gameState.player.hp;
    document.getElementById('maxHP').textContent = gameState.player.maxHp;
    document.getElementById('currentEnergy').textContent = gameState.player.energy;
    document.getElementById('currentMoney').textContent = gameState.player.money;
    
    // 更新生命值条
    const healthPercentage = (gameState.player.hp / gameState.player.maxHp) * 100;
    document.getElementById('healthBar').style.width = `${healthPercentage}%`;
    
    // 更新格挡显示
    document.getElementById('playerBlock').textContent = gameState.player.block;
}

/**
 * 显示地图区域
 */
function showMapArea() {
    document.getElementById('combatArea').classList.add('hidden');
    document.getElementById('mapArea').classList.remove('hidden');
    gameState.inCombat = false;
}

/**
 * 开始战斗
 */
async function startCombat() {
    try {
        showNotification('遭遇工作难题...', 'info');
        
        const response = await fetch('/api/start_combat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            gameState.enemy = data.enemy;
            gameState.hand = data.player_hand;
            gameState.inCombat = true;
            gameState.player.block = 0;
            
            showCombatArea();
            updateCombatUI();
            
            showNotification(`遭遇：${data.enemy.name}`, 'info');
        } else {
            throw new Error(data.error || '开始战斗失败');
        }
    } catch (error) {
        console.error('开始战斗错误:', error);
        showNotification('遭遇战斗问题，请重试', 'error');
    }
}

/**
 * 显示战斗区域
 */
function showCombatArea() {
    document.getElementById('mapArea').classList.add('hidden');
    document.getElementById('combatArea').classList.remove('hidden');
}

/**
 * 更新战斗UI
 */
function updateCombatUI() {
    if (!gameState.enemy) return;
    
    // 更新敌人信息
    document.getElementById('enemyName').textContent = gameState.enemy.name;
    document.getElementById('enemyHP').textContent = gameState.enemy.hp;
    document.getElementById('enemyMaxHP').textContent = gameState.enemy.max_hp;
    document.getElementById('enemyIntent').textContent = gameState.enemy.intent;
    
    // 更新敌人生命值条
    const enemyHealthPercentage = (gameState.enemy.hp / gameState.enemy.max_hp) * 100;
    document.getElementById('enemyHealthBar').style.width = `${enemyHealthPercentage}%`;
    
    // 更新手牌
    updateHandDisplay();
    
    // 更新玩家状态
    updateUI();
}

/**
 * 更新手牌显示
 */
function updateHandDisplay() {
    const handContainer = document.getElementById('cardHand');
    handContainer.innerHTML = '';
    
    gameState.hand.forEach((cardName, index) => {
        const card = cardData[cardName];
        if (!card) return;
        
        const cardElement = createCardElement(card, index);
        handContainer.appendChild(cardElement);
    });
}

/**
 * 创建卡牌元素
 */
function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `game-card department-${card.department}`;
    cardDiv.dataset.index = index;
    cardDiv.dataset.cardName = card.name;
    
    // 检查是否可以打出
    const canPlay = gameState.player.energy >= card.cost;
    if (!canPlay) {
        cardDiv.classList.add('disabled');
    }
    
    cardDiv.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-type">${card.type}</div>
        <div class="card-description">${card.description}</div>
        <div class="card-flavor">"${card.flavor}"</div>
    `;
    
    // 添加点击事件
    if (canPlay) {
        cardDiv.addEventListener('click', () => playCard(card.name, index));
    }
    
    return cardDiv;
}

/**
 * 打出卡牌
 */
async function playCard(cardName, index) {
    if (!gameState.inCombat) return;
    
    try {
        // 添加播放动画
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        cardElement.classList.add('playing');
        
        const response = await fetch('/api/play_card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                card: cardName,
                target: 0
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 更新游戏状态
            gameState.player.energy = data.player_energy;
            gameState.player.block = data.player_block;
            gameState.enemy.hp = data.enemy_hp;
            
            // 从手牌中移除卡牌
            gameState.hand.splice(index, 1);
            
            // 更新UI
            updateCombatUI();
            
            // 检查敌人是否死亡
            if (data.enemy_dead) {
                handleCombatVictory(data.rewards);
                return;
            }
            
            showNotification(`使用了 ${cardName}`, 'success');
            
        } else {
            throw new Error(data.error || '打出卡牌失败');
        }
    } catch (error) {
        console.error('打出卡牌错误:', error);
        showNotification('卡牌使用失败', 'error');
    }
}

/**
 * 结束回合
 */
async function endTurn() {
    if (!gameState.inCombat) return;
    
    try {
        const response = await fetch('/api/end_turn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 显示敌人行动
            showNotification(`敌人行动：${data.enemy_action}`, 'info');
            
            if (data.damage_taken > 0) {
                showNotification(`受到了 ${data.damage_taken} 点伤害`, 'error');
                
                // 添加受伤动画
                const playerSection = document.querySelector('.player-section');
                playerSection.classList.add('damage-animation');
                setTimeout(() => {
                    playerSection.classList.remove('damage-animation');
                }, 500);
            }
            
            // 更新游戏状态
            gameState.player.hp = data.player_hp;
            gameState.player.energy = data.player_energy;
            gameState.player.block = 0; // 格挡重置
            gameState.hand = data.player_hand;
            
            // 检查玩家是否死亡
            if (data.player_dead) {
                handleGameOver();
                return;
            }
            
            // 更新UI
            updateCombatUI();
            
        } else {
            throw new Error(data.error || '结束回合失败');
        }
    } catch (error) {
        console.error('结束回合错误:', error);
        showNotification('回合结束失败', 'error');
    }
}

/**
 * 处理战斗胜利
 */
function handleCombatVictory(rewards) {
    gameState.inCombat = false;
    
    showNotification('任务完成！获得奖励', 'success');
    
    // 更新奖励
    if (rewards && rewards.money) {
        gameState.player.money += rewards.money;
    }
    
    // 等待一下再显示地图
    setTimeout(() => {
        showMapArea();
        updateUI();
    }, 2000);
}

/**
 * 处理游戏结束
 */
function handleGameOver() {
    gameState.inCombat = false;
    
    // 显示游戏结束界面
    const gameOverModal = document.getElementById('gameOverModal');
    gameOverModal.classList.remove('hidden');
    
    // 更新游戏结束信息
    const messages = [
        "心态崩了，但明天还要继续上班...",
        "项目失败了，但这不是你一个人的锅",
        "虽然失败了，但你已经很努力了",
        "休息一下，重新开始吧"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('gameOverMessage').innerHTML = `
        <p>${randomMessage}</p>
        <p class="flavor-text">"也许明天会更好吧" 🫠</p>
    `;
}

/**
 * 重新开始游戏
 */
function restartGame() {
    window.location.reload();
}

/**
 * 返回主菜单
 */
function returnToMenu() {
    window.location.href = '/';
}

/**
 * 退出战斗
 */
function exitCombat() {
    if (confirm('确定要放弃当前项目吗？这将结束游戏。')) {
        returnToMenu();
    }
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.className = `notification notification-${type}`;
    notification.classList.add('show');
    
    // 自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * 键盘快捷键处理
 */
function handleKeypress(event) {
    if (!gameState.inCombat) return;
    
    switch(event.key) {
        case ' ':
        case 'Enter':
            event.preventDefault();
            endTurn();
            break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
            event.preventDefault();
            const cardIndex = parseInt(event.key) - 1;
            if (cardIndex < gameState.hand.length) {
                const cardName = gameState.hand[cardIndex];
                playCard(cardName, cardIndex);
            }
            break;
        case 'Escape':
            event.preventDefault();
            exitCombat();
            break;
    }
}

// 添加额外的CSS样式
const gameStyle = document.createElement('style');
gameStyle.textContent = `
    .notification-success {
        background: var(--success-green);
    }
    
    .notification-error {
        background: var(--warning-red);
    }
    
    .notification-info {
        background: var(--primary-blue);
    }
    
    .game-card.playing {
        animation: cardPlay 0.3s ease;
    }
    
    @keyframes cardPlay {
        0% { transform: scale(1) translateY(0); }
        50% { transform: scale(1.05) translateY(-10px); }
        100% { transform: scale(1) translateY(0); }
    }
    
    .damage-animation {
        animation: damageShake 0.5s ease;
    }
    
    @keyframes damageShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(gameStyle);