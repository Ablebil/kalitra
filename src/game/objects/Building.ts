import Phaser from "phaser";
import { TILE } from "../utils/constants.ts";
import { px, py } from "../utils/helpers.ts";
import type { LevelData } from "../types/index.ts";

export function createBuilding(
  scene: Phaser.Scene,
  level: LevelData,
  origin: { x: number; y: number },
  container: Phaser.GameObjects.Container,
): void {
  const f = level.finish;
  const bld = scene.add.image(px(origin.x, f.col), py(origin.y, f.row) + TILE * 0.3, f.building);
  const bScale = Math.min((TILE * 1.55) / bld.width, (TILE * 1.55) / bld.height);
  bld.setScale(bScale);
  bld.setOrigin(0.5, 0.8);
  bld.setDepth(py(origin.y, f.row) + 50);
  container.add(bld);

  scene.tweens.add({
    targets: bld,
    scaleX: bScale * 1.035,
    scaleY: bScale * 1.035,
    duration: 1400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}
