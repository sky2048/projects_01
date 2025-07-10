import { GameScene } from './scenes/GameScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
    type: Phaser.WEBGL,  // 强制使用WebGL渲染器
    title: '自走棋塔防 v0.1.2',
    description: '云顶之弈风格的塔防游戏',
    version: '0.1.2',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#1a1a2e',
    pixelArt: false,  // 关闭像素艺术模式
    antialias: true,  // 启用抗锯齿
    scene: [
        MenuScene,
        GameScene,
        UIScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,  // 等比缩放，保持宽高比
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    render: {
        antialias: true,  // 启用抗锯齿
        mipmapFilter: 'LINEAR_MIPMAP_LINEAR',  // 使用高质量纹理过滤
        roundPixels: true,  // 启用像素对齐，提高文字清晰度
        powerPreference: 'high-performance'  // 使用高性能GPU
    }
}

// 输出版本信息
console.log('🎮 自走棋塔防游戏启动');
console.log('📌 版本: v0.1.2');
console.log('🔧 核心修复 (v0.1.0):');
console.log('  ✅ 暂停功能破坏出怪节奏 (使用游戏时间而非真实时间)');
console.log('  ✅ 玩家获得双倍金币 (移除重复的金币奖励逻辑)');
console.log('  ✅ 塔的合成功能完全缺失 (实现自动三合一升星)');
console.log('  ✅ 新怪物寻路AI不正确 (使用动态路径而非固定直线)');
console.log('  ✅ 穿透攻击特性无效 (修复穿透投射物逻辑)');
console.log('  ✅ 游戏启动竞态条件 (重构为可靠的初始化序列)');
console.log('  ✅ 游戏结束流程不完整 (彻底清理所有活动组件)');
console.log('  ✅ 商店刷新利用漏洞 (刷新时清除选中状态)');
console.log('🆕 新功能:');
console.log('  ⭐ 塔的出售/删除功能 (50%金币返还)');
console.log('  ⭐ 完整的合成系统 (相同类型品质三合一自动升星)');
console.log('  ⭐ 橙色弓箭手穿透攻击 (箭矢可穿透多个目标)');
console.log('🔧 细节修复 (v0.1.1):');
console.log('  ✅ 删除塔逻辑缺陷 (移除不合理的路径检查限制)');
console.log('  ✅ 合成塔数据同步 (确保棋盘格引用正确更新)');
console.log('  ✅ 装备合成冲突 (合成时保留或转移装备)');
console.log('  ✅ 召唤位置问题 (终点附近召唤转移到起点)');
console.log('  ✅ 沉默光环逻辑 (避免重复沉默已沉默的塔)');
console.log('🔧 最终修复 (v0.1.2):');
console.log('  ✅ 合成后悬空指针 (清除被删除塔的选中状态)');
console.log('  ✅ 穿透投射物追踪 (连锁式智能追踪取代直线飞行)');

new Phaser.Game(config);
            