// 统一导入所有配置模块
import { TOWER_RARITY, LEVEL_RARITY_MODIFIERS, TOWER_TYPES, SYNERGIES } from './TowerConfig.js';
import { ECONOMY_CONFIG, EXPERIENCE_CONFIG } from './EconomyConfig.js';
import { WAVE_CONFIG, MONSTER_MODIFIERS } from './WaveConfig.js';
import { MAP_CONFIG } from './MapConfig.js';
import { EQUIPMENT_CONFIG } from './EquipmentConfig.js';

// 重新导出所有配置，保持向后兼容性
export {
    // 塔相关配置
    TOWER_RARITY,
    LEVEL_RARITY_MODIFIERS,
    TOWER_TYPES,
    SYNERGIES,
    
    // 经济系统配置
    ECONOMY_CONFIG,
    EXPERIENCE_CONFIG,
    
    // 波次和怪物配置
    WAVE_CONFIG,
    MONSTER_MODIFIERS,
    
    // 地图配置
    MAP_CONFIG,
    
    // 装备配置
    EQUIPMENT_CONFIG
}; 