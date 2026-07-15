import Phaser from "phaser";
import { TILE, CHAR_ROW } from "../utils/constants.ts";
import { px, py, sleep } from "../utils/helpers.ts";
import type { Direction, LevelData } from "../types/index.ts";

export function createCharacter(
  scene: Phaser.Scene,
  level: LevelData,
  origin: { x: number; y: number },
): Phaser.GameObjects.Sprite {
  const cs = scene.add.sprite(
    px(origin.x, level.start.col),
    py(origin.y, level.start.row) + TILE * 0.3,
    "character",
    CHAR_ROW[level.start.dir] * 4,
  );
  const cScale = Math.min((TILE * 0.72) / cs.width, (TILE * 1.02) / cs.height);
  cs.setScale(cScale);
  cs.setOrigin(0.5, 0.86);
  cs.setDepth(py(origin.y, level.start.row) + 1);
  return cs;
}

export function createWalkingAnimations(scene: Phaser.Scene): void {
  const dirs: Array<"up" | "right" | "down" | "left"> = ["up", "right", "down", "left"];
  dirs.forEach((d) => {
    const row = CHAR_ROW[d];
    scene.anims.create({
      key: "walk-" + d,
      frames: scene.anims.generateFrameNumbers("character", {
        start: row * 4,
        end: row * 4 + 3,
      }),
      frameRate: 8,
      repeat: -1,
    });
  });
}

export function resetCharacter(
  scene: Phaser.Scene,
  cs: Phaser.GameObjects.Sprite,
  cScale: number,
  origin: { x: number; y: number },
  col: number,
  row: number,
  dir: "up" | "right" | "down" | "left",
): void {
  cs.stop();
  cs.setFrame(CHAR_ROW[dir] * 4);
  cs.setPosition(px(origin.x, col), py(origin.y, row) + TILE * 0.3);
  cs.setDepth(py(origin.y, row) + 1);
  cs.clearTint();
  cs.setScale(cScale);
}

export function bumpEffect(
  scene: Phaser.Scene,
  cs: Phaser.GameObjects.Sprite,
  dirVec: [number, number],
): Promise<void> {
  const ox = cs.x;
  const oy = cs.y;
  return new Promise((resolve) => {
    scene.tweens.add({
      targets: cs,
      x: ox + dirVec[0] * 16,
      y: oy + dirVec[1] * 16,
      duration: 90,
      yoyo: true,
      ease: "Quad.easeOut",
      onComplete: async () => {
        cs.setTint(0xff8a80);
        await sleep(160);
        cs.clearTint();
        resolve();
      },
    });
  });
}

export function turnChar(
  scene: Phaser.Scene,
  cs: Phaser.GameObjects.Sprite,
  cScale: number,
  newDir: "up" | "right" | "down" | "left",
): Promise<void> {
  cs.setFrame(CHAR_ROW[newDir] * 4);
  return new Promise((resolve) => {
    scene.tweens.add({
      targets: cs,
      scaleX: cScale * 1.18,
      scaleY: cScale * 1.18,
      duration: 110,
      yoyo: true,
      ease: "Quad.easeOut",
      onComplete: () => resolve(),
    });
  });
}
