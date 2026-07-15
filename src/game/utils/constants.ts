import type { Direction, DirVec, ObstacleKey, ObstacleType, GrassKey } from "../types/index.ts";

/** Set to false to disable debug overlay and verbose logging */
export const DEBUG = true;

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

export const GAME_W = 800;

export const GAME_H = 600;

export function px(originX: number, col: number): number {
  return originX + col * TILE + TILE / 2;
}

export function py(originY: number, row: number): number {
  return originY + row * TILE + TILE / 2;
}
