import type { LevelData, LevelObstacle, ObstacleType } from "../types/index.ts";

const INTENDED_PATHS: Record<number, [number, number][]> = {
  1: [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
  ],
  2: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
  ],
  3: [
    [0, 2],
    [1, 2],
    [2, 2],
    [2, 1],
    [3, 1],
    [4, 1],
    [4, 2],
    [5, 2],
    [6, 2],
  ],
  4: [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
    [6, 1],
    [7, 1],
  ],
  5: [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [6, 5],
    [7, 5],
  ],
};

const TYPES: ObstacleType[] = ["tree", "rock", "bush", "fence"];

const decoratedLevels = new Set<number>();

export function decorateLevel(level: LevelData): void {
  if (decoratedLevels.has(level.id)) return;
  decoratedLevels.add(level.id);

  const reserved = new Set<string>();

  const path = INTENDED_PATHS[level.id];
  if (path) {
    for (const [c, r] of path) {
      reserved.add(`${c},${r}`);
    }
  }

  reserved.add(`${level.start.col},${level.start.row}`);
  reserved.add(`${level.finish.col},${level.finish.row}`);

  for (const c of level.collectibles) {
    reserved.add(`${c.col},${c.row}`);
  }
  for (const o of level.obstacles) {
    reserved.add(`${o.col},${o.row}`);
  }

  const candidates: [number, number][] = [];
  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      if (!reserved.has(`${c},${r}`)) {
        candidates.push([c, r]);
      }
    }
  }

  const count = Math.min(Math.max(3, Math.floor(candidates.length * 0.25)), 8);
  if (count === 0) return;

  const seed = level.id * 1337;
  candidates.sort(([c1, r1], [c2, r2]) => {
    const h1 = Math.abs((c1 * 928371 + r1 * 133 + seed) % 10000);
    const h2 = Math.abs((c2 * 928371 + r2 * 133 + seed) % 10000);
    return h1 - h2;
  });

  const selected: [number, number][] = [];
  for (const tile of candidates) {
    if (selected.length >= count) break;
    const adjacent = selected.some(
      ([sc, sr]) => Math.abs(sc - tile[0]) + Math.abs(sr - tile[1]) <= 1,
    );
    const diagonalAdjacent = selected.some(
      ([sc, sr]) => Math.abs(sc - tile[0]) === 1 && Math.abs(sr - tile[1]) === 1,
    );
    if (!adjacent && !diagonalAdjacent) {
      selected.push(tile);
    }
  }

  while (selected.length < count && selected.length < candidates.length) {
    for (const tile of candidates) {
      if (selected.length >= count) break;
      if (!selected.some(([sc, sr]) => sc === tile[0] && sr === tile[1])) {
        selected.push(tile);
      }
    }
  }

  const decorations: LevelObstacle[] = selected.map(([col, row], i) => ({
    col,
    row,
    type: TYPES[i % TYPES.length],
  }));

  level.obstacles.push(...decorations);
}
