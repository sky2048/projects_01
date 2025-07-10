// 塔的品质配置
export const TOWER_RARITY = {
    WHITE: { name: '白色', color: 0xffffff, baseProbability: 0.6 },
    GREEN: { name: '绿色', color: 0x00ff00, baseProbability: 0.25 },
    BLUE: { name: '蓝色', color: 0x0080ff, baseProbability: 0.1 },
    PURPLE: { name: '紫色', color: 0x8000ff, baseProbability: 0.04 },
    ORANGE: { name: '橙色', color: 0xff8000, baseProbability: 0.01 }
};

// 根据等级调整塔品质概率 - 每2级解锁新品质
export const LEVEL_RARITY_MODIFIERS = {
    // 1-2级：只有白色和绿色
    1: { WHITE: 0.7, GREEN: 0.3 },
    2: { WHITE: 0.65, GREEN: 0.35 },
    
    // 3-4级：解锁蓝色
    3: { WHITE: 0.55, GREEN: 0.35, BLUE: 0.1 },
    4: { WHITE: 0.5, GREEN: 0.35, BLUE: 0.15 },
    
    // 5-6级：解锁紫色
    5: { WHITE: 0.4, GREEN: 0.35, BLUE: 0.2, PURPLE: 0.05 },
    6: { WHITE: 0.35, GREEN: 0.35, BLUE: 0.22, PURPLE: 0.08 },
    
    // 7-8级：解锁橙色
    7: { WHITE: 0.3, GREEN: 0.32, BLUE: 0.25, PURPLE: 0.12, ORANGE: 0.01 },
    8: { WHITE: 0.25, GREEN: 0.3, BLUE: 0.27, PURPLE: 0.15, ORANGE: 0.03 },
    
    // 9级及以上：最终概率分布
    9: { WHITE: 0.2, GREEN: 0.28, BLUE: 0.3, PURPLE: 0.17, ORANGE: 0.05 },
    10: { WHITE: 0.15, GREEN: 0.25, BLUE: 0.32, PURPLE: 0.2, ORANGE: 0.08 }
};

// 塔的类型和羁绊
export const TOWER_TYPES = {
    ARCHER: {
        name: '弓箭手',
        synergy: 'MARKSMAN',
        baseStats: { damage: 18, range: 140, attackSpeed: 1.0 },    // 伤害 20→18，射程 150→140
        description: '基础远程攻击单位'
    },
    MAGE: {
        name: '法师',
        synergy: 'MAGE',
        baseStats: { damage: 32, range: 110, attackSpeed: 0.65 },   // 伤害 35→32，射程 120→110，攻速 0.7→0.65
        description: '魔法攻击，伤害较高但攻速较慢'
    },
    ASSASSIN: {
        name: '刺客',
        synergy: 'ASSASSIN',
        baseStats: { damage: 45, range: 75, attackSpeed: 1.4 },     // 伤害 50→45，射程 80→75，攻速 1.5→1.4
        description: '高攻速近战单位'
    },
    TANK: {
        name: '坦克',
        synergy: 'GUARDIAN',
        baseStats: { damage: 13, range: 85, attackSpeed: 0.75 },    // 伤害 15→13，射程 90→85，攻速 0.8→0.75
        description: '重型攻击单位，攻击稳定可靠'
    },
    SUPPORT: {
        name: '辅助',
        synergy: 'MYSTIC',
        baseStats: { damage: 8, range: 95, attackSpeed: 1.1 },      // 伤害 10→8，射程 100→95，攻速 1.2→1.1
        description: '提供增益效果'
    }
};

// 羁绊效果
export const SYNERGIES = {
    MARKSMAN: {
        name: '神射手',
        levels: [
            { count: 2, effect: '攻击速度+25%' },
            { count: 4, effect: '攻击速度+50%，攻击有20%几率造成双倍伤害' },
            { count: 6, effect: '攻击速度+75%，攻击有35%几率造成双倍伤害' }
        ]
    },
    MAGE: {
        name: '法师',
        levels: [
            { count: 2, effect: '法术伤害+30%' },
            { count: 4, effect: '法术伤害+60%，技能有25%几率不消耗蓝' },
            { count: 6, effect: '法术伤害+100%，技能有50%几率不消耗蓝' }
        ]
    },
    ASSASSIN: {
        name: '刺客',
        levels: [
            { count: 2, effect: '暴击几率+20%' },
            { count: 4, effect: '暴击几率+35%，暴击伤害+50%' },
            { count: 6, effect: '暴击几率+50%，暴击伤害+100%' }
        ]
    },
    GUARDIAN: {
        name: '守护者',
        levels: [
            { count: 2, effect: '生命值+50%' },
            { count: 4, effect: '生命值+100%，受到伤害减少20%' },
            { count: 6, effect: '生命值+150%，受到伤害减少35%' }
        ]
    },
    MYSTIC: {
        name: '秘术师',
        levels: [
            { count: 2, effect: '所有友军魔法抗性+25' },
            { count: 4, effect: '所有友军魔法抗性+50，每秒回复2%生命值' },
            { count: 6, effect: '所有友军魔法抗性+75，每秒回复4%生命值' }
        ]
    }
};

// 波次配置
export const WAVE_CONFIG = {
    MONSTER_HEALTH_SCALE: 1.28,  // 提高血量增长系数 1.2→1.28
    MONSTER_SPEED_SCALE: 1.06,   // 提高速度增长系数 1.05→1.06
    BOSS_WAVE: 20,
    TOTAL_WAVES: 20
};

// 游戏经济配置
export const ECONOMY_CONFIG = {
    STARTING_GOLD: 35,          // 降低初始金币 50→35
    WAVE_REWARD: 8,             // 降低波次奖励 10→8
    GOLD_PER_WAVE: 8,           // 降低每波奖励 10→8
    GOLD_PER_KILL: 1,
    INTEREST_RATE: 0.1,
    MAX_INTEREST: 5,
    TOWER_SHOP_COST: 18,        // 提高塔的价格 15→18
    REFRESH_COST: 3,            // 提高刷新费用 2→3
    STARTING_LEVEL: 1,
    UPGRADE_COST_BASE: 50,
    // 经验系统配置
    EXP_PER_BUTTON_CLICK: 4,
    EXP_PER_WAVE_END: 2,
    EXP_BUTTON_COST: 5          // 提高经验按钮费用 4→5
};

// 经验等级系统
export const EXPERIENCE_CONFIG = {
    // 计算每个等级需要的经验值
    getExpRequiredForLevel: (level) => {
        // 等级1需要12经验，之后每级递增6经验
        // 等级1: 12, 等级2: 18, 等级3: 24, 等级4: 30...
        return 6 + (level * 6);
    },
    
    // 获取总共需要的经验值（从1级到目标等级）
    getTotalExpRequiredForLevel: (targetLevel) => {
        let totalExp = 0;
        for (let level = 1; level <= targetLevel; level++) {
            totalExp += EXPERIENCE_CONFIG.getExpRequiredForLevel(level);
        }
        return totalExp;
    }
};

// 装备系统配置
export const EQUIPMENT_CONFIG = {
    // 基础装备定义
    BASIC_ITEMS: {
        BOW: {
            id: 'BOW',
            name: '反曲之弓',
            description: '+15% 攻击速度',
            icon: '🏹',
            dropChance: 0.15,
            effect: { attackSpeed: 0.15 }
        },
        ROD: {
            id: 'ROD',
            name: '无用大棒',
            description: '+15% 技能/攻击伤害',
            icon: '🪄',
            dropChance: 0.15,
            effect: { damage: 0.15 }
        },
        BELT: {
            id: 'BELT',
            name: '巨人腰带',
            description: '+10% 攻击伤害',
            icon: '🥊',
            dropChance: 0.15,
            effect: { damage: 0.10 }
        },
        TEAR: {
            id: 'TEAR',
            name: '女神之泪',
            description: '+5% 射程，+5% 攻击速度',
            icon: '💧',
            dropChance: 0.15,
            effect: { range: 0.05, attackSpeed: 0.05 }
        },
        ARMOR: {
            id: 'ARMOR',
            name: '锁子甲',
            description: '+12% 攻击速度',
            icon: '⚔️',
            dropChance: 0.15,
            effect: { attackSpeed: 0.12 }
        },
        CLOAK: {
            id: 'CLOAK',
            name: '负极斗篷',
            description: '+8% 射程',
            icon: '🧙‍♂️',
            dropChance: 0.15,
            effect: { range: 0.08 }
        },
        SWORD: {
            id: 'SWORD',
            name: '暴风大剑',
            description: '+20 攻击力',
            icon: '⚔️',
            dropChance: 0.15,
            effect: { damage: 20 }
        },
        SHOVEL: {
            id: 'SHOVEL',
            name: '金铲铲',
            description: '特殊装备，用于改变塔的羁绊',
            icon: '🪚',
            dropChance: 0.05,
            effect: { special: 'synergy_change' }
        }
    },

    // 高级装备合成公式
    RECIPES: {
        // 反曲之弓合成
        'BOW+BOW': {
            id: 'RAPID_FIRECANNON',
            name: '疾射火炮',
            description: '射程翻倍',
            icon: '🎯',
            effect: { range: 2.0 },
            components: ['BOW', 'BOW']
        },
        'BOW+SWORD': {
            id: 'INFINITY_EDGE',
            name: '无尽之刃',
            description: '暴击率+50%，暴击伤害+50%',
            icon: '⚡',
            effect: { critChance: 0.5, critDamage: 0.5 },
            components: ['BOW', 'SWORD']
        },
        
        // 无用大棒合成
        'ROD+SWORD': {
            id: 'HEXTECH_GUNBLADE',
            name: '海克斯科技枪',
            description: '攻击附带25%吸血效果',
            icon: '🩸',
            effect: { lifesteal: 0.25 },
            components: ['ROD', 'SWORD']
        },
        'ROD+ROD': {
            id: 'RABADONS_DEATHCAP',
            name: '灭世者的死亡之帽',
            description: '法术强度+80%',
            icon: '🎩',
            effect: { spellPower: 0.8 },
            components: ['ROD', 'ROD']
        },
        
        // 巨人腰带合成
        'BELT+BELT': {
            id: 'WARMOGS_ARMOR',
            name: '狂徒铠甲',
            description: '每秒回复5%最大生命值',
            icon: '💚',
            effect: { healthRegen: 0.05 },
            components: ['BELT', 'BELT']
        },
        'BELT+ARMOR': {
            id: 'THORNMAIL',
            name: '反甲',
            description: '受到伤害时反弹30%给攻击者',
            icon: '🔱',
            effect: { thorns: 0.3 },
            components: ['BELT', 'ARMOR']
        },
        
        // 女神之泪合成
        'TEAR+TEAR': {
            id: 'SERAPHS_EMBRACE',
            name: '炽天使之拥',
            description: '法力值上限+100%，获得护盾',
            icon: '🛡️',
            effect: { maxMana: 1.0, shield: true },
            components: ['TEAR', 'TEAR']
        },
        
        // 金铲铲合成（羁绊改变）
        'SHOVEL+BOW': {
            id: 'BLADE_OF_RUINED_KING',
            name: '破败王者之刃',
            description: '使携带者额外获得刺客羁绊',
            icon: '👑',
            effect: { addSynergy: 'ASSASSIN' },
            components: ['SHOVEL', 'BOW']
        },
        'SHOVEL+TEAR': {
            id: 'SORCERERS_HAT',
            name: '法师之帽',
            description: '使携带者额外获得法师羁绊',
            icon: '🧙',
            effect: { addSynergy: 'MAGE' },
            components: ['SHOVEL', 'TEAR']
        }
    },

    // 装备槽位限制
    MAX_EQUIPMENT_PER_TOWER: 3,
    INVENTORY_SIZE: 8
};

// 怪物词缀系统配置
export const MONSTER_MODIFIERS = {
    // 词缀定义
    MODIFIERS: {
        ARMORED: {
            id: 'ARMORED',
            name: '重甲',
            description: '物理伤害减免50%',
            icon: '🛡️',
            color: 0x888888,
            probability: 0.15,
            effect: { physicalResist: 0.5 }
        },
        MAGIC_IMMUNE: {
            id: 'MAGIC_IMMUNE',
            name: '魔免',
            description: '技能/魔法伤害减免50%',
            icon: '🔮',
            color: 0x8000ff,
            probability: 0.15,
            effect: { magicResist: 0.5 }
        },
        SWIFT: {
            id: 'SWIFT',
            name: '迅捷',
            description: '移动速度提高50%',
            icon: '💨',
            color: 0x00ffff,
            probability: 0.2,
            effect: { speedMultiplier: 1.5 }
        },
        REGENERATION: {
            id: 'REGENERATION',
            name: '再生',
            description: '每秒恢复3%最大生命值',
            icon: '💚',
            color: 0x00ff00,
            probability: 0.1,
            effect: { healthRegen: 0.03 }
        },
        SUMMONER: {
            id: 'SUMMONER',
            name: '召唤',
            description: '死亡时，在原地召唤2只小型怪物',
            icon: '👻',
            color: 0xff00ff,
            probability: 0.08,
            effect: { summonOnDeath: { count: 2, type: 'minion' } }
        },
        SILENCE: {
            id: 'SILENCE',
            name: '沉默',
            description: '周期性地使其周围的一个塔沉默（无法攻击）2秒',
            icon: '🤐',
            color: 0xffaa00,
            probability: 0.1,
            effect: { silenceAura: { range: 80, duration: 2000, interval: 5000 } }
        },
        TELEPORT: {
            id: 'TELEPORT',
            name: '传送',
            description: '生命值低于50%时，向前闪烁一小段距离',
            icon: '⚡',
            color: 0xffff00,
            probability: 0.12,
            effect: { teleportThreshold: 0.5, teleportDistance: 100 }
        }
    },

    // 精英怪出现概率
    ELITE_SPAWN_CHANCE: {
        1: 0.08,   // 第1-5波：8% (原5%)
        6: 0.15,   // 第6-10波：15% (原10%)
        11: 0.22,  // 第11-15波：22% (原15%)
        16: 0.32   // 第16+波：32% (原25%)
    },

    // 精英怪词缀数量
    ELITE_MODIFIER_COUNT: {
        min: 1,
        max: 2,
        bossMin: 2,
        bossMax: 3
    }
};

// 地图配置
export const MAP_CONFIG = {
    TILE_SIZE: 40,
    BOARD_WIDTH: 16,
    BOARD_HEIGHT: 12,
    PATH_WIDTH: 2,
    
    // 多张地图配置
    MAPS: {
        STRAIGHT: {
            id: 'STRAIGHT',
            name: '直线之路',
            description: '最简单的地图，怪物从左到右直线前进',
            pathPoints: [
                { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 },
                { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 },
                { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 },
                { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 }, { x: 15, y: 6 }
            ]
        },
        
        ZIGZAG: {
            id: 'ZIGZAG',
            name: '之字形路径',
            description: '蜿蜒曲折的路径，增加策略深度',
            pathPoints: [
                { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
                { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 },
                { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 }, { x: 11, y: 2 },
                { x: 11, y: 3 }, { x: 11, y: 4 }, { x: 11, y: 5 }, { x: 11, y: 6 },
                { x: 11, y: 7 }, { x: 11, y: 8 }, { x: 11, y: 9 },
                { x: 12, y: 9 }, { x: 13, y: 9 }, { x: 14, y: 9 }, { x: 15, y: 9 }
            ]
        },

        SPIRAL: {
            id: 'SPIRAL',
            name: '螺旋迷宫',
            description: '极具挑战性的螺旋路径，考验你的策略布局',
            pathPoints: [
                // 从左边进入
                { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 },
                // 向上
                { x: 3, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 3 }, { x: 3, y: 2 },
                // 向右
                { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 },
                { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 }, { x: 11, y: 2 },
                { x: 12, y: 2 },
                // 向下
                { x: 12, y: 3 }, { x: 12, y: 4 }, { x: 12, y: 5 }, { x: 12, y: 6 },
                { x: 12, y: 7 }, { x: 12, y: 8 }, { x: 12, y: 9 },
                // 向左
                { x: 11, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 9 }, { x: 8, y: 9 },
                { x: 7, y: 9 }, { x: 6, y: 9 }, { x: 5, y: 9 },
                // 向上（内圈）
                { x: 5, y: 8 }, { x: 5, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 5 },
                { x: 5, y: 4 },
                // 向右（内圈）
                { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 9, y: 4 },
                { x: 10, y: 4 },
                // 向下（内圈）
                { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 },
                // 向左（最内圈）
                { x: 9, y: 7 }, { x: 8, y: 7 }, { x: 7, y: 7 },
                // 向上到中心然后出去
                { x: 7, y: 6 }, { x: 7, y: 5 },
                // 最终出口
                { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 5 }, { x: 11, y: 5 },
                { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 }, { x: 15, y: 5 }
            ]
        },

        DOUBLE_LANE: {
            id: 'DOUBLE_LANE',
            name: '双线战场',
            description: '两条并行路径同时进攻，分散你的防御力量',
            pathPoints: [
                // 上路
                { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
                { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
                { x: 8, y: 3 }, { x: 9, y: 3 }, { x: 10, y: 3 }, { x: 11, y: 3 },
                { x: 12, y: 3 }, { x: 13, y: 3 }, { x: 14, y: 3 }, { x: 15, y: 3 },
                // 连接到下路
                { x: 15, y: 4 }, { x: 15, y: 5 }, { x: 15, y: 6 }, { x: 15, y: 7 },
                { x: 15, y: 8 }, { x: 15, y: 9 },
                // 下路（逆向）
                { x: 14, y: 9 }, { x: 13, y: 9 }, { x: 12, y: 9 }, { x: 11, y: 9 },
                { x: 10, y: 9 }, { x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 },
                { x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }, { x: 3, y: 9 },
                { x: 2, y: 9 }, { x: 1, y: 9 }, { x: 0, y: 9 }
            ]
        },

        CROSSROADS: {
            id: 'CROSSROADS',
            name: '十字路口',
            description: '四个方向的路径交汇，策略布局的终极考验',
            pathPoints: [
                // 从左进入
                { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 },
                { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 },
                // 中心十字路口
                { x: 8, y: 6 },
                // 向上走
                { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 },
                { x: 8, y: 1 }, { x: 8, y: 0 },
                // 从上回到中心
                { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 },
                { x: 8, y: 5 }, { x: 8, y: 6 },
                // 向右走
                { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 },
                { x: 13, y: 6 }, { x: 14, y: 6 }, { x: 15, y: 6 },
                // 从右回到中心
                { x: 14, y: 6 }, { x: 13, y: 6 }, { x: 12, y: 6 }, { x: 11, y: 6 },
                { x: 10, y: 6 }, { x: 9, y: 6 }, { x: 8, y: 6 },
                // 向下走
                { x: 8, y: 7 }, { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 8, y: 10 },
                { x: 8, y: 11 },
                // 最终出口（从下往右）
                { x: 9, y: 11 }, { x: 10, y: 11 }, { x: 11, y: 11 }, { x: 12, y: 11 },
                { x: 13, y: 11 }, { x: 14, y: 11 }, { x: 15, y: 11 }
            ]
        },

        SNAKE_PATH: {
            id: 'SNAKE_PATH',
            name: '蛇形迷踪',
            description: '蜿蜒如蛇的复杂路径，考验塔的射程覆盖',
            pathPoints: [
                // 第一段：从左向右
                { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
                { x: 4, y: 2 }, { x: 5, y: 2 },
                // 向下转弯
                { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 },
                // 向左折回
                { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 },
                // 继续向下
                { x: 1, y: 6 }, { x: 1, y: 7 }, { x: 1, y: 8 },
                // 向右转
                { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 },
                { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 9, y: 8 },
                // 向上转
                { x: 9, y: 7 }, { x: 9, y: 6 }, { x: 9, y: 5 }, { x: 9, y: 4 },
                // 向右继续
                { x: 10, y: 4 }, { x: 11, y: 4 }, { x: 12, y: 4 }, { x: 13, y: 4 },
                // 最后向下到出口
                { x: 13, y: 5 }, { x: 13, y: 6 }, { x: 13, y: 7 }, { x: 13, y: 8 },
                { x: 13, y: 9 },
                // 最终出口
                { x: 14, y: 9 }, { x: 15, y: 9 }
            ]
        },

        BOTTLENECK: {
            id: 'BOTTLENECK',
            name: '瓶颈要塞',
            description: '多个狭窄通道，形成天然的防御瓶颈',
            pathPoints: [
                // 宽阔入口
                { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 },
                // 第一个瓶颈
                { x: 4, y: 6 }, { x: 5, y: 6 },
                // 扩散
                { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 },
                // 向上分支
                { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 },
                // 向右
                { x: 9, y: 3 }, { x: 10, y: 3 },
                // 向下汇合
                { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 },
                // 继续主路
                { x: 11, y: 6 },
                // 第二个瓶颈（向下分支）
                { x: 11, y: 7 }, { x: 11, y: 8 }, { x: 11, y: 9 },
                // 向右
                { x: 12, y: 9 }, { x: 13, y: 9 },
                // 向上汇合到主路
                { x: 13, y: 8 }, { x: 13, y: 7 }, { x: 13, y: 6 },
                // 最终直线冲刺
                { x: 14, y: 6 }, { x: 15, y: 6 }
            ]
        },

        MAZE_RUNNER: {
            id: 'MAZE_RUNNER',
            name: '迷宫行者',
            description: '错综复杂的迷宫路径，没有明显的防御重点',
            pathPoints: [
                // 从下方进入
                { x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 },
                // 向上
                { x: 2, y: 9 }, { x: 2, y: 8 }, { x: 2, y: 7 }, { x: 2, y: 6 },
                // 向右
                { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
                // 向上
                { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 },
                // 向右
                { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 }, { x: 9, y: 3 },
                // 向下
                { x: 9, y: 4 }, { x: 9, y: 5 }, { x: 9, y: 6 }, { x: 9, y: 7 },
                { x: 9, y: 8 },
                // 向左
                { x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 },
                // 向下
                { x: 6, y: 9 }, { x: 6, y: 10 },
                // 向右
                { x: 7, y: 10 }, { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 10, y: 10 },
                { x: 11, y: 10 },
                // 向上
                { x: 11, y: 9 }, { x: 11, y: 8 }, { x: 11, y: 7 }, { x: 11, y: 6 },
                { x: 11, y: 5 }, { x: 11, y: 4 }, { x: 11, y: 3 }, { x: 11, y: 2 },
                { x: 11, y: 1 },
                // 最终向右出口
                { x: 12, y: 1 }, { x: 13, y: 1 }, { x: 14, y: 1 }, { x: 15, y: 1 }
            ]
        },

        FORTRESS: {
            id: 'FORTRESS',
            name: '要塞防线',
            description: '多层防御的要塞结构，考验层次化防御策略',
            pathPoints: [
                // 外围防线
                { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 },
                // 向上进入第一道防线
                { x: 3, y: 7 }, { x: 3, y: 6 }, { x: 3, y: 5 },
                // 向右穿过第一道防线
                { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
                // 向下到第二层
                { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 }, { x: 7, y: 9 },
                // 向右穿过第二道防线
                { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 11, y: 9 },
                // 向上到第三层
                { x: 11, y: 8 }, { x: 11, y: 7 }, { x: 11, y: 6 }, { x: 11, y: 5 },
                { x: 11, y: 4 }, { x: 11, y: 3 },
                // 最终冲刺
                { x: 12, y: 3 }, { x: 13, y: 3 }, { x: 14, y: 3 }, { x: 15, y: 3 }
            ]
        },

        RIVER: {
            id: 'RIVER',
            name: '河流弯道',
            description: '沿着河流蜿蜒前进，多个急转弯考验塔的覆盖范围',
            pathPoints: [
                // 河流起点
                { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 9 },
                // 第一个弯道（向上）
                { x: 3, y: 8 }, { x: 3, y: 7 }, { x: 3, y: 6 }, { x: 3, y: 5 },
                { x: 3, y: 4 }, { x: 3, y: 3 },
                // 向右流淌
                { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
                // 第二个弯道（向下）
                { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 },
                // 向右继续
                { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 },
                // 第三个弯道（向上）
                { x: 10, y: 6 }, { x: 10, y: 5 }, { x: 10, y: 4 },
                // 向右流向终点
                { x: 11, y: 4 }, { x: 12, y: 4 }, { x: 13, y: 4 },
                // 最后一个弯道（向下到出口）
                { x: 13, y: 5 }, { x: 13, y: 6 }, { x: 13, y: 7 }, { x: 13, y: 8 },
                // 河流终点
                { x: 14, y: 8 }, { x: 15, y: 8 }
            ]
        },

        TEMPLE: {
            id: 'TEMPLE',
            name: '神殿迷宫',
            description: '古老神殿的神秘通道，充满挑战的回环路径',
            pathPoints: [
                // 神殿入口
                { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 },
                // 进入神殿大厅
                { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
                // 向上到神殿上层
                { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 },
                // 在上层向右移动
                { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 },
                { x: 10, y: 2 },
                // 向下到中层
                { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 },
                // 在中层向左回环
                { x: 9, y: 6 }, { x: 8, y: 6 }, { x: 7, y: 6 },
                // 向下到神殿下层
                { x: 7, y: 7 }, { x: 7, y: 8 }, { x: 7, y: 9 }, { x: 7, y: 10 },
                // 在下层向右
                { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 10, y: 10 }, { x: 11, y: 10 },
                { x: 12, y: 10 },
                // 向上到出口层
                { x: 12, y: 9 }, { x: 12, y: 8 }, { x: 12, y: 7 }, { x: 12, y: 6 },
                { x: 12, y: 5 },
                // 神殿出口
                { x: 13, y: 5 }, { x: 14, y: 5 }, { x: 15, y: 5 }
            ]
        }
    },
    
    // 随机选择地图
    getRandomMap: () => {
        const mapKeys = Object.keys(MAP_CONFIG.MAPS);
        const randomIndex = Math.floor(Math.random() * mapKeys.length);
        return MAP_CONFIG.MAPS[mapKeys[randomIndex]];
    },

    getDifficultyText(mapId) {
        switch (mapId) {
            case 'STRAIGHT': return '★☆☆ 简单';
            case 'ZIGZAG': return '★★☆ 中等';
            case 'SPIRAL': return '★★★ 困难';
            case 'DOUBLE_LANE': return '★★★ 困难';
            case 'CROSSROADS': return '★★★ 困难';
            case 'SNAKE_PATH': return '★★★ 困难';
            case 'BOTTLENECK': return '★★★ 困难';
            case 'MAZE_RUNNER': return '★★★ 困难';
            case 'FORTRESS': return '★★☆ 中等';
            case 'RIVER': return '★★☆ 中等';
            case 'TEMPLE': return '★★★ 困难';
            default: return '★☆☆ 未知';
        }
    },

    getDifficultyColor(mapId) {
        switch (mapId) {
            case 'STRAIGHT': return '#00ff00';
            case 'ZIGZAG': return '#ffaa00';
            case 'SPIRAL': return '#ff4444';
            case 'DOUBLE_LANE': return '#ff4444';
            case 'CROSSROADS': return '#ff4444';
            case 'SNAKE_PATH': return '#ff4444';
            case 'BOTTLENECK': return '#ff4444';
            case 'MAZE_RUNNER': return '#ff4444';
            case 'FORTRESS': return '#ffaa00';
            case 'RIVER': return '#ffaa00';
            case 'TEMPLE': return '#ff4444';
            default: return '#ffffff';
        }
    }
}; 