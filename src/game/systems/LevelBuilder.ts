import { TILE, GAME_W, GAME_H, px, py, CHAR_ROW } from "../utils/constants.ts";
import { pickGrassKey, pickObstacleKey } from "../utils/helpers.ts";
import type { LevelData, ObstacleType } from "../types/index.ts";

function obstacleFit(sprite: Phaser.GameObjects.Image, type: ObstacleType): void {
  const targets: Record<string, number> = { bush: 0.82, tree: 0.92, rock: 0.72, fence: 0.86 };
  const maxDim = TILE * (targets[type] || 0.8);
  const s = Math.min(maxDim / sprite.width, maxDim / sprite.height);
  sprite.setScale(s);
  sprite.setOrigin(0.5, 0.86);
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
    const spr = scene.add.image(px(origin.x, o.col), py(origin.y, o.row) + TILE * 0.42, key);
    obstacleFit(spr, o.type);
    spr.setDepth(py(origin.y, o.row));
    scene.worldLayer.add(spr);
  });

  const sm = scene.add.ellipse(
    px(origin.x, level.start.col),
    py(origin.y, level.start.row) + TILE * 0.32,
    TILE * 0.62,
    TILE * 0.28,
    0xffffff,
    0.35,
  );
  sm.setDepth(-500);
  scene.worldLayer.add(sm);

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
    const baseY = py(origin.y, cItem.row) - 6;
    const spr = scene.add.image(baseX, baseY, "book");
    const s = Math.min((TILE * 0.5) / spr.width, (TILE * 0.5) / spr.height);
    spr.setScale(s);
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

  const FRAME_W = 256;
  const FRAME_H = 384;
  const cs = scene.add.sprite(
    px(origin.x, level.start.col),
    py(origin.y, level.start.row) + TILE * 0.3,
    "character",
    CHAR_ROW[level.start.dir] * 4,
  );
  const cScale = Math.min((TILE * 0.72) / FRAME_W, (TILE * 1.02) / FRAME_H);
  cs.setScale(cScale);
  cs.setOrigin(0.5, 0.86);
  cs.setDepth(py(origin.y, level.start.row) + 1);
  scene.worldLayer.add(cs);
  scene.charSprite = cs;
  scene.charScale = cScale;
}
