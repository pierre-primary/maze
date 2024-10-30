// 方向
const Directions = [
    [-2, +0], // 左
    [+2, +0], // 右
    [+0, -2], // 上
    [+0, +2], // 下
];

/**
 * 随机选择；蓄水池抽样（swap + pop）算法
 *    swap + pop 实现 ···· 时间复杂度 O(1)
 *    splice 实现 ········ 时间复杂度 O(n)
 *
 * @template T
 * @param {T[]} array
 * @returns {T | null}
 */
function pickAny(array) {
    if (array.length <= 0) return null;
    const idx = (Math.random() * array.length) | 0;
    let val = array.pop();
    if (idx < array.length - 1) [val, array[idx]] = [array[idx], val];
    return val;
}

/**
 * 洗牌算法； Fisher-Yates 洗牌算法
 *    array.sort(() => Math.random() - 0.5) ···· 时间复杂度 O(nlogn)
 *    Fisher-Yates 洗牌算法 ····················· 时间复杂度 O(n)
 *
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
function shuffle(array) {
    for (let i = array.length; i > 1; i--) {
        const j = (Math.random() * i) | 0;
        [array[i - 1], array[j]] = [array[j], array[i - 1]];
    }
    return array;
}

function check(rows, cols) {
    if ((rows & 1) === 0 || (cols & 1) === 0) throw new Error("rows and cols must be odd");
}

/**
 * 深度优先搜索算法生成迷宫; 递归实现
 *
 * @param {number} rows
 * @param {number} cols
 * @returns {Maze}
 */
export function dfs_recursive(rows, cols) {
    check(rows, cols);
    // 迷宫数据
    const data = new Uint8Array(rows * cols);
    // 迷宫生成记录
    const records = [];

    // 递归打通迷宫
    function recursive(x, y, p = x + y * cols) {
        // 标记已访问
        data[p] = 1;
        // 随机方向遍历；使用 Array.from 拷贝一个独立的数组，保持栈状态
        for (const [dx, dy] of shuffle(Array.from(Directions))) {
            const [ex, ey] = [x + dx, y + dy];
            // 边界检查
            if (ex < 0 || ex >= cols || ey < 0 || ey >= rows) continue;
            const ep = ex + ey * cols;
            // 访问状态检查
            if (data[ep] !== 0) continue;
            // 打通中间的墙
            data[(p + ep) >> 1] = 1;
            // 记录生成过程
            records.push({ mode: "road", sx: x, sy: y, ex, ey });
            // 递归调用
            recursive(ex, ey);
        }
    }

    // 随机起点
    const x = (Math.random() * cols) & ~1;
    const y = (Math.random() * rows) & ~1;
    recursive(x, y);

    return { rows, cols, data, records };
}

/**
 * 深度优先搜索算法生成迷宫；非递归实现
 *
 * @param {number} rows
 * @param {number} cols
 * @returns {Maze}
 */
export function dfs(rows, cols) {
    check(rows, cols);
    // 迷宫数据
    const data = new Uint8Array(rows * cols);
    // 迷宫生成记录
    /**  @type {GenRecord[]} */
    const records = [];
    // 边集合（栈）
    const edges = [];
    // 方向
    const directions = Array.from(Directions);

    // 访问一个点
    //  - 将该点标记为已访问
    //  - 将可连接的边加入栈
    function visit(x, y, p = x + y * cols) {
        // 标记已访问
        data[p] = 1;
        // 随机方向遍历
        for (const [dx, dy] of shuffle(directions)) {
            const [ex, ey] = [x + dx, y + dy];
            // 边界检查
            if (ex < 0 || ex >= cols || ey < 0 || ey >= rows) continue;
            const ep = ex + ey * cols;
            // 入栈前访问状态检查（减少无效临时对象入栈）
            if (data[ep] !== 0) continue;
            // 入栈
            edges.push({ sx: x, sy: y, ex, ey, sp: p, ep });
        }
    }

    // 随便选择起点
    const x = (Math.random() * cols) & ~1;
    const y = (Math.random() * rows) & ~1;
    visit(x, y);

    while (edges.length > 0) {
        const { sx, sy, ex, ey, sp, ep } = edges.pop(); // 出栈
        // 访问状态检查
        if (data[ep] !== 0) continue;
        // 打通墙壁
        data[(sp + ep) >> 1] = 1;
        // 记录生成过程
        records.push({ mode: "road", sx, sy, ex, ey });
        // 访问目标点
        visit(ex, ey, ep);
    }

    return { rows, cols, data, records };
}

/**
 * 广度优先搜索算法生成迷宫
 *
 * @param {number} rows
 * @param {number} cols
 * @returns {Maze}
 */
export function bfs(rows, cols) {
    check(rows, cols);
    // 迷宫数据
    const data = new Uint8Array(rows * cols);
    // 迷宫生成记录
    /**  @type {GenRecord[]} */
    const records = [];
    // 边集合（队）
    const edges = [];
    // 方向
    const directions = Array.from(Directions);

    // 访问一个点
    //  - 将该点标记为已访问
    //  - 将可连接的边加入队列
    function visit(x, y, p = x + y * cols) {
        // 标记已访问
        data[p] = 1;
        // 随机方向遍历
        for (const [dx, dy] of shuffle(directions)) {
            const [ex, ey] = [x + dx, y + dy];
            // 边界检查
            if (ex < 0 || ex >= cols || ey < 0 || ey >= rows) continue;
            const ep = ex + ey * cols;
            // 入队前访问状态检查（减少无效临时对象入队）
            if (data[ep] !== 0) continue;
            // 入队
            edges.push({ sx: x, sy: y, ex, ey, sp: p, ep });
        }
    }

    // 随便选择起点
    const x = (Math.random() * cols) & ~1;
    const y = (Math.random() * rows) & ~1;
    visit(x, y);

    while (edges.length > 0) {
        const { sx, sy, ex, ey, sp, ep } = edges.shift(); // 出队；bfs 的 shift 性能不如 dfs 的 pop
        // 访问状态检查
        if (data[ep] !== 0) continue;
        // 打通墙壁
        data[(sp + ep) >> 1] = 1;
        // 记录生成过程
        records.push({ mode: "road", sx, sy, ex, ey });
        // 访问目标点
        visit(ex, ey, ep);
    }

    return { rows, cols, data, records };
}

/**
 * 最小生成树算法 -- Kruskal 的变体算法生成迷宫
 *
 * @param {number} rows
 * @param {number} cols
 * @returns {Maze}
 */
export function kruskal(rows, cols) {
    check(rows, cols);
    // 迷宫数据
    const data = new Uint8Array(rows * cols);
    // 迷宫生成记录
    /**  @type {GenRecord[]} */
    const records = [];
    // 边集合
    const edges = [];

    // 并查集
    const nodes = new Uint32Array(rows * cols);
    for (let i = 0; i < rows * cols; i++) nodes[i] = i;
    function find(i) {
        let p = i;
        while (p !== nodes[p]) {
            nodes[p] = nodes[nodes[p]]; // 路径压缩
            p = nodes[p];
        }
        return p;
    }
    function union(n1, n2) {
        const r1 = find(n1);
        const r2 = find(n2);
        if (r1 === r2) return false; // 之前已经连通
        nodes[r2] = r1; // 连通
        return true;
    }

    // 初始化迷宫和边集合
    for (let y = 0; y < rows; y += 2) {
        for (let x = 0; x < cols; x += 2) {
            const p = x + y * cols;
            data[p] = 1;
            // 右方
            if (x < cols - 2) {
                edges.push({ sx: x, sy: y, ex: x + 2, ey: y, sp: p, ep: p + 2 });
            }
            // 下方
            if (y < rows - 2) {
                edges.push({ sx: x, sy: y, ex: x, ey: y + 2, sp: p, ep: p + 2 * cols });
            }
        }
    }

    while (edges.length > 0) {
        // Kruskal 算法是选择权重最小的边；edges 初始化时按权重排序即可
        // 算法变形：这里改成随机选择
        const { sx, sy, ex, ey, sp, ep } = pickAny(edges);
        // 访问状态检测；如果两个节点已连通，跳过
        if (!union(sp, ep)) continue;
        // 打通墙壁
        data[(sp + ep) >> 1] = 1;
        // 记录生成过程
        records.push({ mode: "road", sx, sy, ex, ey });
    }

    return { rows, cols, data, records };
}

/**
 * 最小生成树算法 -- Prim 的变体算法生成迷宫
 *
 * @param {number} rows
 * @param {number} cols
 * @returns {Maze}
 */
export function prim(rows, cols) {
    check(rows, cols);
    // 迷宫数据
    const data = new Uint8Array(rows * cols);
    // 迷宫生成记录
    /**  @type {GenRecord[]} */
    const records = [];
    // 边集合
    const edges = [];
    // 方向
    const directions = Array.from(Directions);

    // 访问一个点
    //  - 将该点标记为已访问
    //  - 将可连接的边加入集合
    function visit(x, y, p = x + y * cols) {
        // 标记已访问
        data[p] = 1;
        for (const [dx, dy] of directions) {
            const [ex, ey] = [x + dx, y + dy];
            // 边界检查
            if (ex < 0 || ex >= cols || ey < 0 || ey >= rows) continue;
            const ep = ex + ey * cols;
            // 加入集合前访问状态检查（减少无效临时对象加入集合）
            if (data[ep] !== 0) continue;
            // 加入集合
            edges.push({ sx: x, sy: y, ex, ey, sp: p, ep });
        }
    }

    // 随便选择起点
    const x = (Math.random() * cols) & ~1;
    const y = (Math.random() * rows) & ~1;
    visit(x, y);

    while (edges.length > 0) {
        // Prim 算法是选择权重最小的边；edges 直接使用优先队列即可
        // 算法变形：这里改成随机选择
        const { sx, sy, ex, ey, sp, ep } = pickAny(edges);
        // 访问状态检查
        if (data[ep] !== 0) continue;
        // 打通墙壁
        data[(sp + ep) >> 1] = 1;
        // 记录生成过程
        records.push({ mode: "road", sx, sy, ex, ey });
        // 访问目标点
        visit(ex, ey, ep);
    }

    return { rows, cols, data, records };
}

/**
 * 分区递归算法生成迷宫
 *    递归深度不会特别深，直接递归即可
 *
 * @param {number} rows
 * @param {number} cols
 * @returns {Maze}
 */
export function divide(rows, cols) {
    check(rows, cols);
    // 迷宫数据
    const data = new Uint8Array(rows * cols);
    // 迷宫生成记录
    const records = [];

    // 初始化迷宫
    for (let i = 0; i < data.length; i++) data[i] = 1;

    // 递归分区
    function recursive(sx, sy, ex, ey, t = 3) {
        const [w, h] = [ex - sx + 1, ey - sy + 1];
        if (w <= 2 || h <= 2) return;

        const rand = Math.random;

        // w == h 时随机选择
        const direction = w + rand() - 0.5 < h;

        if (direction) {
            // 垂直分区

            // 随机选择一奇数行；分割
            const dy = (sy + rand() * (h - 1)) | 1;
            for (let i = sx; i <= ex; i++) data[i + dy * cols] = 0;
            records.push({ mode: "wall", sx: sx, sy: dy, ex: ex, ey: dy, dir: "x" });

            // 随机打通一偶数列；打通
            const px = (sx + rand() * (w + 1)) & ~1;
            data[px + dy * cols] = 1;
            records.push({ mode: "road", sx: px, sy: dy, ex: px, ey: dy, dir: "x" });

            // 递归调用
            recursive(sx, sy, ex, dy - 1, 1 - t); // 上分区
            recursive(sx, dy + 1, ex, ey, 1 - t); // 下分区
        } else {
            // 水平分区

            // 随机选择一奇数列；分割
            const dx = (sx + rand() * (w - 1)) | 1;
            for (let i = sy; i <= ey; i++) data[dx + i * cols] = 0;
            records.push({ mode: "wall", sx: dx, sy: sy, ex: dx, ey: ey, dir: "y" });

            // 随机打通一偶数行；打通
            const py = (sy + rand() * (h + 1)) & ~1;
            data[dx + py * cols] = 1;
            records.push({ mode: "road", sx: dx, sy: py, ex: dx, ey: py, dir: "y" });

            // 递归调用
            recursive(sx, sy, dx - 1, ey, 1 - t); // 左分区
            recursive(dx + 1, sy, ex, ey, 1 - t); // 右分区
        }
    }

    recursive(0, 0, cols - 1, rows - 1);

    return { rows, cols, data, records };
}
