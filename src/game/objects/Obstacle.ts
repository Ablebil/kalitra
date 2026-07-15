import Phaser from "phaser";
import { TILE } from "../utils/constants.ts";
import { px, py, pickObstacleKey } from "../utils/helpers.ts";
import type { LevelData, ObstacleType } from "../types/index.ts";

const OBSTACLE_TARGETS: Record<string, number> = {
  bush: 0.82,
  tree: 0.92,
  rock: 0.72,
  fence: 0.86,
};

export function obstacleFit(sprite: Phaser.GameObjects.Image, type: string): void {
  const maxDim = TILE * (OBSTACLE_TARGETS[type] || 0.8);
  const s = Math.min(maxDim / sprite.width, maxDim / sprite.height);
  sprite.setScale(s);
  sprite.setOrigin(0.5, 0.86);
}

export function createObstacles(
  scene: Phaser.Scene,
  level: LevelData,
  origin: { x: number; y: number },
  container: Phaser.GameObjects.Container,
): void {
  level.obstacles.forEach((o) => {
    const key = pickObstacleKey(o.type, o.col, o.row);
    const spr = scene.add.image(px(origin.x, o.col), py(origin.y, o.row) + TILE * 0.42, key);
    obstacleFit(spr, o.type);
    spr.setDepth(py(origin.y, o.row));
    container.add(spr);
  });
}
