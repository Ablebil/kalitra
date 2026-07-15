import { sleep } from "../utils/helpers.ts";
import { moveForward, turnChar, resetWorldState, type MovementState } from "./MovementSystem.ts";
import type { BlockNode, LevelData, ExecuteResult } from "../types/index.ts";

let stopRequested = false;

export function requestStop(): void {
  stopRequested = true;
}

export function resetStop(): void {
  stopRequested = false;
}

export async function executeAtomic(
  scene: Parameters<typeof moveForward>[0],
  level: LevelData,
  state: MovementState,
  type: string,
): Promise<"ok" | "obstacle" | "bounds"> {
  if (type === "forward") return await moveForward(scene, level, state);
  if (type === "left") {
    await turnChar(scene, state, -1);
    return "ok";
  }
  if (type === "right") {
    await turnChar(scene, state, 1);
    return "ok";
  }
  return "ok";
}

export async function executeList(
  scene: Parameters<typeof moveForward>[0],
  level: LevelData,
  state: MovementState,
  list: BlockNode[],
  highlightCb?: (id: string, on: boolean) => void,
): Promise<ExecuteResult> {
  for (const item of list) {
    if (stopRequested) return "stopped";
    highlightCb?.(item.id, true);
    if (item.type === "repeat") {
      for (let i = 0; i < item.count; i++) {
        if (stopRequested) {
          highlightCb?.(item.id, false);
          return "stopped";
        }
        const r = await executeList(scene, level, state, item.children, highlightCb);
        if (r !== "ok") {
          highlightCb?.(item.id, false);
          return r;
        }
      }
    } else {
      const r = await executeAtomic(scene, level, state, item.type);
      if (r !== "ok") {
        highlightCb?.(item.id, false);
        return r;
      }
    }
    highlightCb?.(item.id, false);
    await sleep(60);
  }
  return "ok";
}
