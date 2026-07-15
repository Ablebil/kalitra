import { TILE, GAME_W, GAME_H, px, py, CHAR_ROW, DEBUG } from "../utils/constants.ts";
import { pickGrassKey, pickObstacleKey } from "../utils/helpers.ts";
import { decorateLevel } from "../utils/decorations.ts";
import type { ObstacleType } from "../types/index.ts";

// Character Y offset from tile centre, derived from:
//   minOffset = originY(0.86) * renderedH(TILE*1.02) - TILE/2 = TILE*0.3772
//   TILE * 0.38 gives topEdge margin = +0.28px (sprite head just inside tile bounds)
const CHAR_Y_OFFSET = TILE * 0.38;

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
    const spr = scene.add.image(px(origin.x, o.col), py(origin.y, o.row) + TILE * 0.42, key);
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
    py(origin.y, level.start.row) + CHAR_Y_OFFSET,
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

  // Idle bob tween — gentle scale-Y oscillation while not walking
  startIdleBob(scene, cScale);

  if (DEBUG) {
    // Tile grid overlay
    const gfx = scene.add.graphics();
    gfx.lineStyle(1, 0xff0000, 0.4);
    for (let r = 0; r <= level.rows; r++) {
      gfx.moveTo(px(origin.x, 0) - TILE / 2, py(origin.y, r) - TILE / 2);
      gfx.lineTo(px(origin.x, level.cols - 1) + TILE / 2, py(origin.y, r) - TILE / 2);
    }
    for (let c = 0; c <= level.cols; c++) {
      gfx.moveTo(px(origin.x, c) - TILE / 2, py(origin.y, 0) - TILE / 2);
      gfx.lineTo(px(origin.x, c) - TILE / 2, py(origin.y, level.rows - 1) + TILE / 2);
    }
    gfx.strokePath();
    gfx.setDepth(9999);
    scene.worldLayer.add(gfx);

    // Coordinate labels per tile
    const style = { fontSize: "11px", color: "#ff4444", fontFamily: "monospace" };
    for (let r = 0; r < level.rows; r++) {
      for (let c = 0; c < level.cols; c++) {
        const label = scene.add.text(px(origin.x, c), py(origin.y, r), `${c},${r}`, style);
        label.setOrigin(0.5, 0.5);
        label.setDepth(9998);
        scene.worldLayer.add(label);
      }
    }

    // Character bounding box
    const cs = scene.charSprite;
    const bb = scene.add.graphics();
    const w = 256 * scene.charScale;
    const h = 384 * scene.charScale;
    bb.lineStyle(2, 0x00ff00, 0.8);
    bb.strokeRect(cs.x - w / 2, cs.y - h * 0.86, w, h);
    bb.setDepth(9997);
    scene.worldLayer.add(bb);
  }
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

export { CHAR_Y_OFFSET };
