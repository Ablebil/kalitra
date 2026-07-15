import {
  TILE,
  GAME_W,
  GAME_H,
  px,
  py,
  CHAR_Y_ADJUST,
  OBSTACLE_ORIGIN_Y,
  OBSTACLE_Y_ADJUST,
} from "../utils/constants.ts";
import { pickGrassKey, pickObstacleKey } from "../utils/helpers.ts";
import { decorateLevel } from "../utils/decorations.ts";
import type { ObstacleType } from "../types/index.ts";

// Max frame dimensions from character atlas (back_0 is the largest at 175×262)
const CHAR_FRAME_W = 175;
const CHAR_FRAME_H = 262;

// Maps direction → atlas idle frame name
const FRAME_IDLE: Record<string, string> = {
  down: "idle_0",
  up: "back_0",
  left: "walk_left_0",
  right: "walk_right_0",
};

function obstacleFit(sprite: Phaser.GameObjects.Image, type: ObstacleType): void {
  const targets: Record<string, number> = { bush: 0.82, tree: 0.92, rock: 0.72, fence: 0.86 };
  const maxDim = TILE * (targets[type] || 0.8);
  const s = Math.min(maxDim / sprite.width, maxDim / sprite.height);
  sprite.setScale(s);
  const originY = OBSTACLE_ORIGIN_Y[sprite.texture.key] ?? 0.95;
  sprite.setOrigin(0.5, originY);
}

export function addFootprint(scene: any, col: number, row: number): void {
  const origin = scene.levelOrigin;
  const fp = scene.add.image(px(origin.x, col), py(origin.y, row), "dirt0");
  fp.setDisplaySize(TILE * 0.9, TILE * 0.9);
  fp.setAlpha(0.55);
  fp.setDepth(-900 + row);
  scene.worldLayer.add(fp);
  scene.footprints.push(fp);
}

export function clearFootprints(scene: any): void {
  scene.footprints.forEach((f: any) => f.destroy());
  scene.footprints = [];
}

export function buildLevel(scene: any, level: import("../types/index.ts").LevelData): void {
  decorateLevel(level);
  scene.tweens.killAll();
  scene.worldLayer.removeAll(true);
  scene.footprints = [];
  scene.collectibleSprites = {};
  scene.collectedSet = new Set<string>();
  const origin = scene.levelOrigin;

  const backdrop = scene.add.rectangle(
    GAME_W / 2,
    GAME_H / 2,
    level.cols * TILE + 26,
    level.rows * TILE + 26,
    0x6fb84a,
    1,
  );
  backdrop.setStrokeStyle(0, 0x000000, 0);
  scene.worldLayer.add(backdrop);

  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      const key = pickGrassKey(c, r);
      const img = scene.add.image(px(origin.x, c), py(origin.y, r), key);
      img.setDisplaySize(TILE + 3, TILE + 3);
      img.setDepth(-1000 + r);
      scene.worldLayer.add(img);
    }
  }

  level.obstacles.forEach((o: any) => {
    const key = pickObstacleKey(o.type, o.col, o.row);
    const spr = scene.add.image(
      px(origin.x, o.col),
      py(origin.y, o.row) + TILE / 2 + (OBSTACLE_Y_ADJUST[o.type] ?? 0),
      key,
    );
    obstacleFit(spr, o.type);
    spr.setDepth(py(origin.y, o.row));
    scene.worldLayer.add(spr);
  });

  const f = level.finish;
  const bld = scene.add.image(px(origin.x, f.col), py(origin.y, f.row) + TILE * 0.3, f.building);
  const bScale = Math.min((TILE * 1.55) / bld.width, (TILE * 1.55) / bld.height);
  bld.setScale(bScale);
  bld.setOrigin(0.5, 0.8);
  bld.setDepth(py(origin.y, f.row) + 50);
  scene.worldLayer.add(bld);
  scene.tweens.add({
    targets: bld,
    scaleX: bScale * 1.035,
    scaleY: bScale * 1.035,
    duration: 1400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  level.collectibles.forEach((cItem: any) => {
    const baseX = px(origin.x, cItem.col);
    const baseY = py(origin.y, cItem.row) + TILE / 2 + OBSTACLE_Y_ADJUST.book;
    const spr = scene.add.image(baseX, baseY, "book");
    const s = Math.min((TILE * 0.5) / spr.width, (TILE * 0.5) / spr.height);
    spr.setScale(s);
    spr.setOrigin(0.5, OBSTACLE_ORIGIN_Y.book);
    spr.setDepth(py(origin.y, cItem.row) + 1);
    spr.setData("baseScale", s);
    spr.setData("baseX", baseX);
    spr.setData("baseY", baseY);
    scene.worldLayer.add(spr);
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
    scene.collectibleSprites[cItem.col + "," + cItem.row] = spr;
  });

  const cs = scene.add.sprite(
    px(origin.x, level.start.col),
    py(origin.y, level.start.row) + TILE / 2 + CHAR_Y_ADJUST,
    "character",
    FRAME_IDLE[level.start.dir],
  );
  const cScale = Math.min((TILE * 0.72) / CHAR_FRAME_W, (TILE * 1.02) / CHAR_FRAME_H) * 0.88;
  cs.setScale(cScale);
  cs.setOrigin(0.5, 1.0);
  cs.setDepth(py(origin.y, level.start.row) + 1);
  scene.worldLayer.add(cs);
  scene.charSprite = cs;
  scene.charScale = cScale;

  // Idle bob tween — gentle scale-Y oscillation while not walking
  startIdleBob(scene, cScale);
}

/** Start the idle bob animation on the character sprite. */
export function startIdleBob(scene: any, cScale: number): void {
  scene.tweens.killTweensOf(scene.charSprite);
  scene.tweens.add({
    targets: scene.charSprite,
    scaleY: cScale * 0.96,
    scaleX: cScale * 1.02,
    duration: 500,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  scene._idleBobActive = true;
}

/** Stop idle bob and restore exact scale. Called before walking starts. */
export function stopIdleBob(scene: any, cScale: number): void {
  if (!scene._idleBobActive) return;
  scene.tweens.killTweensOf(scene.charSprite);
  scene.charSprite.setScale(cScale);
  scene._idleBobActive = false;
}
