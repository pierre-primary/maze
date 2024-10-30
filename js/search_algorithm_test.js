import { divide } from "./generate_algorithm.js";
import { bfs, dfs, bestfirst, dijkstra, astar } from "./search_algorithm.js";

function print(path) {
    if (!path) return;
    console.log(
        path.points
            .splice(0, 20)
            .map(p => `${p.x},${p.y}`)
            .join(", ")
    );
}

const rows = 25;
const cols = 25;

const maze = divide(rows, cols);

for (let i = 0; i < 1000; i++) {
    dfs(maze, { x: 0, y: 0 }, { x: cols - 1, y: rows - 1 });
    bfs(maze, { x: 0, y: 0 }, { x: cols - 1, y: rows - 1 });
    dijkstra(maze, { x: 0, y: 0 }, { x: cols - 1, y: rows - 1 });
    astar(maze, { x: 0, y: 0 }, { x: cols - 1, y: rows - 1 });
}

let xx;

console.time("dfs");
for (let i = 0; i < 10000; i++) {
    xx = dfs(maze, { x: 0, y: 0 }, { x: cols - 1, y: rows - 1 });
}
console.timeEnd("dfs");
print(xx);

console.time("bfs");
for (let i = 0; i < 10000; i++) {
    xx = bfs(maze, { x: 0, y: 0 }, { x: cols - 1, y: rows - 1 });
}
console.timeEnd("bfs");
print(xx);

console.time("bestfirst");
for (let i = 0; i < 10000; i++) {
    xx = bestfirst(maze, { x: 0, y: 0 }, { x: cols - 1, y: rows - 1 });
}
console.timeEnd("bestfirst");
print(xx);

console.time("dijkstra");
for (let i = 0; i < 10000; i++) {
    xx = dijkstra(maze, { x: 0, y: 0 }, { x: cols - 1, y: rows - 1 });
}
console.timeEnd("dijkstra");
print(xx);

console.time("astar");
for (let i = 0; i < 10000; i++) {
    xx = astar(maze, { x: 0, y: 0 }, { x: cols - 1, y: rows - 1 });
}
console.timeEnd("astar");
print(xx);
