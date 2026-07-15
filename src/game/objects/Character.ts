import Phaser from "phaser";

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
