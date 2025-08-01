# 项目更新日志

## v0.1.4 - 系统重构与新功能

### 🏗️ 架构重构
- **配置系统模块化**: 将原来的单一配置文件拆分为多个专门的配置模块
  - `TowerConfig.js`: 塔的类型、属性、羁绊配置
  - `EconomyConfig.js`: 经济系统配置
  - `WaveConfig.js`: 波次和怪物配置
  - `MapConfig.js`: 地图配置
  - `EquipmentConfig.js`: 装备系统配置
  - `GameConfig.js`: 统一导入所有配置，保持向后兼容性

### ✨ 新功能
- **装备系统**: 全新的装备系统，为塔防游戏增加更多策略深度
  - 8种基础装备：反曲之弓、无用大棒、巨人腰带、女神之泪、锁子甲、负极斗篷、暴风大剑、金铲铲
  - 装备可以为塔提供攻击力、攻击速度、射程等属性加成
  - 装备管理器负责装备的应用和属性重新计算
  - 支持装备的掉落和转移机制

- **策略模式重构**: 塔的攻击系统采用策略模式重构
  - `AttackStrategies.js`: 为不同类型的塔定义专门的攻击策略
  - `AttackStrategyFactory`: 工厂模式创建攻击策略
  - 提高代码的可维护性和扩展性

- **对象池优化**: 引入对象池系统优化性能
  - `ObjectPool.js`: 管理游戏对象的创建和销毁
  - 减少内存分配和垃圾回收的开销

- **怪物词缀系统**: 为怪物增加词缀系统，提高游戏难度和趣味性
  - 精英怪物系统：血量更高、奖励更多
  - 词缀效果：再生、沉默、传送等特殊能力
  - 根据词缀动态调整怪物属性

### 🔄 系统改进
- **塔位系统优化**: 
  - 每级只增加1个塔位（原来是2个），提高升级的价值感
  - 塔位限制检查更加严格，防止超出限制
  - 塔位显示的视觉反馈更加直观

- **删除塔功能增强**: 
  - 删除塔时返还50%的购买费用
  - 删除塔后自动更新怪物路径
  - 修复删除选中塔时的状态清理问题

- **塔合成系统**: 
  - 三合一升级：3个相同类型和品质的塔可以合成更高品质的塔
  - 合成时自动转移装备到保留的塔上
  - 合成后正确清理被删除塔的选中状态

- **Buff系统改进**: 
  - 修复重复buff导致的属性计算错误
  - 基于原始属性值计算buff效果，避免累积错误
  - 改进buff计时器管理，防止内存泄漏

### 📊 平衡性调整
- **经济系统调整**:
  - 初始金币：50 → 35
  - 波次奖励：10 → 8
  - 塔的价格：15 → 18
  - 提高游戏难度，增加资源管理的重要性

- **塔属性平衡**:
  - 弓箭手：伤害 20→18，射程 150→140
  - 法师：伤害 35→32，射程 120→110，攻速 0.7→0.65
  - 刺客：伤害 50→45，射程 80→75，攻速 1.5→1.4
  - 坦克：伤害 15→13，射程 90→85，攻速 0.8→0.75
  - 辅助：伤害 10→8，射程 100→95，攻速 1.2→1.1

### 🐛 BUG修复
- **游戏初始化优化**: 改进场景初始化顺序，减少竞态条件
- **资源清理**: 完善游戏重新开始时的资源清理机制
- **UI更新**: 修复各种UI元素的更新和显示问题
- **内存管理**: 改进对象销毁和内存释放机制

### 🎨 UI/UX改进
- **状态栏视觉升级**: 
  - 梯形背景设计，更具科技感
  - 动态颜色反馈（血量、塔位状态）
  - 数值变化动画效果

- **经验系统UI**: 
  - 经验进度条可视化
  - 品质概率实时显示
  - 升级提示和反馈

- **通知系统**: 
  - 各种游戏事件的通知提示
  - 错误信息的友好显示
  - 成功操作的确认反馈

### 🔧 技术改进
- **代码组织**: 更好的模块化和文件结构
- **错误处理**: 增强的错误处理和降级机制
- **性能优化**: 对象池、事件清理等性能优化
- **可维护性**: 策略模式、配置分离等架构改进

## v0.1.3 - 经验系统重构

### ✨ 新功能
- **全新经验系统**: 将原来的直接升级系统改为经验积累系统
  - 点击升级按钮现在获得4点经验（消耗4金币）
  - 每波结束自动获得2点经验
  - 不同等级需要不同的经验值：等级2需要10经验，等级3需要15经验，等级4需要20经验...
  - 在塔位显示下方添加了经验进度条显示

### 🔄 系统改进
- **升级按钮重新设计**: 从"升级"改为"获得经验"，提供更渐进的成长体验
- **自动升级机制**: 当经验值达到要求时自动升级，无需手动操作
- **经验来源多样化**: 支持多种经验获取方式（按钮购买、波次奖励等）

### 📊 平衡性调整
- 升级不再是一次性大额消费，而是渐进式的小额投资（4金币=4经验，1:1比例）
- 增加了玩家在游戏进程中的选择权和策略深度
- 每波结束的自动经验奖励鼓励玩家坚持到更晚期

## v0.1.0 - 初始版本

### ✨ 新功能
- 搭建了游戏的基本框架，包括菜单、游戏和UI场景。
- 实现了核心的塔防玩法循环：放置塔、怪物生成、自动攻击、生命值和金币系统。
- 引入了自走棋风格的**羁绊系统**，特定的塔组合可以激活强力增益。
- 设计了5种不同类型的塔（弓箭手、法师、刺客、坦克、辅助）和5个品质等级（白、绿、蓝、紫、橙）。
- 创建了随机塔商店，玩家可以购买和刷新塔。
- 实现了怪物波次系统，共20波，包含最终BOSS。

### 🐛 已修复的BUG
- **攻击冷却时间错误**: 修复了塔的攻击冷却时间未与游戏内时间同步的问题，现在塔的攻击速度会正确地随游戏加速/减速而变化。
- **辅助塔增益效果BUG**: 修复了辅助塔的增益效果在重复施加时会导致攻速永久降低的BUG。

### ⚠️ 已知问题
- **游戏启动时存在竞态条件**: 场景和管理器的初始化顺序依赖于固定的时间延迟，在某些情况下可能导致游戏启动失败。
- **新生成怪物的寻路逻辑不正确**: 新生成的怪物不会立即采用最新的动态路径，而是沿固定的直线路径移动。
- **商店刷新存在利用漏洞**: 玩家可以先选择一个稀有塔，然后刷新商店，再将之前选中的塔放置出来。
- **游戏结束/胜利界面处理不当**: 游戏结束时UI场景被暂停，可能导致交互按钮失灵。
