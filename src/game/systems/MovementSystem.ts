import { sleep, tweenPromise } from "../utils/helpers.ts";
import { TILE, CHAR_ROW, px, py, DIRS } from "../utils/constants.ts";
import { addFootprint, clearFootprints } from "./LevelBuilder.ts";
import { playSound } from "../../lib/audio.ts";
import type { LevelData, Direction } from "../types/index.ts";

export interface MovementState {
  charCol: number;
  charRow: number;
  charDir: Direction;
}

export async function moveForward(
  scene: any,
  level: LevelData,
  state: MovementState,
): Promise<"ok" | "obstacle" | "bounds"> {
  const { charCol, charRow, charDir } = state;
  const dirIdx = DIRS.indexOf(charDir);
  const dr = dirIdx === 0 ? -1 : dirIdx === 2 ? 1 : 0;
  const dc = dirIdx === 1 ? 1 : dirIdx === 3 ? -1 : 0;
  const nc = charCol + dc;
  const nr = charRow + dr;
  if (nr < 0 || nr >= level.rows || nc < 0 || nc >= level.cols) {
    await bumpEffect(scene, [dc, dr]);
    return "bounds";
  }
  if (level.obstacles.some((o) => o.col === nc && o.row === nr)) {
    await bumpEffect(scene, [dc, dr]);
    return "obstacle";
  }
  const cs = scene.charSprite;
  const origin = scene.levelOrigin;
  cs.play("walk-" + charDir);
  playSound(scene.muted, "step");
  await tweenPromise(scene, cs, {
    x: px(origin.x, nc),
    y: py(origin.y, nr) + TILE * 0.3,
    duration: 380,
    ease: "Linear",
    onUpdate: () => {
      cs.setDepth(cs.y);
    },
  });
  cs.stop();
  cs.setFrame(CHAR_ROW[charDir] * 4);
  addFootprint(scene, charCol, charRow);
  state.charCol = nc;
  state.charRow = nr;
  cs.setDepth(py(origin.y, nr) + 1);
  const key = nc + "," + nr;
  if (scene.collectibleSprites[key]) {
    const spr = scene.collectibleSprites[key];
    if (!scene.collectedSet) scene.collectedSet = new Set<string>();
    if (!scene.collectedSet.has(key)) {
      scene.collectedSet.add(key);
      playSound(scene.muted, "collect");
      await tweenPromise(scene, spr, {
        scaleX: spr.scaleX * 1.6,
        scaleY: spr.scaleY * 1.6,
        alpha: 0,
        y: spr.y - 30,
        duration: 380,
        ease: "Back.easeIn",
      });
      spr.setVisible(false);
    }
  }
  return "ok";
}

export async function turnChar(scene: any, state: MovementState, delta: number): Promise<void> {
  const idx = (DIRS.indexOf(state.charDir) + delta + 4) % 4;
  state.charDir = DIRS[idx];
  const cs = scene.charSprite;
  cs.setFrame(CHAR_ROW[state.charDir] * 4);
  playSound(scene.muted, "turn");
  const baseX = scene.charScale;
  await tweenPromise(scene, cs, {
    scaleX: baseX * 1.18,
    scaleY: baseX * 1.18,
    duration: 110,
    yoyo: true,
    ease: "Quad.easeOut",
  });
  cs.setScale(baseX);
}

async function bumpEffect(scene: any, dirVec: [number, number]): Promise<void> {
  playSound(scene.muted, "bump");
  const cs = scene.charSprite;
  const ox = cs.x;
  const oy = cs.y;
  await tweenPromise(scene, cs, {
    x: ox + dirVec[0] * 16,
    y: oy + dirVec[1] * 16,
    duration: 90,
    yoyo: true,
    ease: "Quad.easeOut",
  });
  cs.setTint(0xff8a80);
  await sleep(160);
  cs.clearTint();
}

export function resetWorldState(scene: any, level: LevelData, state: MovementState): void {
  clearFootprints(scene);
  if (scene.collectedSet) scene.collectedSet.clear();
  Object.values(scene.collectibleSprites).forEach((spr: any) => {
    scene.tweens.killTweensOf(spr);
    spr.setVisible(true);
    spr.setAlpha(1);
    const baseScale = spr.getData("baseScale");
    if (baseScale) {
      spr.setScale(baseScale);
    }
    const baseY = spr.getData("baseY");
    if (baseY !== undefined) {
      spr.y = baseY;
    }
    spr.angle = 0;
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
  });
  state.charCol = level.start.col;
  state.charRow = level.start.row;
  state.charDir = level.start.dir;
  const origin = scene.levelOrigin;
  const cs = scene.charSprite;
  cs.stop();
  cs.setFrame(CHAR_ROW[level.start.dir] * 4);
  cs.setPosition(px(origin.x, level.start.col), py(origin.y, level.start.row) + TILE * 0.3);
  cs.setDepth(py(origin.y, level.start.row) + 1);
  cs.clearTint();
  cs.setScale(scene.charScale);
}
