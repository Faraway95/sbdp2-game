"""
游戏数据模型 - 卡牌、敌人、遗物定义
"""
import random

# 卡牌数据
CARDS = {
    # 基础卡牌
    "甩锅": {
        "name": "甩锅",
        "cost": 1,
        "type": "攻击",
        "department": "通用",
        "effect": "造成7点业绩压力，施加1层问责",
        "flavor": "这事儿从一开始就不是我负责的。",
        "damage": 7,
        "debuff": {"问责": 1}
    },
    "摸鱼": {
        "name": "摸鱼", 
        "cost": 1,
        "type": "技能",
        "department": "通用",
        "effect": "获得5点心理防线，抽1张牌",
        "flavor": "带薪上厕所，职场第一课。",
        "block": 5,
        "draw": 1
    },
    "画饼": {
        "name": "画饼",
        "cost": 0,
        "type": "技能", 
        "department": "市场部",
        "effect": "获得2点精力，抽3张牌。下回合开始时失去3点精力",
        "flavor": "等项目上市了，咱们都财务自由！",
        "energy": 2,
        "draw": 3,
        "delayed_cost": 3
    },
    "需求变更": {
        "name": "需求变更",
        "cost": 2,
        "type": "攻击",
        "department": "技术部", 
        "effect": "造成4次2点业绩压力",
        "flavor": "我们想要一个五彩斑斓的黑。",
        "damage": 2,
        "hits": 4
    },
    "向上管理": {
        "name": "向上管理",
        "cost": 1,
        "type": "技能",
        "department": "通用",
        "effect": "获得8点心理防线，下回合获得1点额外精力",
        "flavor": "领导您说的都对，另外这个资源...",
        "block": 8,
        "next_turn_energy": 1
    },
    
    # 新增卡牌 v2.0
    "开会": {
        "name": "开会",
        "cost": 1,
        "type": "技能",
        "department": "通用",
        "effect": "使敌人失去1点精力，获得3点心理防线",
        "flavor": "我们来开个会对齐一下思路。",
        "block": 3,
        "enemy_energy_loss": 1
    },
    "加班": {
        "name": "加班",
        "cost": 2,
        "type": "攻击",
        "department": "技术部",
        "effect": "造成15点业绩压力，失去5点心态",
        "flavor": "996是我们的福报！",
        "damage": 15,
        "self_damage": 5
    },
    "团建": {
        "name": "团建",
        "cost": 2,
        "type": "技能",
        "department": "人力资源部",
        "effect": "获得6点心理防线，获得1层士气（攻击力+2）",
        "flavor": "周末团队建设，自愿参加哦～",
        "block": 6,
        "buff": {"士气": 1}
    },
    "裁员": {
        "name": "裁员",
        "cost": 1,
        "type": "技能",
        "department": "人力资源部",
        "effect": "消耗一张手牌，获得等同其费用的金钱",
        "flavor": "基于公司战略调整...",
        "consume_card_for_money": True
    },
    "内卷": {
        "name": "内卷",
        "cost": 1,
        "type": "攻击",
        "department": "通用",
        "effect": "造成5点业绩压力。本回合每打出一张攻击牌，伤害+2",
        "flavor": "别人加班我也要加班！",
        "damage": 5,
        "escalating_damage": 2
    },
    "汇报": {
        "name": "汇报",
        "cost": 2,
        "type": "攻击",
        "department": "通用",
        "effect": "造成等同于手牌数x3的业绩压力",
        "flavor": "我来汇报一下项目进展...",
        "damage_per_hand_card": 3
    },
    "请假条": {
        "name": "请假条",
        "cost": 2,
        "type": "技能",
        "department": "通用",
        "effect": "敌人跳过下一回合，获得8点心理防线",
        "flavor": "身体不舒服，需要休息一下。",
        "block": 8,
        "enemy_skip_turn": True
    },
    "加薪申请": {
        "name": "加薪申请",
        "cost": 1,
        "type": "技能",
        "department": "通用",
        "effect": "获得25金钱，抽1张牌",
        "flavor": "基于我的工作表现和市场价值...",
        "money": 25,
        "draw": 1
    },
    "KPI考核": {
        "name": "KPI考核",
        "cost": 1,
        "type": "技能",
        "department": "人力资源部",
        "effect": "3回合后对所有敌人造成20点业绩压力",
        "flavor": "让我们看看这个季度的数据...",
        "delayed_damage": {"turns": 3, "damage": 20, "target": "all"}
    },
    "离职威胁": {
        "name": "离职威胁",
        "cost": 0,
        "type": "技能",
        "department": "通用",
        "effect": "使敌人获得2层虚弱（攻击力-25%），消耗",
        "flavor": "我在考虑新的职业机会。",
        "debuff": {"虚弱": 2},
        "exhaust": True
    },
    
    # 原有卡牌
    "紧急上线": {
        "name": "紧急上线",
        "cost": "X",
        "type": "攻击",
        "department": "技术部",
        "effect": "消耗所有精力，每消耗1点精力对所有敌人造成7点业绩压力",
        "flavor": "先发了再说，出了问题再修复！",
        "damage_per_energy": 7,
        "target": "all_enemies"
    },
    "拉踩": {
        "name": "拉踩",
        "cost": 1,
        "type": "技能",
        "department": "市场部",
        "effect": "使一个敌人获得2层问责，你获得2点声望",
        "flavor": "他做得挺好的，但就是缺乏大局观。",
        "debuff": {"问责": 2},
        "buff": {"声望": 2}
    },
    "背锅": {
        "name": "背锅",
        "cost": 2,
        "type": "技能",
        "department": "通用",
        "effect": "获得20点心理防线，将一张委屈放入弃牌堆",
        "flavor": "没事，都是我的问题，我来扛。",
        "block": 20,
        "add_card": "委屈"
    }
}

# 敌人数据
ENEMIES = {
    "需求变更": {
        "name": "需求变更",
        "hp": 30,
        "max_hp": 30,
        "actions": [
            {"type": "attack", "damage": 8, "intent": "造成8点业绩压力"},
            {"type": "debuff", "effect": {"问责": 1}, "intent": "施加问责"},
            {"type": "attack", "damage": 12, "intent": "造成12点业绩压力"}
        ]
    },
    "临时会议": {
        "name": "临时会议", 
        "hp": 25,
        "max_hp": 25,
        "actions": [
            {"type": "debuff", "effect": {"疲惫": 2}, "intent": "施加2层疲惫"},
            {"type": "attack", "damage": 6, "intent": "造成6点业绩压力"},
            {"type": "special", "effect": "steal_energy", "value": 1, "intent": "消耗1点精力"}
        ]
    },
    "客户投诉": {
        "name": "客户投诉",
        "hp": 35, 
        "max_hp": 35,
        "actions": [
            {"type": "attack", "damage": 10, "intent": "造成10点业绩压力"},
            {"type": "buff", "effect": {"愤怒": 1}, "intent": "获得1层愤怒"},
            {"type": "attack", "damage": 15, "intent": "造成15点业绩压力"}
        ]
    },
    "项目经理": {
        "name": "项目经理",
        "hp": 80,
        "max_hp": 80,
        "boss": True,
        "actions": [
            {"type": "attack", "damage": 18, "intent": "造成18点业绩压力"},
            {"type": "special", "effect": "schedule_meeting", "intent": "安排紧急会议"},
            {"type": "debuff", "effect": {"问责": 3}, "intent": "施加3层问责"},
            {"type": "attack", "damage": 25, "intent": "终极大招：项目延期"}
        ]
    }
}

# 遗物数据
RELICS = {
    # 基础遗物
    "人体工学椅": {
        "name": "人体工学椅",
        "rarity": "普通",
        "effect": "每场战斗开始时，获得7点心理防线",
        "flavor": "终于不用腰疼了。",
        "passive": {"combat_start_block": 7}
    },
    "永动机咖啡": {
        "name": "永动机咖啡", 
        "rarity": "稀有",
        "effect": "每回合开始时，获得1点额外精力",
        "flavor": "续命神器，加班必备。",
        "passive": {"turn_start_energy": 1}
    },
    "降噪耳机": {
        "name": "降噪耳机",
        "rarity": "稀有",
        "effect": "每场战斗中，免疫第一次负面状态效果",
        "flavor": "世界终于安静了。",
        "passive": {"debuff_immunity": 1}
    },
    "加班夜宵": {
        "name": "加班夜宵",
        "rarity": "普通", 
        "effect": "每次战斗胜利后，恢复8点心态值",
        "flavor": "深夜的泡面特别香。",
        "passive": {"combat_victory_heal": 8}
    },
    "项目奖金": {
        "name": "项目奖金",
        "rarity": "普通",
        "effect": "击败敌人时，额外获得15金币",
        "flavor": "辛苦工作的回报。",
        "passive": {"bonus_money": 15}
    }
}

# 地图系统 - 项目生命周期
PROJECT_STAGES = {
    1: {
        "name": "需求调研",
        "description": "项目启动阶段，收集用户需求",
        "nodes": [
            {"type": "combat", "name": "用户访谈", "enemy_type": "normal"},
            {"type": "combat", "name": "竞品分析", "enemy_type": "normal"},
            {"type": "rest", "name": "茶水间", "heal": 15},
            {"type": "combat", "name": "需求整理", "enemy_type": "normal"}
        ]
    },
    2: {
        "name": "技术评估", 
        "description": "评估技术可行性和资源需求",
        "nodes": [
            {"type": "combat", "name": "技术选型", "enemy_type": "normal"},
            {"type": "elite", "name": "架构评审", "enemy_type": "elite"},
            {"type": "shop", "name": "工具采购"},
            {"type": "combat", "name": "工期评估", "enemy_type": "normal"}
        ]
    },
    3: {
        "name": "设计评审",
        "description": "UI/UX设计和用户体验规划",
        "nodes": [
            {"type": "combat", "name": "原型设计", "enemy_type": "normal"},
            {"type": "event", "name": "设计评审会"},
            {"type": "combat", "name": "交互设计", "enemy_type": "normal"},
            {"type": "rest", "name": "设计师休息室", "heal": 12}
        ]
    },
    4: {
        "name": "开发冲刺",
        "description": "核心开发阶段，代码实现",
        "nodes": [
            {"type": "combat", "name": "环境搭建", "enemy_type": "normal"},
            {"type": "combat", "name": "功能开发", "enemy_type": "normal"},
            {"type": "elite", "name": "代码评审", "enemy_type": "elite"},
            {"type": "combat", "name": "Bug修复", "enemy_type": "normal"}
        ]
    },
    5: {
        "name": "测试验收",
        "description": "质量保证和用户验收测试",
        "nodes": [
            {"type": "combat", "name": "单元测试", "enemy_type": "normal"},
            {"type": "combat", "name": "集成测试", "enemy_type": "normal"},
            {"type": "elite", "name": "用户验收", "enemy_type": "elite"},
            {"type": "shop", "name": "测试工具"}
        ]
    },
    6: {
        "name": "部署上线",
        "description": "生产环境部署和监控",
        "nodes": [
            {"type": "combat", "name": "生产部署", "enemy_type": "normal"},
            {"type": "combat", "name": "性能监控", "enemy_type": "normal"},
            {"type": "elite", "name": "线上问题", "enemy_type": "elite"},
            {"type": "rest", "name": "庆功宴", "heal": 20}
        ]
    },
    7: {
        "name": "项目总结",
        "description": "项目收尾和经验总结",
        "nodes": [
            {"type": "boss", "name": "项目汇报", "enemy_type": "boss"},
            {"type": "event", "name": "复盘会议"},
            {"type": "boss", "name": "大老板评审", "enemy_type": "final_boss"}
        ]
    }
}

# 状态效果定义
STATUS_EFFECTS = {
    "问责": {
        "name": "问责",
        "type": "debuff",
        "description": "受到的下一次攻击伤害+50%"
    },
    "疲惫": {
        "name": "疲惫", 
        "type": "debuff",
        "description": "每层疲惫使手牌上限-1"
    },
    "声望": {
        "name": "声望",
        "type": "buff", 
        "description": "临时力量，增加攻击伤害"
    },
    "愤怒": {
        "name": "愤怒",
        "type": "buff",
        "description": "每层愤怒使攻击伤害+2"
    }
}

# 事件数据
EVENTS = {
    "带薪摸鱼": {
        "name": "带薪摸鱼",
        "description": "在茶水间遇到了同事，可以选择休息或者聊天",
        "choices": [
            {"text": "休息一下", "effect": {"heal": 10}},
            {"text": "聊聊工作", "effect": {"draw_card": True}},
            {"text": "继续工作", "effect": {"money": 20}}
        ]
    },
    "团建活动": {
        "name": "团建活动",
        "description": "公司组织了团建活动，虽然是自愿参加的...",
        "choices": [
            {"text": "积极参与", "effect": {"relic": True}},
            {"text": "找借口逃避", "effect": {"money": -10, "heal": 5}},
            {"text": "默默跟随", "effect": {"experience": 20}}
        ]
    }
}

class GameLogic:
    """游戏核心逻辑类"""
    
    @staticmethod
    def calculate_damage(base_damage, attacker_buffs=None, target_debuffs=None):
        """计算伤害"""
        damage = base_damage
        
        if attacker_buffs:
            damage += attacker_buffs.get("声望", 0) * 2
            damage += attacker_buffs.get("愤怒", 0) * 2
            
        if target_debuffs and "问责" in target_debuffs:
            damage = int(damage * (1 + 0.5 * target_debuffs["问责"]))
            
        return max(damage, 0)
    
    @staticmethod
    def apply_card_effect(card_name, player_state, enemy_state, energy_spent=None):
        """应用卡牌效果"""
        card = CARDS.get(card_name)
        if not card:
            return False
            
        # 检查精力消耗
        if card["cost"] != "X" and player_state["energy"] < card["cost"]:
            return False
            
        # 扣除精力
        if card["cost"] == "X":
            energy_cost = energy_spent or player_state["energy"]
            player_state["energy"] = 0
        else:
            player_state["energy"] -= card["cost"]
            energy_cost = card["cost"]
        
        # 应用效果
        if "damage" in card:
            if card.get("target") == "all_enemies":
                # 对所有敌人造成伤害
                for enemy in enemy_state if isinstance(enemy_state, list) else [enemy_state]:
                    damage = card.get("damage_per_energy", card["damage"])
                    if card["cost"] == "X":
                        damage *= energy_cost
                    final_damage = GameLogic.calculate_damage(
                        damage, 
                        player_state.get("buffs", {}),
                        enemy.get("debuffs", {})
                    )
                    enemy["hp"] = max(0, enemy["hp"] - final_damage)
            else:
                # 单体攻击
                target = enemy_state if not isinstance(enemy_state, list) else enemy_state[0]
                hits = card.get("hits", 1)
                for _ in range(hits):
                    final_damage = GameLogic.calculate_damage(
                        card["damage"],
                        player_state.get("buffs", {}), 
                        target.get("debuffs", {})
                    )
                    target["hp"] = max(0, target["hp"] - final_damage)
        
        if "block" in card:
            player_state["block"] = player_state.get("block", 0) + card["block"]
            
        if "draw" in card:
            # 抽牌逻辑将在前端实现
            pass
            
        if "energy" in card:
            player_state["energy"] += card["energy"]
            
        return True
    
    @staticmethod
    def get_random_enemy():
        """获取随机敌人"""
        enemy_name = random.choice(list(ENEMIES.keys()))
        enemy_data = ENEMIES[enemy_name].copy()
        enemy_data["current_action"] = 0
        enemy_data["buffs"] = {}
        enemy_data["debuffs"] = {}
        return enemy_data
    
    @staticmethod
    def get_enemy_action(enemy):
        """获取敌人行动"""
        actions = enemy["actions"]
        action_index = enemy.get("current_action", 0) % len(actions)
        enemy["current_action"] = action_index + 1
        return actions[action_index]