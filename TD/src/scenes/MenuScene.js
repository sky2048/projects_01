export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // 创建背景
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // 游戏标题
        const title = this.add.text(640, 200, '自走棋塔防', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        title.setOrigin(0.5);

        // 开始游戏按钮
        const startButton = this.add.rectangle(640, 400, 200, 60, 0x4a90e2);
        const startText = this.add.text(640, 400, '开始游戏', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        startText.setOrigin(0.5);

        // 按钮交互
        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x5ba3f5);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x4a90e2);
        });

        // 游戏说明
        const instructions = this.add.text(640, 500, 
            '游戏说明：\n' +
            '• 购买和放置防御塔抵御怪物入侵\n' +
            '• 相同防御塔可以合成升级\n' +
            '• 不同塔之间有羁绊效果\n' +
            '• 20波后出现BOSS，击败BOSS即可胜利', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            lineSpacing: 5
        });
        instructions.setOrigin(0.5);
    }
} 