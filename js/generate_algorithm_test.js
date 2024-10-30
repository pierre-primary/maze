import { dfs_recursive, dfs, bfs, divide, kruskal, prim } from "./generate_algorithm.js";

for (let i = 0; i < 2000; i++) {
    dfs_recursive(25, 25);
    dfs(25, 25);
    bfs(25, 25);
    divide(25, 25);
    kruskal(25, 25);
    prim(25, 25);
}

console.time("dfs_recursive");
for (let i = 0; i < 10000; i++) {
    dfs_recursive(25, 25);
}
console.timeEnd("dfs_recursive");

console.time("dfs");
for (let i = 0; i < 10000; i++) {
    dfs(25, 25);
}
console.timeEnd("dfs");

console.time("bfs");
for (let i = 0; i < 10000; i++) {
    bfs(25, 25);
}
console.timeEnd("bfs");

console.time("divide");
for (let i = 0; i < 10000; i++) {
    divide(25, 25);
}
console.timeEnd("divide");

console.time("kruskal");
for (let i = 0; i < 10000; i++) {
    kruskal(25, 25);
}
console.timeEnd("kruskal");

console.time("prim");
for (let i = 0; i < 10000; i++) {
    prim(25, 25);
}
console.timeEnd("prim");
