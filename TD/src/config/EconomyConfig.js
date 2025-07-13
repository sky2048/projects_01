// 游戏经济配置
export const ECONOMY_CONFIG = {
    STARTING_GOLD: 35,          // 降低初始金币 50→35
    WAVE_REWARD: 8,             // 降低波次奖励 10→8
    GOLD_PER_WAVE: 8,           // 降低每波奖励 10→8
    GOLD_PER_KILL: 1,
    INTEREST_RATE: 0.1,
    MAX_INTEREST: 5,
    TOWER_SHOP_COST: 18,        // 提高塔的价格 15→18
    REFRESH_COST: 2,            // 刷新费用
    STARTING_LEVEL: 1,
    UPGRADE_COST_BASE: 50,
    // 经验系统配置
    EXP_PER_BUTTON_CLICK: 4,
    EXP_PER_WAVE_END: 2,
    EXP_BUTTON_COST: 4          // 经验按钮费用
};

// 经验等级系统
export const EXPERIENCE_CONFIG = {
    // 计算每个等级需要的经验值
    getExpRequiredForLevel: (level) => {
        // 安全检查：确保level是有效的数字
        if (typeof level !== 'number' || isNaN(level) || level < 1) {
            console.warn('getExpRequiredForLevel: 无效的等级参数', level);
            return 12; // 返回1级的经验需求作为默认值
        }
        
        // 等级1需要12经验，之后每级递增6经验
        // 等级1: 12, 等级2: 18, 等级3: 24, 等级4: 30...
        return 6 + (level * 6);
    },
    
    // 获取总共需要的经验值（从1级到目标等级）
    getTotalExpRequiredForLevel: (targetLevel) => {
        // 安全检查：确保targetLevel是有效的数字
        if (typeof targetLevel !== 'number' || isNaN(targetLevel) || targetLevel < 1) {
            console.warn('getTotalExpRequiredForLevel: 无效的目标等级参数', targetLevel);
            return 12; // 返回1级的经验需求作为默认值
        }
        
        let totalExp = 0;
        for (let level = 1; level <= targetLevel; level++) {
            totalExp += EXPERIENCE_CONFIG.getExpRequiredForLevel(level);
        }
        return totalExp;
    }
}; 