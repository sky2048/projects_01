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