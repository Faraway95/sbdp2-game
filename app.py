from flask import Flask, render_template, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json
import random
import uuid
from datetime import datetime
from game_data import CARDS, ENEMIES, RELICS, PROJECT_STAGES, GameLogic

app = Flask(__name__)
app.secret_key = 'sbdp2_office_card_game_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///office_card_game.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 启用CORS支持
CORS(app)

db = SQLAlchemy(app)

# 数据库模型
class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    level = db.Column(db.Integer, default=1)
    experience = db.Column(db.Integer, default=0)
    unlocked_cards = db.Column(db.Text, default='[]')
    unlocked_relics = db.Column(db.Text, default='[]')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class GameSession(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)
    current_stage = db.Column(db.Integer, default=1)
    current_node = db.Column(db.Integer, default=0)
    current_hp = db.Column(db.Integer, default=100)
    max_hp = db.Column(db.Integer, default=100)
    energy = db.Column(db.Integer, default=3)
    money = db.Column(db.Integer, default=100)
    deck = db.Column(db.Text, default='[]')
    draw_pile = db.Column(db.Text, default='[]')
    discard_pile = db.Column(db.Text, default='[]')
    hand = db.Column(db.Text, default='[]')
    relics = db.Column(db.Text, default='[]')
    status_effects = db.Column(db.Text, default='{}')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# 路由
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html')

@app.route('/test')
def test_page():
    """测试页面"""
    try:
        with open('test_login.html', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return '''
        <!DOCTYPE html>
        <html>
        <head><title>Simple Test</title></head>
        <body>
            <h1>API Test Page</h1>
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

@app.route('/api/test')
def test_api():
    """测试API是否正常工作"""
    return jsonify({
        'status': 'ok',
        'message': 'API working normally',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/start_game', methods=['POST'])
def start_game():
    try:
        # 确保请求内容类型正确
        if not request.is_json:
            return jsonify({'success': False, 'error': 'Invalid request format, JSON required'}), 400
        
        data = request.get_json(force=True)
        if not data:
            return jsonify({'success': False, 'error': 'Invalid request data'}), 400
            
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        print(f"Login attempt - user: {username}, password: {password}")  # Debug info
        
        if not username:
            return jsonify({'success': False, 'error': 'Please enter employee ID'}), 400
            
        if not password:
            return jsonify({'success': False, 'error': 'Please enter password'}), 400
        
        # 简单的密码验证（可以根据需要扩展）
        valid_passwords = ['123456', 'admin', 'password', '666666', '888888', 'project']
        if password not in valid_passwords:
            return jsonify({'success': False, 'error': 'Password incorrect, please contact system administrator'}), 401
        
        # 创建或获取玩家
        player = Player.query.filter_by(username=username).first()
        if not player:
            player = Player(username=username)
            db.session.add(player)
            db.session.flush()  # 确保获取ID
        
        # 创建游戏会话
        session_id = str(uuid.uuid4())
        starter_deck = ['blame_shift', 'slack_off', 'empty_promise', 'manage_up', 'blame_shift', 'slack_off', 'empty_promise', 'manage_up', 'meeting', 'team_building']
        game_session = GameSession(
            id=session_id,
            player_id=player.id,
            deck=json.dumps(starter_deck),
            draw_pile=json.dumps(starter_deck.copy()),
            discard_pile=json.dumps([]),
            hand=json.dumps([])
        )
        db.session.add(game_session)
        db.session.commit()
        
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
        
        print(f"Login success - response: {response_data}")  # Debug info
        return jsonify(response_data)
        
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        print(f"Login error: {error_msg}")
        return jsonify({'success': False, 'error': f'System error: {error_msg}'}), 500

@app.route('/api/get_game_state')
def get_game_state():
    session_id = session.get('game_session_id')
    if not session_id:
        return jsonify({'error': 'No active game session'}), 400
    
    game_session = GameSession.query.get(session_id)
    if not game_session or not game_session.is_active:
        return jsonify({'error': 'Invalid game session'}), 400
    
    return jsonify({
        'stage': game_session.current_stage,
        'node': game_session.current_node,
        'hp': game_session.current_hp,
        'max_hp': game_session.max_hp,
        'energy': game_session.energy,
        'money': game_session.money,
        'deck': json.loads(game_session.deck),
        'draw_pile': json.loads(game_session.draw_pile),
        'discard_pile': json.loads(game_session.discard_pile),
        'hand': json.loads(game_session.hand),
        'relics': json.loads(game_session.relics),
        'status_effects': json.loads(game_session.status_effects)
    })

@app.route('/api/start_combat', methods=['POST'])
def start_combat():
    session_id = session.get('game_session_id')
    if not session_id:
        return jsonify({'error': 'No active game session'}), 400
    
    # 生成敌人
    enemy = GameLogic.get_random_enemy()
    current_action = GameLogic.get_enemy_action(enemy)
    
    # 存储战斗状态到session
    session['combat_state'] = {
        'enemy': enemy,
        'player_hand': ['blame_shift', 'slack_off', 'empty_promise', 'manage_up', 'blame_shift'],
        'player_block': 0,
        'player_buffs': {},
        'turn': 'player'
    }
    
    return jsonify({
        'enemy': {
            'name': enemy['name'],
            'hp': enemy['hp'],
            'max_hp': enemy['max_hp'],
            'intent': current_action['intent']
        },
        'player_hand': session['combat_state']['player_hand']
    })

@app.route('/api/play_card', methods=['POST'])
def play_card():
    session_id = session.get('game_session_id')
    if not session_id:
        return jsonify({'error': 'No active game session'}), 400
    
    data = request.get_json()
    card_name = data.get('card')
    target = data.get('target', 0)  # 敌人索引
    
    combat_state = session.get('combat_state')
    if not combat_state:
        return jsonify({'error': 'No active combat'}), 400
    
    game_session = GameSession.query.get(session_id)
    if not game_session:
        return jsonify({'error': 'Invalid game session'}), 400
    
    # 检查卡牌是否在手牌中
    if card_name not in combat_state['player_hand']:
        return jsonify({'error': 'Card not in hand'}), 400
    
    # 创建玩家状态
    player_state = {
        'energy': game_session.energy,
        'block': combat_state['player_block'],
        'buffs': combat_state['player_buffs']
    }
    
    # 应用卡牌效果
    success = GameLogic.apply_card_effect(
        card_name, 
        player_state, 
        combat_state['enemy']
    )
    
    if not success:
        return jsonify({'error': 'Cannot play card'}), 400
    
    # 更新状态
    combat_state['player_hand'].remove(card_name)
    combat_state['player_block'] = player_state['block']
    combat_state['player_buffs'] = player_state['buffs']
    game_session.energy = player_state['energy']
    
    # 检查敌人是否死亡
    enemy_dead = combat_state['enemy']['hp'] <= 0
    
    result = {
        'success': True,
        'enemy_hp': combat_state['enemy']['hp'],
        'player_energy': game_session.energy,
        'player_block': combat_state['player_block'],
        'enemy_dead': enemy_dead
    }
    
    if enemy_dead:
        # 战斗胜利
        game_session.money += 20
        game_session.current_node += 1
        session.pop('combat_state', None)
        result['victory'] = True
        result['rewards'] = {'money': 20}
    
    session['combat_state'] = combat_state
    db.session.commit()
    
    return jsonify(result)

@app.route('/api/end_turn', methods=['POST'])  
def end_turn():
    session_id = session.get('game_session_id')
    if not session_id:
        return jsonify({'error': 'No active game session'}), 400
    
    combat_state = session.get('combat_state')
    if not combat_state:
        return jsonify({'error': 'No active combat'}), 400
    
    game_session = GameSession.query.get(session_id)
    
    # 敌人行动
    enemy = combat_state['enemy']
    action = GameLogic.get_enemy_action(enemy)
    
    damage_taken = 0
    if action['type'] == 'attack':
        damage = action['damage']
        # 计算格挡
        actual_damage = max(0, damage - combat_state['player_block'])
        damage_taken = actual_damage
        game_session.current_hp = max(0, game_session.current_hp - actual_damage)
        combat_state['player_block'] = max(0, combat_state['player_block'] - damage)
    
    # 重置回合
    game_session.energy = 3  # 基础精力
    combat_state['player_hand'] = ['blame_shift', 'slack_off', 'empty_promise', 'manage_up', 'blame_shift']  # Redraw cards
    combat_state['player_block'] = 0  # 清除格挡
    
    # 检查玩家是否死亡
    player_dead = game_session.current_hp <= 0
    
    result = {
        'enemy_action': action['intent'],
        'damage_taken': damage_taken,
        'player_hp': game_session.current_hp,
        'player_energy': game_session.energy,
        'player_hand': combat_state['player_hand'],
        'player_dead': player_dead
    }
    
    if player_dead:
        game_session.is_active = False
        result['game_over'] = True
    
    session['combat_state'] = combat_state
    db.session.commit()
    
    return jsonify(result)

@app.route('/api/get_map')
def get_map():
    session_id = session.get('game_session_id')
    if not session_id:
        return jsonify({'error': 'No active game session'}), 400
    
    game_session = GameSession.query.get(session_id)
    if not game_session:
        return jsonify({'error': 'Invalid game session'}), 400
    
    current_stage = game_session.current_stage
    current_node = game_session.current_node
    
    # 获取当前阶段信息
    stage_info = PROJECT_STAGES.get(current_stage, PROJECT_STAGES[1])
    
    # 计算可用节点
    available_nodes = []
    if current_node < len(stage_info['nodes']):
        available_nodes = stage_info['nodes'][current_node:]
    
    return jsonify({
        'current_stage': current_stage,
        'current_node': current_node,
        'stage_info': stage_info,
        'available_nodes': available_nodes,
        'total_stages': len(PROJECT_STAGES)
    })

@app.route('/api/choose_node', methods=['POST'])
def choose_node():
    session_id = session.get('game_session_id')
    if not session_id:
        return jsonify({'error': 'No active game session'}), 400
    
    data = request.get_json()
    node_index = data.get('node_index', 0)
    
    game_session = GameSession.query.get(session_id)
    if not game_session:
        return jsonify({'error': 'Invalid game session'}), 400
    
    # 更新节点位置
    game_session.current_node = node_index
    
    # 检查是否需要进入下一阶段
    current_stage = game_session.current_stage
    stage_info = PROJECT_STAGES.get(current_stage)
    
    if node_index >= len(stage_info['nodes']):
        game_session.current_stage += 1
        game_session.current_node = 0
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'new_stage': game_session.current_stage,
        'new_node': game_session.current_node
    })

@app.route('/api/draw_card', methods=['POST'])
def draw_card():
    session_id = session.get('game_session_id')
    if not session_id:
        return jsonify({'error': 'No active game session'}), 400
    
    game_session = GameSession.query.get(session_id)
    if not game_session:
        return jsonify({'error': 'Invalid game session'}), 400
    
    draw_pile = json.loads(game_session.draw_pile)
    discard_pile = json.loads(game_session.discard_pile)
    hand = json.loads(game_session.hand)
    
    # 如果抽牌堆为空，重洗弃牌堆
    if not draw_pile and discard_pile:
        draw_pile = discard_pile.copy()
        random.shuffle(draw_pile)
        discard_pile = []
    
    # 抽一张牌
    if draw_pile:
        card = draw_pile.pop()
        hand.append(card)
        
        # 更新数据库
        game_session.draw_pile = json.dumps(draw_pile)
        game_session.discard_pile = json.dumps(discard_pile)
        game_session.hand = json.dumps(hand)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'card': card,
            'draw_pile_count': len(draw_pile),
            'discard_pile_count': len(discard_pile),
            'hand': hand
        })
    
    return jsonify({'error': 'No cards to draw'}), 400

@app.route('/api/get_relics')
def get_relics():
    session_id = session.get('game_session_id')
    if not session_id:
        return jsonify({'error': 'No active game session'}), 400
    
    game_session = GameSession.query.get(session_id)
    if not game_session:
        return jsonify({'error': 'Invalid game session'}), 400
    
    player_relics = json.loads(game_session.relics)
    relic_details = []
    
    for relic_name in player_relics:
        if relic_name in RELICS:
            relic_details.append(RELICS[relic_name])
    
    return jsonify({
        'relics': relic_details,
        'count': len(relic_details)
    })

@app.route('/api/add_relic', methods=['POST'])
def add_relic():
    session_id = session.get('game_session_id')
    if not session_id:
        return jsonify({'error': 'No active game session'}), 400
    
    data = request.get_json()
    relic_name = data.get('relic_name')
    
    if relic_name not in RELICS:
        return jsonify({'error': 'Invalid relic'}), 400
    
    game_session = GameSession.query.get(session_id)
    if not game_session:
        return jsonify({'error': 'Invalid game session'}), 400
    
    player_relics = json.loads(game_session.relics)
    if relic_name not in player_relics:
        player_relics.append(relic_name)
        game_session.relics = json.dumps(player_relics)
        db.session.commit()
    
    return jsonify({
        'success': True,
        'relic': RELICS[relic_name]
    })

if __name__ == '__main__':
    import os
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)