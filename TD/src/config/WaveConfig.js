// 波次配置
export const WAVE_CONFIG = {
    MONSTER_HEALTH_SCALE: 1.28,  // 提高血量增长系数 1.2→1.28
    MONSTER_SPEED_SCALE: 1.06,   // 提高速度增长系数 1.05→1.06
    BOSS_WAVE: 20,
    TOTAL_WAVES: 20
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