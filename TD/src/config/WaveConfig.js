// 波次配置 - 基于云顶逻辑的30波系统
export const WAVE_CONFIG = {
    MONSTER_HEALTH_SCALE: 1.28,  // 提高血量增长系数 1.2→1.28
    MONSTER_SPEED_SCALE: 1.06,   // 提高速度增长系数 1.05→1.06
    TOTAL_WAVES: 30,
    PHASES: 5, // 5个大阶段
    WAVES_PER_PHASE: 6, // 每个阶段6波
    
    // 特殊波次定义
    SPECIAL_WAVES: {
        // 肉鸽三选一波次（每个阶段的第4波）
        ROGUELIKE_WAVES: [4, 10, 16, 22, 28],
        
        // 特殊挑战波次（每个阶段的第6波，除了后三个阶段是Boss波）
        CHALLENGE_WAVES: [6, 12], // 1-6, 2-6
        
        // Boss波次
        BOSS_WAVES: [18, 24, 30], // 3-6, 4-6, 5-6
        
        // 高压波次（第4、5阶段的第5波）
        HIGH_PRESSURE_WAVES: [23, 29] // 4-5, 5-5
    },
    
    // 波次类型定义
    WAVE_TYPES: {
        NORMAL: 'normal',           // 普通遭遇战
        ROGUELIKE: 'roguelike',     // 肉鸽三选一
        CHALLENGE: 'challenge',     // 特殊挑战
        HIGH_PRESSURE: 'high_pressure', // 高压波
        BOSS: 'boss'                // Boss战
    }
};

// 阶段配置 - 每个阶段的详细设置
export const PHASE_CONFIG = {
    1: {
        name: '前期-铺垫',
        description: '熟悉操作，建立初始防线',
        waves: {
            1: { type: 'normal', name: '遭遇战', description: '普通波次' },
            2: { type: 'normal', name: '遭遇战', description: '普通波次' },
            3: { type: 'normal', name: '遭遇战', description: '普通波次' },
            4: { type: 'roguelike', name: '初次成长', description: '肉鸽三选一 - 第一次核心成长' },
            5: { type: 'normal', name: '遭遇战', description: '普通波次' },
            6: { type: 'challenge', name: '精英集群', description: '特殊挑战波 - 精英怪集群' }
        },
        difficultyMultiplier: 1.0
    },
    2: {
        name: '中期-发展',
        description: '难度稳步上升，考验阵容强度',
        waves: {
            7: { type: 'normal', name: '拉锯战', description: '普通波次' },
            8: { type: 'normal', name: '拉锯战', description: '普通波次' },
            9: { type: 'normal', name: '拉锯战', description: '普通波次' },
            10: { type: 'roguelike', name: '承上启下', description: '肉鸽三选一 - 关键成长点' },
            11: { type: 'normal', name: '拉锯战', description: '普通波次' },
            12: { type: 'challenge', name: '环境事件', description: '特殊挑战波 - 随机环境事件' }
        },
        difficultyMultiplier: 1.2
    },
    3: {
        name: '中期-考验',
        description: '难度显著提升，精英怪携带复杂词缀',
        waves: {
            13: { type: 'normal', name: '攻坚战', description: '普通波次' },
            14: { type: 'normal', name: '攻坚战', description: '普通波次' },
            15: { type: 'normal', name: '攻坚战', description: '普通波次' },
            16: { type: 'roguelike', name: 'Boss准备', description: '肉鸽三选一 - 为第一幕Boss做准备' },
            17: { type: 'high_pressure', name: 'Boss前夕', description: '高压波 - 模拟Boss战压力' },
            18: { type: 'boss', name: '第一幕Boss', description: 'Boss波 - 第一个大型Boss' }
        },
        difficultyMultiplier: 1.5
    },
    4: {
        name: '后期-决战',
        description: '进入游戏后期，普通怪物威胁也极大',
        waves: {
            19: { type: 'normal', name: '决战前夕', description: '普通波次' },
            20: { type: 'normal', name: '决战前夕', description: '普通波次' },
            21: { type: 'normal', name: '决战前夕', description: '普通波次' },
            22: { type: 'roguelike', name: '构筑成型', description: '肉鸽三选一 - 让构筑最终成型' },
            23: { type: 'high_pressure', name: '决战高压', description: '高压波' },
            24: { type: 'boss', name: '第二幕Boss', description: 'Boss波 - 第二个大型Boss' }
        },
        difficultyMultiplier: 2.0
    },
    5: {
        name: '终局-生存',
        description: '最难的考验，混合多种最强精英怪',
        waves: {
            25: { type: 'normal', name: '最终考验', description: '普通波次' },
            26: { type: 'normal', name: '最终考验', description: '普通波次' },
            27: { type: 'normal', name: '最终考验', description: '普通波次' },
            28: { type: 'roguelike', name: '最后希望', description: '肉鸽三选一 - 最后一次强化机会' },
            29: { type: 'high_pressure', name: '毁灭前夕', description: '毁灭前夕波 - 超高强度' },
            30: { type: 'boss', name: '最终Boss', description: '最终Boss波 - 游戏的终极挑战' }
        },
        difficultyMultiplier: 3.0
    }
};

// 肉鸽三选一选项配置
export const ROGUELIKE_OPTIONS = {
    // 装备类强化
    EQUIPMENT_BUFFS: [
        {
            id: 'attack_boost',
            name: '攻击强化',
            description: '所有塔攻击力+25%',
            icon: '⚔️',
            type: 'permanent',
            effect: { damage: 0.25 }
        },
        {
            id: 'speed_boost',
            name: '攻速强化',
            description: '所有塔攻击速度+30%',
            icon: '⚡',
            type: 'permanent',
            effect: { attackSpeed: 0.30 }
        },
        {
            id: 'range_boost',
            name: '射程强化',
            description: '所有塔射程+35%',
            icon: '🎯',
            type: 'permanent',
            effect: { range: 0.35 }
        }
    ],
    
    // 经济类强化
    ECONOMY_BUFFS: [
        {
            id: 'gold_bonus',
            name: '黄金机遇',
            description: '每波额外获得5金币',
            icon: '💰',
            type: 'permanent',
            effect: { goldPerWave: 5 }
        },
        {
            id: 'interest_boost',
            name: '理财专家',
            description: '金币利息翻倍',
            icon: '📈',
            type: 'permanent',
            effect: { interestMultiplier: 2.0 }
        },
        {
            id: 'exp_boost',
            name: '快速成长',
            description: '经验获取+50%',
            icon: '📚',
            type: 'permanent',
            effect: { expMultiplier: 1.5 }
        }
    ],
    
    // 特殊能力
    SPECIAL_ABILITIES: [
        {
            id: 'crit_chance',
            name: '暴击精通',
            description: '所有塔暴击率+20%',
            icon: '💥',
            type: 'permanent',
            effect: { critChance: 0.20 }
        },
        {
            id: 'penetration',
            name: '护甲穿透',
            description: '无视怪物50%护甲',
            icon: '🛡️',
            type: 'permanent',
            effect: { armorPenetration: 0.50 }
        },
        {
            id: 'multi_shot',
            name: '分裂射击',
            description: '15%概率射出分裂弹',
            icon: '🌟',
            type: 'permanent',
            effect: { multiShotChance: 0.15 }
        }
    ],
    
    // 治疗和恢复
    HEALING_BUFFS: [
        {
            id: 'health_restore',
            name: '生命恢复',
            description: '立即恢复20点生命值',
            icon: '❤️',
            type: 'instant',
            effect: { healthRestore: 20 }
        },
        {
            id: 'tower_heal',
            name: '塔防护盾',
            description: '所有塔获得护盾，抵挡下次伤害',
            icon: '🛡️',
            type: 'instant',
            effect: { towerShield: true }
        }
    ]
};

// 环境事件配置
export const ENVIRONMENT_EVENTS = {
    FOG: {
        id: 'fog',
        name: '迷雾',
        description: '所有塔射程-30%，但怪物移动速度-20%',
        icon: '🌫️',
        effect: { 
            towerRangeMultiplier: 0.7,
            monsterSpeedMultiplier: 0.8
        }
    },
    MAGNETIC_FIELD: {
        id: 'magnetic_field',
        name: '磁场紊乱',
        description: '电子塔伤害+50%，但物理塔攻速-25%',
        icon: '⚡',
        effect: {
            magicDamageMultiplier: 1.5,
            physicalAttackSpeedMultiplier: 0.75
        }
    },
    SOLAR_STORM: {
        id: 'solar_storm',
        name: '太阳风暴',
        description: '所有塔攻击力+40%，但每秒消耗1金币',
        icon: '☀️',
        effect: {
            damageMultiplier: 1.4,
            goldCostPerSecond: 1
        }
    },
    GRAVITY_ANOMALY: {
        id: 'gravity_anomaly',
        name: '重力异常',
        description: '怪物移动速度-40%，但血量+60%',
        icon: '🌀',
        effect: {
            monsterSpeedMultiplier: 0.6,
            monsterHealthMultiplier: 1.6
        }
    }
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
        },
        BERSERKER: {
            id: 'BERSERKER',
            name: '狂暴',
            description: '血量低于30%时，移动速度和攻击力翻倍',
            icon: '🔴',
            color: 0xff0000,
            probability: 0.08,
            effect: { berserkerThreshold: 0.3, berserkerMultiplier: 2.0 }
        },
        SPLITTING: {
            id: 'SPLITTING',
            name: '分裂',
            description: '死亡时分裂成2个血量为原来50%的小怪',
            icon: '🔀',
            color: 0xffaaff,
            probability: 0.06,
            effect: { splitOnDeath: { count: 2, healthRatio: 0.5 } }
        }
    },

    // 精英怪出现概率（根据阶段调整）
    ELITE_SPAWN_CHANCE: {
        1: 0.08,   // 第1阶段：8%
        2: 0.15,   // 第2阶段：15%
        3: 0.25,   // 第3阶段：25%
        4: 0.35,   // 第4阶段：35%
        5: 0.45    // 第5阶段：45%
    },

    // 精英怪词缀数量
    ELITE_MODIFIER_COUNT: {
        min: 1,
        max: 2,
        bossMin: 3,
        bossMax: 4
    }
}; 