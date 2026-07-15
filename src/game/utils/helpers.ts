import Phaser from "phaser";
import { TILE, GAME_W, GAME_H, OBSTACLE_KEYS, GRASS_KEYS, GRASS_WEIGHTS } from "./constants.ts";
import type { LevelData, ObstacleType, ObstacleKey, GrassKey } from "../types/index.ts";

export function pickObstacleKey(type: ObstacleType, col: number, row: number): ObstacleKey {
  const arr = OBSTACLE_KEYS[type];
  const idx = Math.abs((col * 928371 + row * 133) % arr.length);
  return arr[idx];
}

export function pickGrassKey(col: number, row: number): GrassKey {
  const r = Math.abs(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) % 1;
  let acc = 0;
  for (let i = 0; i < GRASS_KEYS.length; i++) {
    acc += GRASS_WEIGHTS[i];
    if (r < acc) return GRASS_KEYS[i];
  }
  return GRASS_KEYS[0];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function px(originX: number, col: number): number {
  return originX + col * TILE + TILE / 2;
}

export function py(originY: number, row: number): number {
  return originY + row * TILE + TILE / 2;
}

export function levelOrigin(level: LevelData): { x: number; y: number } {
  return { x: (GAME_W - level.cols * TILE) / 2, y: (GAME_H - level.rows * TILE) / 2 };
}

export function computeStars(level: LevelData, collected: Set<string>): number {
  const total = level.collectibles.length;
  let stars = 1;
  collected.forEach(() => {
    stars++;
  });
  return Math.min(stars, total + 1);
}

const LABEL_MAP: Record<string, string> = {
  forward: "⬆️ Maju",
  left: "↩️ Kiri",
  right: "↪️ Kanan",
};

const CLASS_MAP: Record<string, string> = {
  forward: "block-forward",
  left: "block-left",
  right: "block-right",
};

export function tweenPromise(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  props: object,
): Promise<void> {
  return new Promise((resolve) => {
    (scene as any).tweens.add(Object.assign({ targets: target, onComplete: resolve }, props));
  });
}

export function blockLabel(type: string): string {
  return LABEL_MAP[type] || type;
}

export function blockClass(type: string): string {
  return CLASS_MAP[type] || "";
}
