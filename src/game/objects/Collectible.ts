import Phaser from "phaser";
import { TILE, OBSTACLE_ORIGIN_Y, OBSTACLE_Y_ADJUST } from "../utils/constants.ts";
import { px, py } from "../utils/helpers.ts";
import type { LevelData } from "../types/index.ts";

export function createCollectibles(
  scene: Phaser.Scene,
  level: LevelData,
  origin: { x: number; y: number },
  container: Phaser.GameObjects.Container,
  collectibleSprites: Record<string, Phaser.GameObjects.Image>,
): void {
  level.collectibles.forEach((cItem) => {
    const baseY = py(origin.y, cItem.row) + TILE / 2 + OBSTACLE_Y_ADJUST.book;
    const spr = scene.add.image(px(origin.x, cItem.col), baseY, "book");
    const s = Math.min((TILE * 0.5) / spr.width, (TILE * 0.5) / spr.height);
    spr.setScale(s);
    spr.setOrigin(0.5, OBSTACLE_ORIGIN_Y.book);
    spr.setDepth(py(origin.y, cItem.row) + 1);
    spr.setData("col", cItem.col);
    spr.setData("row", cItem.row);
    spr.setData("baseY", baseY);

    scene.tweens.add({
      targets: spr,
      y: "-=10",
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    scene.tweens.add({
      targets: spr,
      angle: 8,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    container.add(spr);
    collectibleSprites[cItem.col + "," + cItem.row] = spr;
  });
}
