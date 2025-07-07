export class PathFinder {
    constructor(board, start, end) {
        this.board = board;
        this.start = start;
        this.end = end;
        this.width = board[0].length;
        this.height = board.length;
    }

    // 使用A*算法寻找路径
    findPath() {
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const startKey = `${this.start.x},${this.start.y}`;
        const endKey = `${this.end.x},${this.end.y}`;

        // 初始化起点
        openSet.push(this.start);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(this.start, this.end));

        while (openSet.length > 0) {
            // 找到fScore最小的节点
            let current = openSet.reduce((min, node) => {
                const currentKey = `${node.x},${node.y}`;
                const minKey = `${min.x},${min.y}`;
                return fScore.get(currentKey) < fScore.get(minKey) ? node : min;
            });

            const currentKey = `${current.x},${current.y}`;

            // 到达目标
            if (currentKey === endKey) {
                return this.reconstructPath(cameFrom, current);
            }

            // 移除当前节点
            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(currentKey);

            // 检查邻居节点
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                if (closedSet.has(neighborKey)) continue;
                if (!this.isWalkable(neighbor.x, neighbor.y)) continue;

                const tentativeGScore = gScore.get(currentKey) + 1;

                if (!openSet.some(n => `${n.x},${n.y}` === neighborKey)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore.get(neighborKey)) {
                    continue;
                }

                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, this.end));
            }
        }

        // 找不到路径，返回直线路径作为备用
        return this.getDirectPath();
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentKey = `${current.x},${current.y}`;

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            path.unshift(current);
            currentKey = `${current.x},${current.y}`;
        }

        return path;
    }

    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // 上
            { x: 1, y: 0 },  // 右
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }  // 左
        ];

        for (const dir of directions) {
            const x = node.x + dir.x;
            const y = node.y + dir.y;

            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                neighbors.push({ x, y });
            }
        }

        return neighbors;
    }

    heuristic(a, b) {
        // 曼哈顿距离
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    isWalkable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }

        const tile = this.board[y][x];
        // 路径可以走，但是有塔的地方不能走
        return tile.isPath || !tile.tower;
    }

    getDirectPath() {
        // 直线路径作为备用方案
        const path = [];
        const y = this.start.y;
        
        for (let x = this.start.x; x <= this.end.x; x++) {
            path.push({ x: x, y: y });
        }
        
        return path;
    }

    getWorldPath(path = null) {
        const pathToUse = path || this.findPath();
        return pathToUse.map(point => {
            const tile = this.board[point.y][point.x];
            return {
                x: tile.worldX,
                y: tile.worldY
            };
        });
    }

    // 检查是否有有效路径（用于验证塔的放置）
    hasValidPath() {
        const path = this.findPath();
        return path.length > 0 && 
               path[0].x === this.start.x && path[0].y === this.start.y &&
               path[path.length - 1].x === this.end.x && path[path.length - 1].y === this.end.y;
    }

    isValidPosition(x, y) {
        if (x < 0 || x >= this.board[0].length || y < 0 || y >= this.board.length) {
            return false;
        }
        
        const tile = this.board[y][x];
        return !tile.isPath && !tile.isBlocked && !tile.tower;
    }
} 