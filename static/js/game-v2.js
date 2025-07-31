/**
 * 游戏核心JavaScript v2.0 - 完整项目生命周期体验
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
    stage: 1,
    node: 0,
    enemy: null,
    hand: [],
    drawPile: [],
    discardPile: [],
    relics: [],
    inCombat: false,
    mapData: null,
    currentLayer: 1,
    completedNodes: [],
    availableNodes: []
};

// 地图配置数据
const mapConfiguration = [
    // 第1层 - 起始战斗
    {
        layer: 1,
        nodes: [
            { id: '1-1', type: 'combat', name: '实习生', icon: '👶', connections: ['2-1', '2-2'] },
            { id: '1-2', type: 'combat', name: '产品经理', icon: '📋', connections: ['2-1', '2-3'] },
            { id: '1-3', type: 'combat', name: 'UI设计师', icon: '🎨', connections: ['2-2', '2-3'] }
        ]
    },
    // 第2层 - 混合节点
    {
        layer: 2,
        nodes: [
            { id: '2-1', type: 'shop', name: '茶水间', icon: '☕', connections: ['3-1', '3-2'] },
            { id: '2-2', type: 'event', name: '会议室', icon: '🏢', connections: ['3-1', '3-3'] },
            { id: '2-3', type: 'combat', name: '技术主管', icon: '👨‍💻', connections: ['3-2', '3-3'] }
        ]
    },
    // 第3层 - 进阶挑战
    {
        layer: 3,
        nodes: [
            { id: '3-1', type: 'combat', name: '运营总监', icon: '📈', connections: ['4-1', '4-2'] },
            { id: '3-2', type: 'relic', name: '人事部', icon: '👥', connections: ['4-1', '4-3'] },
            { id: '3-3', type: 'combat', name: '财务经理', icon: '💰', connections: ['4-2', '4-3'] }
        ]
    },
    // 第4层 - 最终准备
    {
        layer: 4,
        nodes: [
            { id: '4-1', type: 'combat', name: '副总裁', icon: '👔', connections: ['5-1'] },
            { id: '4-2', type: 'shop', name: 'CEO办公室外', icon: '🚪', connections: ['5-1'] },
            { id: '4-3', type: 'event', name: '董事会', icon: '🎩', connections: ['5-1'] }
        ]
    },
    // 第5层 - BOSS
    {
        layer: 5,
        nodes: [
            { id: '5-1', type: 'boss', name: 'CEO', icon: '👑', connections: [] }
        ]
    }
];

// 扩展卡牌数据（包含所有新卡牌）
const cardData = {
    // 基础卡牌
    "甩锅": {
        name: "甩锅", cost: 1, type: "攻击", department: "general",
        description: "造成7点业绩压力，施加1层问责",
        flavor: "这事儿从一开始就不是我负责的。"
    },
    "摸鱼": {
        name: "摸鱼", cost: 1, type: "技能", department: "general",
        description: "获得5点心理防线，抽1张牌",
        flavor: "带薪上厕所，职场第一课。"
    },
    "画饼": {
        name: "画饼", cost: 0, type: "技能", department: "market",
        description: "获得2点精力，抽3张牌。下回合开始时失去3点精力",
        flavor: "等项目上市了，咱们都财务自由！"
    },
    "需求变更": {
        name: "需求变更", cost: 2, type: "攻击", department: "tech",
        description: "造成4次2点业绩压力",
        flavor: "我们想要一个五彩斑斓的黑。"
    },
    "向上管理": {
        name: "向上管理", cost: 1, type: "技能", department: "general",
        description: "获得8点心理防线，下回合获得1点额外精力",
        flavor: "领导您说的都对，另外这个资源..."
    },
    
    // 新增卡牌 v2.0
    "开会": {
        name: "开会", cost: 1, type: "技能", department: "general",
        description: "使敌人失去1点精力，获得3点心理防线",
        flavor: "我们来开个会对齐一下思路。"
    },
    "加班": {
        name: "加班", cost: 2, type: "攻击", department: "tech",
        description: "造成15点业绩压力，失去5点心态",
        flavor: "996是我们的福报！"
    },
    "团建": {
        name: "团建", cost: 2, type: "技能", department: "hr",
        description: "获得6点心理防线，获得1层士气（攻击力+2）",
        flavor: "周末团队建设，自愿参加哦～"
    },
    "裁员": {
        name: "裁员", cost: 1, type: "技能", department: "hr",
        description: "消耗一张手牌，获得等同其费用的金钱",
        flavor: "基于公司战略调整..."
    },
    "内卷": {
        name: "内卷", cost: 1, type: "攻击", department: "general",
        description: "造成5点业绩压力。本回合每打出一张攻击牌，伤害+2",
        flavor: "别人加班我也要加班！"
    },
    "汇报": {
        name: "汇报", cost: 2, type: "攻击", department: "general",
        description: "造成等同于手牌数x3的业绩压力",
        flavor: "我来汇报一下项目进展..."
    },
    "请假条": {
        name: "请假条", cost: 2, type: "技能", department: "general",
        description: "敌人跳过下一回合，获得8点心理防线",
        flavor: "身体不舒服，需要休息一下。"
    },
    "加薪申请": {
        name: "加薪申请", cost: 1, type: "技能", department: "general",
        description: "获得25金钱，抽1张牌",
        flavor: "基于我的工作表现和市场价值..."
    },
    "KPI考核": {
        name: "KPI考核", cost: 1, type: "技能", department: "hr",
        description: "3回合后对所有敌人造成20点业绩压力",
        flavor: "让我们看看这个季度的数据..."
    },
    "离职威胁": {
        name: "离职威胁", cost: 0, type: "技能", department: "general",
        description: "使敌人获得2层虚弱（攻击力-25%），消耗",
        flavor: "我在考虑新的职业机会。"
    }
};

// 项目阶段名称映射
const stageNames = {
    1: "需求调研",
    2: "技术评估", 
    3: "设计评审",
    4: "开发冲刺",
    5: "测试验收",
    6: "部署上线",
    7: "项目总结"
};

// 页面加载完成
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎮 游戏界面 v2.0 已加载');
    
    try {
        await loadGameState();
        await loadMapData();
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
            gameState.stage = data.stage;
            gameState.node = data.node;
            gameState.hand = data.hand;
            gameState.drawPile = data.draw_pile;
            gameState.discardPile = data.discard_pile;
            gameState.relics = data.relics;
            
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
 * 加载地图数据
 */
async function loadMapData() {
    try {
        const response = await fetch('/api/get_map');
        const data = await response.json();
        
        if (response.ok) {
            gameState.mapData = data;
            updateMapUI();
        } else {
            throw new Error(data.error || '加载地图数据失败');
        }
    } catch (error) {
        console.error('加载地图数据错误:', error);
        throw error;
    }
}

/**
 * 初始化游戏界面
 */
function initializeGame() {
    updateUI();
    updateMapUI();
    showMapArea();
    
    // 添加键盘快捷键
    document.addEventListener('keydown', handleKeypress);
    
    showNotification('欢迎来到职场修罗场 v2.0！', 'info');
}

/**
 * 更新UI显示
 */
function updateUI() {
    // 更新阶段信息
    document.getElementById('currentStage').textContent = gameState.stage;
    document.getElementById('stageName').textContent = stageNames[gameState.stage] || '未知阶段';
    
    // 更新资源显示
    document.getElementById('currentHP').textContent = gameState.player.hp;
    document.getElementById('maxHP').textContent = gameState.player.maxHp;
    document.getElementById('currentEnergy').textContent = gameState.player.energy;
    document.getElementById('currentMoney').textContent = gameState.player.money;
    
    // 更新生命值条
    const healthPercentage = (gameState.player.hp / gameState.player.maxHp) * 100;
    document.getElementById('healthBar').style.width = `${healthPercentage}%`;
    
    // 更新格挡显示
    document.getElementById('playerBlock').textContent = gameState.player.block;
    
    // 更新遗物计数
    document.getElementById('relicCount').textContent = gameState.relics.length;
    
    // 更新牌堆计数
    document.getElementById('drawPileCount').textContent = gameState.drawPile.length;
    document.getElementById('discardPileCount').textContent = gameState.discardPile.length;
    
    // 更新阶段进度
    updateStageProgress();
}

/**
 * 更新阶段进度
 */
function updateStageProgress() {
    if (gameState.mapData && gameState.mapData.stage_info) {
        const totalNodes = gameState.mapData.stage_info.nodes.length;
        const currentNode = gameState.node;
        const progress = (currentNode / totalNodes) * 100;
        
        document.getElementById('stageProgress').style.width = `${progress}%`;
        document.getElementById('currentNode').textContent = currentNode;
        document.getElementById('totalNodes').textContent = totalNodes;
    }
}

/**
 * 更新地图UI
 */
function updateMapUI() {
    if (!gameState.mapData) return;
    
    const stageInfo = gameState.mapData.stage_info;
    
    // 更新地图标题
    document.getElementById('mapStageTitle').textContent = 
        `${stageInfo.name} - 阶段 ${gameState.stage}`;
    document.getElementById('mapStageDescription').textContent = stageInfo.description;
    
    // 更新阶段指示器
    updateStageIndicator();
    
    // 更新可用节点
    updateAvailableNodes();
}

/**
 * 更新阶段指示器
 */
function updateStageIndicator() {
    const indicator = document.getElementById('stageIndicator');
    indicator.innerHTML = '';
    
    for (let i = 1; i <= 7; i++) {
        const dot = document.createElement('div');
        dot.className = 'stage-dot';
        
        if (i < gameState.stage) {
            dot.classList.add('completed');
        } else if (i === gameState.stage) {
            dot.classList.add('current');
        }
        
        indicator.appendChild(dot);
    }
}

/**
 * 更新可用节点
 */
function updateAvailableNodes() {
    const mapContainer = document.getElementById('projectMap');
    mapContainer.innerHTML = '';
    
    if (!gameState.mapData.available_nodes) return;
    
    gameState.mapData.available_nodes.forEach((node, index) => {
        const nodeElement = createNodeElement(node, index);
        mapContainer.appendChild(nodeElement);
    });
}

/**
 * 创建节点元素
 */
function createNodeElement(node, index) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = `map-node node-${node.type}`;
    nodeDiv.onclick = () => chooseNode(index);
    
    // 节点图标映射
    const iconMap = {
        'combat': '⚔️',
        'elite': '👑',
        'boss': '🏢',
        'rest': '☕',
        'shop': '🛒',
        'event': '📋'
    };
    
    nodeDiv.innerHTML = `
        <div class="node-icon">${iconMap[node.type] || '❓'}</div>
        <div class="node-title">${node.name}</div>
        <div class="node-description">${getNodeDescription(node)}</div>
    `;
    
    return nodeDiv;
}

/**
 * 获取节点描述
 */
function getNodeDescription(node) {
    const descriptions = {
        'combat': '处理日常工作任务',
        'elite': '重要会议和评审',
        'boss': '项目关键节点',
        'rest': '休息恢复心态',
        'shop': '购买工具和道具',
        'event': '随机职场事件'
    };
    
    return descriptions[node.type] || '未知事件';
}

/**
 * 选择节点
 */
async function chooseNode(nodeIndex) {
    try {
        const response = await fetch('/api/choose_node', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ node_index: nodeIndex })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            gameState.stage = data.new_stage;
            gameState.node = data.new_node;
            
            // 根据节点类型执行相应操作
            const node = gameState.mapData.available_nodes[nodeIndex];
            await handleNodeAction(node);
            
            // 重新加载地图数据
            await loadMapData();
            
        } else {
            throw new Error(data.error || '选择节点失败');
        }
    } catch (error) {
        console.error('选择节点错误:', error);
        showNotification('节点选择失败', 'error');
    }
}

/**
 * 处理节点行动
 */
async function handleNodeAction(node) {
    switch (node.type) {
        case 'combat':
        case 'elite':
        case 'boss':
            await startCombat();
            break;
        case 'rest':
            await handleRestNode(node);
            break;
        case 'shop':
            await handleShopNode(node);
            break;
        case 'event':
            await handleEventNode(node);
            break;
    }
}

/**
 * 处理休息节点
 */
async function handleRestNode(node) {
    const healAmount = node.heal || 15;
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healAmount);
    updateUI();
    showNotification(`恢复了 ${healAmount} 点心态值`, 'success');
}

/**
 * 处理商店节点
 */
async function handleShopNode(node) {
    // 简单实现：随机获得一个遗物
    const relicNames = ['人体工学椅', '永动机咖啡', '降噪耳机', '加班夜宵', '项目奖金'];
    const randomRelic = relicNames[Math.floor(Math.random() * relicNames.length)];
    
    try {
        const response = await fetch('/api/add_relic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ relic_name: randomRelic })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            gameState.relics.push(randomRelic);
            updateUI();
            showNotification(`获得遗物：${randomRelic}`, 'success');
        }
    } catch (error) {
        console.error('商店节点错误:', error);
    }
}

/**
 * 处理事件节点
 */
async function handleEventNode(node) {
    // 简单的随机事件
    const events = [
        { text: '团建活动结束，心情愉悦', hp: 10 },
        { text: '获得项目奖金', money: 50 },
        { text: '加班太累，损失心态', hp: -5 }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    if (randomEvent.hp) {
        gameState.player.hp = Math.max(1, Math.min(gameState.player.maxHp, 
            gameState.player.hp + randomEvent.hp));
    }
    
    if (randomEvent.money) {
        gameState.player.money += randomEvent.money;
    }
    
    updateUI();
    showNotification(randomEvent.text, randomEvent.hp > 0 ? 'success' : 'error');
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
    
    // 检查遗物效果（战斗胜利治疗）
    if (gameState.relics.includes('加班夜宵')) {
        gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 8);
        showNotification('加班夜宵恢复了8点心态', 'success');
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
 * 显示遗物界面
 */
async function showRelics() {
    try {
        const response = await fetch('/api/get_relics');
        const data = await response.json();
        
        if (response.ok) {
            const relicModal = document.getElementById('relicModal');
            const relicGrid = document.getElementById('relicGrid');
            
            relicGrid.innerHTML = '';
            
            if (data.relics.length === 0) {
                relicGrid.innerHTML = '<p>还没有获得任何遗物</p>';
            } else {
                data.relics.forEach(relic => {
                    const relicElement = createRelicElement(relic);
                    relicGrid.appendChild(relicElement);
                });
            }
            
            relicModal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('显示遗物错误:', error);
        showNotification('无法显示遗物', 'error');
    }
}

/**
 * 创建遗物元素
 */
function createRelicElement(relic) {
    const relicDiv = document.createElement('div');
    relicDiv.className = `relic-item rarity-${relic.rarity}`;
    
    relicDiv.innerHTML = `
        <div class="relic-name">${relic.name}</div>
        <div class="relic-effect">${relic.effect}</div>
        <div class="relic-flavor">"${relic.flavor || ''}"</div>
    `;
    
    return relicDiv;
}

/**
 * 关闭遗物界面
 */
function closeRelicModal() {
    document.getElementById('relicModal').classList.add('hidden');
}

/**
 * 显示牌堆
 */
function showDrawPile() {
    showPileModal('抽牌堆', gameState.drawPile);
}

/**
 * 显示弃牌堆
 */
function showDiscardPile() {
    showPileModal('弃牌堆', gameState.discardPile);
}

/**
 * 显示牌堆模态框
 */
function showPileModal(title, cards) {
    const pileModal = document.getElementById('pileModal');
    const pileModalTitle = document.getElementById('pileModalTitle');
    const pileCards = document.getElementById('pileCards');
    
    pileModalTitle.textContent = title;
    pileCards.innerHTML = '';
    
    if (cards.length === 0) {
        pileCards.innerHTML = '<p>牌堆为空</p>';
    } else {
        cards.forEach(cardName => {
            const card = cardData[cardName];
            if (card) {
                const cardElement = createPileCardElement(card);
                pileCards.appendChild(cardElement);
            }
        });
    }
    
    pileModal.classList.remove('hidden');
}

/**
 * 创建牌堆卡牌元素
 */
function createPileCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'pile-card';
    
    cardDiv.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
    `;
    
    return cardDiv;
}

/**
 * 关闭牌堆界面
 */
function closePileModal() {
    document.getElementById('pileModal').classList.add('hidden');
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
        case 'r':
            event.preventDefault();
            showRelics();
            break;
        case 'd':
            event.preventDefault();
            showDrawPile();
            break;
        case 'f':
            event.preventDefault();
            showDiscardPile();
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
    
    /* 节点样式扩展 */
    .node-combat { border-color: var(--secondary-gray); }
    .node-elite { border-color: var(--warning-red); }
    .node-boss { border-color: var(--warning-yellow); }
    .node-rest { border-color: var(--success-green); }
    .node-shop { border-color: var(--accent-blue); }
    .node-event { border-color: var(--defense-blue); }
`;
document.head.appendChild(gameStyle);

// ===== 地图系统功能 =====

/**
 * 初始化地图系统
 */
function initializeMap() {
    // 初始设置：第一层的所有节点都可用
    gameState.availableNodes = ['1-1', '1-2', '1-3'];
    gameState.completedNodes = [];
    gameState.currentLayer = 1;
    
    renderMap();
    renderNavigation();
}

/**
 * 渲染地图
 */
function renderMap() {
    const mapContent = document.getElementById('mapContent');
    mapContent.innerHTML = '';
    
    // 从上到下渲染每一层（倒序，因为杀戮尖塔风格是从下往上）
    for (let i = mapConfiguration.length - 1; i >= 0; i--) {
        const layer = mapConfiguration[i];
        const layerElement = createLayerElement(layer);
        mapContent.appendChild(layerElement);
    }
    
    // 渲染连接线
    setTimeout(() => renderConnections(), 100); // 延迟一下确保节点已渲染
}

/**
 * 创建层级元素
 */
function createLayerElement(layer) {
    const layerDiv = document.createElement('div');
    layerDiv.className = 'map-layer';
    layerDiv.dataset.layer = layer.layer;
    
    // 层级标签
    const layerLabel = document.createElement('div');
    layerLabel.className = 'layer-label';
    layerLabel.textContent = `第${layer.layer}层`;
    layerDiv.appendChild(layerLabel);
    
    // 节点容器
    const nodesContainer = document.createElement('div');
    nodesContainer.className = 'layer-nodes';
    nodesContainer.style.display = 'flex';
    nodesContainer.style.justifyContent = 'center';
    nodesContainer.style.gap = '3rem';
    
    layer.nodes.forEach(node => {
        const nodeElement = createNodeElement(node);
        nodesContainer.appendChild(nodeElement);
    });
    
    layerDiv.appendChild(nodesContainer);
    return layerDiv;
}

/**
 * 创建节点元素
 */
function createNodeElement(node) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = `map-node ${node.type}`;
    nodeDiv.dataset.nodeId = node.id;
    nodeDiv.dataset.nodeType = node.type;
    
    // 设置节点状态
    if (gameState.completedNodes.includes(node.id)) {
        nodeDiv.classList.add('completed');
    } else if (gameState.availableNodes.includes(node.id)) {
        nodeDiv.classList.add('available');
    } else {
        nodeDiv.classList.add('locked');
    }
    
    // 节点内容
    const nodeIcon = document.createElement('div');
    nodeIcon.className = 'node-icon';
    nodeIcon.textContent = node.icon;
    
    const nodeLabel = document.createElement('div');
    nodeLabel.className = 'node-label';
    nodeLabel.textContent = node.name;
    
    // 悬浮提示
    const tooltip = document.createElement('div');
    tooltip.className = 'node-tooltip';
    tooltip.textContent = getNodeDescription(node);
    
    nodeDiv.appendChild(nodeIcon);
    nodeDiv.appendChild(nodeLabel);
    nodeDiv.appendChild(tooltip);
    
    // 添加点击事件
    if (gameState.availableNodes.includes(node.id)) {
        nodeDiv.addEventListener('click', () => selectNode(node));
    }
    
    return nodeDiv;
}

/**
 * 获取节点描述
 */
function getNodeDescription(node) {
    const descriptions = {
        combat: '战斗 - 获得金钱和经验',
        shop: '商店 - 购买卡牌和遗物',
        event: '随机事件 - 风险与机遇并存',
        relic: '遗物 - 获得强力道具',
        boss: '最终BOSS - 击败CEO！'
    };
    return descriptions[node.type] || '未知节点';
}

/**
 * 渲染连接线
 */
function renderConnections() {
    // 清除现有连接线
    document.querySelectorAll('.map-connection').forEach(el => el.remove());
    
    mapConfiguration.forEach(layer => {
        layer.nodes.forEach(node => {
            const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`);
            if (!nodeElement) return;
            
            node.connections.forEach(targetId => {
                const targetElement = document.querySelector(`[data-node-id="${targetId}"]`);
                if (!targetElement) return;
                
                const connection = createConnectionLine(nodeElement, targetElement);
                document.querySelector('.map-container').appendChild(connection);
            });
        });
    });
}

/**
 * 创建连接线
 */
function createConnectionLine(fromElement, toElement) {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const containerRect = document.querySelector('.map-container').getBoundingClientRect();
    
    const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
    const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
    const toX = toRect.left + toRect.width / 2 - containerRect.left;
    const toY = toRect.top + toRect.height / 2 - containerRect.top;
    
    const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
    
    const line = document.createElement('div');
    line.className = 'map-connection';
    line.style.position = 'absolute';
    line.style.left = fromX + 'px';
    line.style.top = fromY + 'px';
    line.style.width = length + 'px';
    line.style.transform = `rotate(${angle}deg)`;
    
    // 如果路径已激活则高亮
    const fromNodeId = fromElement.dataset.nodeId;
    const toNodeId = toElement.dataset.nodeId;
    if (gameState.completedNodes.includes(fromNodeId) || gameState.availableNodes.includes(toNodeId)) {
        line.classList.add('active');
    }
    
    return line;
}

/**
 * 选择节点
 */
async function selectNode(node) {
    try {
        showNotification(`进入：${node.name}`, 'info');
        
        switch (node.type) {
            case 'combat':
                await startCombat();
                break;
            case 'shop':
                showShop();
                break;
            case 'event':
                showEvent();
                break;
            case 'relic':
                showRelicReward();
                break;
            case 'boss':
                await startBossFight();
                break;
        }
        
        // 完成节点
        completeNode(node.id);
        
    } catch (error) {
        console.error('选择节点错误:', error);
        showNotification('节点处理失败，请重试', 'error');
    }
}

/**
 * 完成节点
 */
function completeNode(nodeId) {
    // 添加到已完成节点
    if (!gameState.completedNodes.includes(nodeId)) {
        gameState.completedNodes.push(nodeId);
    }
    
    // 移除当前可用节点
    gameState.availableNodes = gameState.availableNodes.filter(id => id !== nodeId);
    
    // 找到该节点并激活其连接的节点
    const node = findNodeById(nodeId);
    if (node) {
        node.connections.forEach(connectionId => {
            if (!gameState.completedNodes.includes(connectionId) && 
                !gameState.availableNodes.includes(connectionId)) {
                gameState.availableNodes.push(connectionId);
            }
        });
        
        // 检查是否需要更新当前层级
        const nodeLayer = parseInt(nodeId.split('-')[0]);
        if (nodeLayer > gameState.currentLayer) {
            gameState.currentLayer = nodeLayer;
        }
    }
    
    // 重新渲染地图
    renderMap();
    renderNavigation();
}

/**
 * 根据ID查找节点
 */
function findNodeById(nodeId) {
    for (const layer of mapConfiguration) {
        const node = layer.nodes.find(n => n.id === nodeId);
        if (node) return node;
    }
    return null;
}

/**
 * 渲染导航
 */
function renderNavigation() {
    const navigation = document.getElementById('mapNavigation');
    navigation.innerHTML = '';
    
    mapConfiguration.forEach(layer => {
        const navDot = document.createElement('div');
        navDot.className = 'nav-layer';
        navDot.dataset.layer = layer.layer;
        
        // 设置导航点状态
        if (layer.layer === gameState.currentLayer) {
            navDot.classList.add('current');
        } else if (layer.layer < gameState.currentLayer) {
            navDot.classList.add('completed');
        }
        
        // 添加点击滚动功能
        navDot.addEventListener('click', () => {
            const layerElement = document.querySelector(`[data-layer="${layer.layer}"]`);
            if (layerElement) {
                layerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        
        navigation.appendChild(navDot);
    });
}

/**
 * 显示商店（占位符）
 */
function showShop() {
    showNotification('商店功能开发中...', 'info');
}

/**
 * 显示事件（占位符）
 */
function showEvent() {
    const events = [
        '发现了一台被遗忘的打印机，获得15金钱',
        '加班到深夜，失去5点心态值但获得额外经验',
        '在茶水间遇到了老板，获得意外赞赏'
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    showNotification(randomEvent, 'info');
}

/**
 * 显示遗物奖励（占位符）
 */
function showRelicReward() {
    showNotification('获得神秘遗物！', 'success');
}

/**
 * 开始BOSS战斗
 */
async function startBossFight() {
    showNotification('面对最终挑战...', 'warning');
    await startCombat();
}

// 初始化游戏时调用地图初始化
document.addEventListener('DOMContentLoaded', function() {
    // 其他初始化代码...
    initializeMap();
});