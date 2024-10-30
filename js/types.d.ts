type Point = { x: number; y: number };

type GenRecord = {
    mode: "road" | "wall";
    sx: number;
    sy: number;
    ex: number;
    ey: number;
    dir?: string;
};

type Maze = {
    rows: number;
    cols: number;
    data: Uint8Array;
    records: GenRecord[];
};

type MazeSearchRecord = {
    sx: number;
    sy: number;
    ex: number;
    ey: number;
};

type MazeSearchResult = {
    rows: number;
    cols: number;
    points: Point[];
    records: SearchRecord[];
};
