import type { Direction, DirVec, ObstacleKey, ObstacleType, GrassKey } from "../types/index.ts";

export const TILE = 100;

export const DIRS: Direction[] = ["up", "right", "down", "left"];

export const DIR_VEC: Record<Direction, DirVec> = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
};

export const CHAR_ROW: Record<Direction, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 3,
};

export const OBSTACLE_KEYS: Record<ObstacleType, ObstacleKey[]> = {
  bush: ["bush0", "bush1", "bush2"],
  tree: ["tree0", "tree1", "tree2"],
  rock: ["rock0", "rock1", "rock2"],
  fence: ["fence0", "fence1", "fence2"],
};

export const GRASS_KEYS: GrassKey[] = ["grass0", "grass1", "grass2"];

export const GRASS_WEIGHTS: number[] = [0.7, 0.15, 0.15];

export const CHAR_Y_ADJUST = -24;

// Per-variant origin Y so that the visible content bottom aligns with the anchor point.
// Each value = (visibleContentMaxY + 1) / imageHeight, measured from the raw PNG pixels.
export const OBSTACLE_ORIGIN_Y: Record<string, number> = {
  rock0: 0.958,
  rock1: 0.956,
  rock2: 0.959,
  tree0: 0.959,
  tree1: 0.959,
  tree2: 0.959,
  bush0: 0.962,
  bush1: 0.959,
  bush2: 0.959,
  fence0: 0.988,
  fence1: 0.974,
  fence2: 0.962,
  book: 0.961,
};

// Per-type fine-tune Y adjustment (applied after origin fix; positive = lower, negative = higher).
// Set to 0 initially — tweak per type if visual inspection shows any still floating/sinking.
export const OBSTACLE_Y_ADJUST: Record<string, number> = {
  rock: 0,
  tree: 0,
  bush: 0,
  fence: 0,
  book: -24,
};

export const GAME_W = 800;

export const GAME_H = 600;

export function px(originX: number, col: number): number {
  return originX + col * TILE + TILE / 2;
}

export function py(originY: number, row: number): number {
  return originY + row * TILE + TILE / 2;
}
