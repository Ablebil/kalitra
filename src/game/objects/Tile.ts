import Phaser from "phaser";
import { TILE } from "../utils/constants.ts";
import { px, py, pickGrassKey } from "../utils/helpers.ts";
import type { LevelData } from "../types/index.ts";

export function createTiles(
  scene: Phaser.Scene,
  level: LevelData,
  origin: { x: number; y: number },
  container: Phaser.GameObjects.Container,
): void {
  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      const key = pickGrassKey(c, r);
      const img = scene.add.image(px(origin.x, c), py(origin.y, r), key);
      img.setDisplaySize(TILE + 3, TILE + 3);
      img.setDepth(-1000 + r);
      container.add(img);
    }
  }
}
