import Phaser from "phaser";
import { TILE } from "../utils/constants.ts";
import { px, py, sleep } from "../utils/helpers.ts";
import type { LevelData } from "../types/index.ts";

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
  const anims: Record<string, string[]> = {
    "walk-down": ["idle_0", "idle_1", "idle_2", "idle_3"],
    "walk-up": ["back_0", "back_1", "back_2", "back_3"],
    "walk-left": ["walk_left_0", "walk_left_1", "walk_left_2", "walk_left_3"],
    "walk-right": ["walk_right_0", "walk_right_1", "walk_right_2", "walk_right_3"],
  };
  for (const [key, frames] of Object.entries(anims)) {
    scene.anims.create({
      key,
      frames: frames.map((f) => ({ key: "character", frame: f })),
      frameRate: 8,
      repeat: -1,
    });
  }
}

export function resetCharacter(
  _scene: Phaser.Scene,
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
