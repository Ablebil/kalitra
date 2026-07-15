import Phaser from "phaser";
import { TILE, OBSTACLE_ORIGIN_Y, OBSTACLE_Y_ADJUST } from "../utils/constants.ts";
import { px, py, pickObstacleKey } from "../utils/helpers.ts";
import type { LevelData, ObstacleType } from "../types/index.ts";

const OBSTACLE_TARGETS: Record<string, number> = {
  bush: 0.82,
  tree: 0.92,
  rock: 0.72,
  fence: 0.86,
};

export function obstacleFit(sprite: Phaser.GameObjects.Image, type: ObstacleType): void {
  const maxDim = TILE * (OBSTACLE_TARGETS[type] || 0.8);
  const s = Math.min(maxDim / sprite.width, maxDim / sprite.height);
  sprite.setScale(s);
  const originY = OBSTACLE_ORIGIN_Y[sprite.texture.key] ?? 0.95;
  sprite.setOrigin(0.5, originY);
}

export function createObstacles(
  scene: Phaser.Scene,
  level: LevelData,
  origin: { x: number; y: number },
  container: Phaser.GameObjects.Container,
): void {
  level.obstacles.forEach((o) => {
    const key = pickObstacleKey(o.type, o.col, o.row);
    const spr = scene.add.image(
      px(origin.x, o.col),
      py(origin.y, o.row) + TILE / 2 + (OBSTACLE_Y_ADJUST[o.type] ?? 0),
      key,
    );
    obstacleFit(spr, o.type as ObstacleType);
    spr.setDepth(py(origin.y, o.row));
    container.add(spr);
  });
}
