// 塔的品质配置
export const TOWER_RARITY = {
    WHITE: { name: '白色', color: 0xffffff, probability: 0.6 },
    GREEN: { name: '绿色', color: 0x00ff00, probability: 0.25 },
    BLUE: { name: '蓝色', color: 0x0080ff, probability: 0.1 },
    PURPLE: { name: '紫色', color: 0x8000ff, probability: 0.04 },
    ORANGE: { name: '橙色', color: 0xff8000, probability: 0.01 }
};

// 塔的类型和羁绊
export const TOWER_TYPES = {
    ARCHER: {
        name: '弓箭手',
        synergy: 'MARKSMAN',
        baseStats: { damage: 20, range: 150, attackSpeed: 1.0 },
        description: '基础远程攻击单位'
    },
    MAGE: {
        name: '法师',
        synergy: 'MAGE',
        baseStats: { damage: 35, range: 120, attackSpeed: 0.7 },
        description: '魔法攻击，伤害较高但攻速较慢'
    },
    ASSASSIN: {
        name: '刺客',
        synergy: 'ASSASSIN',
        baseStats: { damage: 50, range: 80, attackSpeed: 1.5 },
        description: '高攻速近战单位'
    },
    TANK: {
        name: '坦克',
        synergy: 'GUARDIAN',
        baseStats: { damage: 15, range: 90, attackSpeed: 0.8 },
        description: '防御型单位，可以阻挡敌人'
    },
    SUPPORT: {
        name: '辅助',
        synergy: 'MYSTIC',
        baseStats: { damage: 10, range: 100, attackSpeed: 1.2 },
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
    MONSTER_HEALTH_SCALE: 1.2, // 每波怪物血量增长系数
    MONSTER_SPEED_SCALE: 1.05, // 每波怪物速度增长系数
    BOSS_WAVE: 20, // BOSS出现的波次
    TOTAL_WAVES: 20 // 总波数
};

// 游戏经济配置
export const ECONOMY_CONFIG = {
    STARTING_GOLD: 50,
    WAVE_REWARD: 10,
    GOLD_PER_WAVE: 10,
    GOLD_PER_KILL: 1,
    INTEREST_RATE: 0.1,
    MAX_INTEREST: 5,
    TOWER_SHOP_COST: 15,
    REFRESH_COST: 2,
    STARTING_LEVEL: 1,
    UPGRADE_COST_BASE: 50
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
            description: '+150 生命值',
            icon: '🛡️',
            dropChance: 0.15,
            effect: { health: 150 }
        },
        TEAR: {
            id: 'TEAR',
            name: '女神之泪',
            description: '初始法力值+15，攻击时额外回复法力',
            icon: '💧',
            dropChance: 0.15,
            effect: { mana: 15, manaRegen: 0.2 }
        },
        ARMOR: {
            id: 'ARMOR',
            name: '锁子甲',
            description: '+20 物理护甲',
            icon: '⚔️',
            dropChance: 0.15,
            effect: { physicalArmor: 20 }
        },
        CLOAK: {
            id: 'CLOAK',
            name: '负极斗篷',
            description: '+20 魔法抗性',
            icon: '🧙‍♂️',
            dropChance: 0.15,
            effect: { magicResist: 20 }
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
        1: 0.05,   // 第1-5波：5%
        6: 0.1,    // 第6-10波：10%
        11: 0.15,  // 第11-15波：15%
        16: 0.25   // 第16+波：25%
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
    PATH_WIDTH: 2
}; 