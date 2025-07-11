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