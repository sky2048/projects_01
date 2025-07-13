export class NotificationUI {
    constructor(scene) {
        this.scene = scene;
        this.notifications = [];
        this.itemNotifications = [];
        this.notificationY = 200;
        this.itemNotificationY = 100;
    }

    create() {
        // 通知系统已准备就绪，不需要创建UI元素
    }

    showNotification(message, type = 'info', duration = 2000, position = 'center') {
        // 判断是否为物品相关提示（显示在左侧）
        const isItemNotification = message.includes('获得装备') || 
                                  message.includes('合成装备') || 
                                  message.includes('装备已装备') ||
                                  message.includes('装备背包') ||
                                  message.includes('装备槽位') ||
                                  message.includes('获得') && message.includes('金币') ||
                                  message.includes('返还') && message.includes('金币') ||
                                  message.includes('金币奖励') ||
                                  position === 'left';

        if (isItemNotification) {
            this.showItemNotification(message, type, duration);
            return;
        }

        // 定义不同类型的颜色
        const colors = {
            'info': '#ffffff',
            'warning': '#ffaa00',
            'error': '#ff4444',
            'success': '#44ff44'
        };
        
        const bgColors = {
            'info': 0x333333,
            'warning': 0x664400,
            'error': 0x441111,
            'success': 0x114411
        };

        // 创建提示背景
        const bg = this.scene.add.rectangle(640, this.notificationY, 400, 50, bgColors[type], 0.9);
        bg.setStrokeStyle(2, 0x666666);
        
        // 创建提示文字
        const text = this.scene.add.text(640, this.notificationY, message, {
            fontSize: '16px',
            fill: colors[type],
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            wordWrap: { width: 380 }
        });
        text.setOrigin(0.5);

        // 添加到提示列表
        const notification = { bg, text, startY: this.notificationY };
        this.notifications.push(notification);
        
        // 更新下一个提示的位置
        this.notificationY += 60;

        // 淡入动画
        bg.setAlpha(0);
        text.setAlpha(0);
        
        this.scene.tweens.add({
            targets: [bg, text],
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });

        // 自动消失
        this.scene.time.delayedCall(duration, () => {
            this.hideNotification(notification);
        });
    }

    showItemNotification(message, type = 'info', duration = 2000) {
        // 定义不同类型的颜色
        const colors = {
            'info': '#ffffff',
            'warning': '#ffaa00',
            'error': '#ff4444',
            'success': '#44ff44'
        };
        
        const bgColors = {
            'info': 0x333333,
            'warning': 0x664400,
            'error': 0x441111,
            'success': 0x114411
        };

        // 左侧位置：X=200，小尺寸
        const bg = this.scene.add.rectangle(200, this.itemNotificationY, 280, 40, bgColors[type], 0.85);
        bg.setStrokeStyle(1, 0x666666);
        
        // 创建提示文字
        const text = this.scene.add.text(200, this.itemNotificationY, message, {
            fontSize: '14px',
            fill: colors[type],
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            wordWrap: { width: 260 }
        });
        text.setOrigin(0.5);

        // 添加到物品提示列表
        const notification = { bg, text, startY: this.itemNotificationY };
        this.itemNotifications.push(notification);
        
        // 更新下一个提示的位置
        this.itemNotificationY += 50;

        // 淡入动画
        bg.setAlpha(0);
        text.setAlpha(0);
        
        this.scene.tweens.add({
            targets: [bg, text],
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });

        // 自动消失
        this.scene.time.delayedCall(duration, () => {
            this.hideItemNotification(notification);
        });
    }

    hideNotification(notification) {
        if (!notification.bg || !notification.text) return;

        // 淡出动画
        this.scene.tweens.add({
            targets: [notification.bg, notification.text],
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // 销毁元素
                if (notification.bg) notification.bg.destroy();
                if (notification.text) notification.text.destroy();
                
                // 从列表中移除
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
                
                // 重新排列剩余提示
                this.rearrangeNotifications();
            }
        });
    }

    rearrangeNotifications() {
        this.notificationY = 200;
        
        this.notifications.forEach((notification, index) => {
            const targetY = 200 + index * 60;
            
            if (notification.bg && notification.text) {
                this.scene.tweens.add({
                    targets: [notification.bg, notification.text],
                    y: targetY,
                    duration: 300,
                    ease: 'Power2'
                });
            }
        });
        
        this.notificationY = 200 + this.notifications.length * 60;
    }

    hideItemNotification(notification) {
        if (!notification.bg || !notification.text) return;

        // 淡出动画
        this.scene.tweens.add({
            targets: [notification.bg, notification.text],
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // 销毁元素
                if (notification.bg) notification.bg.destroy();
                if (notification.text) notification.text.destroy();
                
                // 从列表中移除
                const index = this.itemNotifications.indexOf(notification);
                if (index > -1) {
                    this.itemNotifications.splice(index, 1);
                }
                
                // 重新排列剩余提示
                this.rearrangeItemNotifications();
            }
        });
    }

    rearrangeItemNotifications() {
        this.itemNotificationY = 100;
        
        this.itemNotifications.forEach((notification, index) => {
            const targetY = 100 + index * 50;
            
            if (notification.bg && notification.text) {
                this.scene.tweens.add({
                    targets: [notification.bg, notification.text],
                    y: targetY,
                    duration: 300,
                    ease: 'Power2'
                });
            }
        });
        
        this.itemNotificationY = 100 + this.itemNotifications.length * 50;
    }

    // 波次提示系统
    showWaveNotification(wave, isStart = true, customText = null) {
        if (isStart) {
            let message, type, duration;
            
            if (customText) {
                // 使用自定义文本
                message = `第 ${wave} 波开始！${customText}`;
                
                // 根据内容判断类型
                if (customText.includes('Boss') || customText.includes('BOSS')) {
                    type = 'error';
                    duration = 3000;
                } else if (customText.includes('成长') || customText.includes('选择')) {
                    type = 'warning';
                    duration = 2500;
                } else if (customText.includes('高压') || customText.includes('挑战')) {
                    type = 'warning';
                    duration = 2500;
                } else {
                    type = 'info';
                    duration = 2000;
                }
            } else {
                // 兼容旧版本逻辑
                if (wave === 30 || wave === 24 || wave === 18) {
                    message = `第 ${wave} 波开始！BOSS波次！`;
                    type = 'error';
                    duration = 3000;
                } else if ([4, 10, 16, 22, 28].includes(wave)) {
                    message = `第 ${wave} 波开始！成长选择！`;
                    type = 'warning';
                    duration = 2500;
                } else {
                    message = `第 ${wave} 波开始`;
                    type = 'info';
                    duration = 2000;
                }
            }
            
            this.showNotification(message, type, duration, 'center');
        } else {
            if ([18, 24, 30].includes(wave)) {
                this.showNotification('恭喜！击败了BOSS！', 'success', 3000, 'center');
            } else {
                this.showNotification(`第 ${wave} 波完成`, 'success', 1500, 'center');
            }
        }
    }

    // 清理所有通知
    clearAllNotifications() {
        // 清理普通通知
        this.notifications.forEach(notification => {
            if (notification.bg) notification.bg.destroy();
            if (notification.text) notification.text.destroy();
        });
        this.notifications = [];
        this.notificationY = 200;

        // 清理物品通知
        this.itemNotifications.forEach(notification => {
            if (notification.bg) notification.bg.destroy();
            if (notification.text) notification.text.destroy();
        });
        this.itemNotifications = [];
        this.itemNotificationY = 100;
    }
} 