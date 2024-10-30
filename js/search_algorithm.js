/**
 * @typedef {Object} Node
 * @property {number} x
 * @property {number} y
 * @property {Node} prev
 */

/**
 * @typedef {Object} _ValueNode
 * @property {ValueNode} prev
 * @property {number} val
 * @typedef {Node & _ValueNode} ValueNode
 *
 */

// 方向
const Directions = [
    [+1, +0], // 右
    [+0, +1], // 下
    [-1, +0], // 左
    [+0, -1], // 上
];

/**
 * 初始化密集数组
 *    Array + fill ······ 稀疏数组
 *    Array.from ········ 性能低
 *
 * @param {number} count
 * @param {*} value
 */
function initData(count, value) {
    const data = [];
    for (let i = 0; i < count; i++) data.push(value);
    return data;
}

/**
 * 根据条件选择一个元素
 *
 * @template T
 * @param {T[]} arr
 * @param {(a:T, b:T) => number} cmp
 * @returns {T | null}
 */
function pick(arr, cmp) {
    if (arr.length <= 0) return null;
    let t = 0;
    let val = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (cmp(arr[t], arr[i]) > 0) {
            t = i;
            val = arr[i];
        }
    }
    arr[t] = arr[arr.length - 1];
    arr.pop();
    return val;
}

/**
 * 边界检查
 * @param {number} rows
 * @param {number} cols
 * @param {number} x
 * @param {number} y
 * @returns
 */
function checkBounds(rows, cols, x, y) {
    return x >= 0 && x < cols && y >= 0 && y < rows;
}

/**
 * 深度优先搜索搜索算法（Deep First Search）
 *    不能保证搜索路径是最短的。但在只有唯一路径的情况下，能获取正确解。
 *
 * @param {Maze} maze
 * @param {Point} s
 * @param {Point} e
 * @returns {MazeSearchResult}
 */
export function dfs(maze, s, e) {
    const { rows, cols, data } = maze;
    if (!checkBounds(rows, cols, s.x, s.y) || !checkBounds(rows, cols, e.x, e.y)) return null;

    // 起始点和终点可访问性检查
    const [si, ei] = [s.x + s.y * cols, e.x + e.y * cols];
    if (data[si] === 0 || data[ei] === 0) return null;

    /** 探索过程 @type {MazeSearchRecord[]} */
    const records = [];

    /** 访问标记 @type {Uint8Array} */
    const visited = new Uint8Array(rows * cols);
    /** 节点栈 @type {Node[]} */
    const stack = [];

    // 初始化，起点入栈
    visited[si] = 1;
    stack.push({ x: s.x, y: s.y, prev: null });

    let target = null;
    while (stack.length > 0) {
        // 出栈
        const curr = stack.pop();
        const { x, y, prev } = curr;
        // 记录搜索路径
        if (prev !== null) records.push({ sx: prev.x, sy: prev.y, ex: x, ey: y });
        // 终点检查
        if (x === e.x && y === e.y) {
            target = curr;
            break;
        }
        // 将可访问的邻近节点加入栈
        for (const [dx, dy] of Directions) {
            const [nx, ny] = [x + dx, y + dy];
            // 边界检查
            if (!checkBounds(rows, cols, nx, ny)) continue;
            const ni = nx + ny * cols;
            // 检查可访问性和访问状态
            if (!data[ni] || visited[ni]) continue;
            // 邻近节点入栈
            visited[ni] = 1;
            stack.push({ x: nx, y: ny, prev: curr });
        }
    }

    // 终点不可达，返回 null
    if (target === null) return null;

    /** 回溯路径 @type {Point[]} */
    const points = [];
    do {
        points.push({ x: target.x, y: target.y });
        target = target.prev;
    } while (target !== null);
    points.reverse();

    return { rows, cols, points, records };
}

/**
 * 变种深度优先搜索搜索算法（Deep+ First Search）
 *    该搜索算法的核心思想是：在传统 DFS 算法的基础上引入路径距离的记录与更新机制。如果在
 *    搜索过程中发现新路径（再次访问）离起点的距离比当前记录的距离更短，那么就更新记录。因
 *    为无法得知当前路径是否为最短（没有最短，只有更短），所以需要遍历所有可达节点，无法提前
 *    终止搜索。
 *    不推荐在实际应用中使用。
 *
 * @param {Maze} maze
 * @param {Point} s
 * @param {Point} e
 * @returns {MazeSearchResult}
 */
export function dfs_min_distance(maze, s, e) {
    const { rows, cols, data } = maze;
    if (!checkBounds(rows, cols, s.x, s.y) || !checkBounds(rows, cols, e.x, e.y)) return null;

    // 起始点和终点可访问性检查
    const [si, ei] = [s.x + s.y * cols, e.x + e.y * cols];
    if (data[si] === 0 || data[ei] === 0) return null;

    /** 探索过程 @type {MazeSearchRecord[]} */
    const records = [];

    /** 节点索引 @type {ValueNode[]} */
    const nodes = initData(rows * cols, null);
    /** 节点栈 @type {ValueNode[]} */
    const stack = [];

    // 初始化，起点入栈
    let node = { x: s.x, y: s.y, prev: null, val: 0 };
    nodes[si] = node;
    stack.push(node);

    while (stack.length > 0) {
        // 出栈
        node = stack.pop();
        const { x, y, prev, val } = node;
        // 记录搜索路径
        if (prev !== null) records.push({ sx: prev.x, sy: prev.y, ex: x, ey: y });
        // 将可访问的邻近节点加入栈
        for (const [dx, dy] of Directions) {
            const [nx, ny] = [x + dx, y + dy];
            // 边界检查
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
            const ni = nx + ny * cols;
            // 可访问性检查
            if (!data[ni]) continue;
            // 访问状态检查
            let next = nodes[ni];
            if (next === null) {
                // 未访问过；记录前驱节点和路径长度
                next = { x: nx, y: ny, prev: node, val: val + 1 };
                nodes[ni] = next;
                stack.push(next); // 入栈
            } else if (next.val > val + 1) {
                // 发现更短路径，更新前驱节点和路径长度
                next.prev = node;
                next.val = val + 1;
                stack.push(next); // 重新入栈
            }
        }
    }

    let target = nodes[ei];
    // 终点不可达，返回 null
    if (target === null) return null;

    /** 回溯路径 @type {Point[]} */
    const points = [];
    do {
        points.push({ x: target.x, y: target.y });
        target = target.prev;
    } while (target !== null);
    points.reverse();

    return { rows, cols, points, records };
}

/**
 * 广度优先搜索搜索算法（Breadth Frist Search）
 *    在 BFS 算法中天然满足最短路径优先，因为 BFS 使用先进先出的队列结构，先入队的节点本就是离起点最近的节点。
 *    所以理论上在无权图中优先选择 BFS 算法在搜索性能上更好，但单纯 BFS 算法无法处理带权图；
 *    棋盘格迷宫本就是无权图（步长均为 1），因此选择 BFS 算法很合适。
 *
 * @param {Maze} maze
 * @param {Point} s
 * @param {Point} e
 * @returns {MazeSearchResult}
 */
export function bfs(maze, s, e) {
    const { rows, cols, data } = maze;
    if (!checkBounds(rows, cols, s.x, s.y) || !checkBounds(rows, cols, e.x, e.y)) return null;
    const [si, ei] = [s.x + s.y * cols, e.x + e.y * cols];
    if (data[si] === 0 || data[ei] === 0) return null;

    /** 搜索过程 @type {MazeSearchRecord[]} */
    const records = [];

    /** 访问标记 @type {Uint8Array} */
    const visited = new Uint8Array(rows * cols);
    /** 已访问节点队列，BFS 核心 @type {Node[]} */
    const queue = [];

    // 初始化，访问起点
    visited[si] = 1;
    queue.push({ x: s.x, y: s.y, prev: null });

    let target = null;
    Loop: while (queue.length > 0) {
        const curr = queue.shift();
        const { x, y } = curr;
        for (const [dx, dy] of Directions) {
            const [nx, ny] = [x + dx, y + dy];
            // 边界检查
            if (!checkBounds(rows, cols, nx, ny)) continue;
            const ni = nx + ny * cols;
            // 检查可访问性和访问状态
            if (!data[ni] || visited[ni]) continue;
            const next = { x: nx, y: ny, prev: curr };
            // 访问邻近节点
            visited[ni] = 1;
            queue.push(next);
            // 记录搜索路径
            records.push({ sx: x, sy: y, ex: nx, ey: ny });
            // 判断终点
            if (nx === e.x && ny === e.y) {
                target = next;
                break Loop;
            }
        }
    }

    // 终点不可达，返回 null
    if (target === null) return null;

    /** 回溯路径 @type {Point[]} */
    const points = [];
    do {
        points.push({ x: target.x, y: target.y });
        target = target.prev;
    } while (target !== null);
    points.reverse();

    return { rows, cols, points, records };
}

/**
 * 最佳优先搜索算法（Best First Search）
 *
 * @param {Maze} maze
 * @param {Point} s
 * @param {Point} e
 * @returns {MazeSearchResult}
 */
export function bestfirst(maze, s, e) {
    const { rows, cols, data } = maze;
    if (!checkBounds(rows, cols, s.x, s.y) || !checkBounds(rows, cols, e.x, e.y)) return null;
    const [si, ei] = [s.x + s.y * cols, e.x + e.y * cols];
    if (data[si] === 0 || data[ei] === 0) return null;

    /** 探索过程 @type {MazeSearchRecord[]} */
    const records = [];

    /** 节点索引，延迟初始化 @type {ValueNode[]} */
    const nodes = initData(rows * cols, null);
    /** 待访问节点，减少遍历 nodes @type {ValueNode[]} */
    const waits = [];

    /**
     * 启发式函数：曼哈顿距离
     * @param {number} x
     * @param {number} y
     */
    const heuristic = (x, y) => Math.abs(x - e.x) + Math.abs(y - e.y);

    // 0. 将起点加入待访问节点集
    waits.push({ x: s.x, y: s.y, prev: null, val: heuristic(s.x, s.y) });

    for (;;) {
        // 1. 从待访问的节点中选取离起点最近的节点
        const curr = pick(waits, (a, b) => a.val - b.val);
        if (curr === null) break; // 所有节点都已访问

        const { x, y, prev } = curr;

        // 3. 记录探索路径
        if (prev !== null) records.push({ sx: prev.x, sy: prev.y, ex: x, ey: y });

        // P. 找到终点
        if (x === e.x && y === e.y) break;

        // 4. 更新邻居节点的最短路径信息，并将其加入待访问节点集
        for (const [dx, dy] of Directions) {
            const [nx, ny] = [x + dx, y + dy];
            // 边界检查
            if (!checkBounds(rows, cols, nx, ny)) continue;

            const ni = nx + ny * cols;
            // 检查可访问性
            if (!data[ni]) continue;

            // 检查访问状态
            if (nodes[ni] !== null) continue;

            // 未计算过，初始化节点
            const next = { x: nx, y: ny, prev: curr, val: heuristic(nx, ny) };
            nodes[ni] = next;
            waits.push(next); // 将其加入待访问节点集
        }
    }

    let target = nodes[ei];
    // 终点不可达，返回 null
    if (target === null) return null;

    /** 回溯路径 @type {Point[]} */
    const points = [];
    do {
        points.push({ x: target.x, y: target.y });
        target = target.prev;
    } while (target !== null);
    points.reverse();

    return { rows, cols, points, records };
}

/**
 * 最短路径算法（Dijkstra Search / Shortest Path Search）
 *    算法的核心思想：基于贪心策略，每次从待访问节点中选择一个距离起点最近的节点标记
 *    为已访问，然后更新它的邻居节点的最短路径信息，并将邻居节点加入待访问节点，直到
 *    找到终点。
 *
 * @param {Maze} maze
 * @param {Point} s
 * @param {Point} e
 * @returns {MazeSearchResult}
 *
 * @typedef {Object} _FlagNode
 * @property {FlagNode} prev
 * @property {boolean} flag
 * @typedef {ValueNode & _FlagNode} FlagNode
 */
export function dijkstra(maze, s, e) {
    const { rows, cols, data } = maze;
    if (!checkBounds(rows, cols, s.x, s.y) || !checkBounds(rows, cols, e.x, e.y)) return null;
    const [si, ei] = [s.x + s.y * cols, e.x + e.y * cols];
    if (data[si] === 0 || data[ei] === 0) return null;

    /** 探索过程 @type {MazeSearchRecord[]} */
    const records = [];

    /** 节点索引，延迟初始化 @type {FlagNode[]} */
    const nodes = initData(rows * cols, null);
    /** 待访问节点，减少遍历 nodes @type {FlagNode[]} */
    const waits = [];

    // 0. 将起点加入待访问节点集
    waits.push({ x: s.x, y: s.y, prev: null, val: 0, flag: false });

    for (;;) {
        // 1. 从待访问的节点中选取离起点最近的节点
        const curr = pick(waits, (a, b) => a.val - b.val);
        if (curr === null) break; // 所有节点都已访问

        const { x, y, prev, val } = curr;
        // 2. 标记已访问
        curr.flag = true;

        // 3. 记录探索路径
        if (prev !== null) records.push({ sx: prev.x, sy: prev.y, ex: x, ey: y });

        // P. 找到终点
        if (x === e.x && y === e.y) break;

        // 4. 更新邻居节点的最短路径信息，并将其加入待访问节点集
        for (const [dx, dy] of Directions) {
            const [nx, ny] = [x + dx, y + dy];
            // 边界检查
            if (!checkBounds(rows, cols, nx, ny)) continue;
            const ni = nx + ny * cols;
            // 检查可访问性
            if (!data[ni]) continue;
            // 检查访问状态
            let next = nodes[ni];
            if (next === null) {
                // 未计算过，记录前驱节点和距离；将其加入待访问节点集
                next = { x: nx, y: ny, prev: curr, val: val + 1, flag: !1 };
                nodes[ni] = next;
                waits.push(next);
            } else if (!next.flag && next.val > val + 1) {
                // 已计算且未被访问；距离更短，更新前驱节点和距离
                next.prev = curr;
                next.val = val + 1;
            }
        }
    }

    let target = nodes[ei];
    // 终点不可达，返回 null
    if (target === null) return null;

    /** 回溯路径 @type {Point[]} */
    const points = [];
    do {
        points.push({ x: target.x, y: target.y });
        target = target.prev;
    } while (target !== null);
    points.reverse();

    return { rows, cols, points, records };
}

/**
 * A* 搜索算法（AStar）
 *    该算法是 BestFirst 算法 和 Dijkstra 算法的结合;
 *
 * @param {Maze} maze
 * @param {Point} s
 * @param {Point} e
 * @returns {MazeSearchResult}
 *
 * @typedef {Object} _AStarNode
 * @property {AStarNode} prev
 * @property {number} g
 * @property {number} h
 * @typedef {FlagNode & _AStarNode} AStarNode
 */
export function astar(maze, s, e) {
    const { rows, cols, data } = maze;
    if (!checkBounds(rows, cols, s.x, s.y) || !checkBounds(rows, cols, e.x, e.y)) return null;
    const [si, ei] = [s.x + s.y * cols, e.x + e.y * cols];
    if (data[si] === 0 || data[ei] === 0) return null;

    /** 探索过程 @type {MazeSearchRecord[]} */
    const records = [];

    /** 节点索引，延迟初始化 @type {AStarNode[]} */
    const nodes = initData(rows * cols, null);
    /** 待访问节点，减少遍历 nodes @type {AStarNode[]} */
    const waits = [];

    /**
     * 启发式函数：曼哈顿距离
     * @param {number} x
     * @param {number} y
     */
    const heuristic = (x, y) => Math.abs(x - e.x) + Math.abs(y - e.y);

    // 0. 将起点加入待访问节点集
    const [g, h] = [0, heuristic(s.x, s.y)];
    waits.push({ x: s.x, y: s.y, prev: null, val: g + h, flag: !1, g, h });

    for (;;) {
        // 1. 从待访问的节点中选取离起点最近的节点
        const curr = pick(waits, (a, b) => a.val - b.val);
        if (curr === null) break; // 所有节点都已访问

        const { x, y, prev, g } = curr;
        // 2. 标记已访问
        curr.flag = true;

        // 3. 记录探索路径
        if (prev !== null) records.push({ sx: prev.x, sy: prev.y, ex: x, ey: y });

        // P. 找到终点
        if (x === e.x && y === e.y) break;

        // 4. 更新邻居节点的最短路径信息，并将其加入待访问节点集
        for (const [dx, dy] of Directions) {
            const [nx, ny] = [x + dx, y + dy];

            // 边界检查
            if (!checkBounds(rows, cols, nx, ny)) continue;

            const ni = nx + ny * cols;
            // 检查可访问性
            if (!data[ni]) continue;

            // 检查访问状态
            if (nodes[ni] === null) {
                // 未计算过，初始化节点
                const next = { x: nx, y: ny, prev: curr, val: 0, flag: !1, g: 0, h: heuristic(nx, ny) };
                nodes[ni] = next;
                waits.push(next); // 将其加入待访问节点集
            } else if (nodes[ni].flag || nodes[ni].g <= g + 1) {
                // 已被访问；或者距离不比当前短，跳过
                continue;
            }

            // 更新节点信息
            const ng = g + 1;
            const next = nodes[ni];
            next.val = ng + next.h;
            next.g = ng;
        }
    }

    let target = nodes[ei];
    // 终点不可达，返回 null
    if (target === null) return null;

    /** 回溯路径 @type {Point[]} */
    const points = [];
    do {
        points.push({ x: target.x, y: target.y });
        target = target.prev;
    } while (target !== null);
    points.reverse(); // 反转路径

    return { rows, cols, points, records };
}
