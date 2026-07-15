import { levels } from "../data/levels.ts";
import type { LevelData, FailReason } from "../types/index.ts";

interface LevelManagerCallbacks {
  showIntro: (level: LevelData) => void;
  showWin: (level: LevelData, stars: number, justUnlocked: boolean, isLast?: boolean) => void;
  showFail: (reason: FailReason) => void;
  showLevelSelect?: () => void;
  playSound?: (name: string) => void;
  onProgramReset?: () => void;
}

export class LevelManager {
  levelIndex = 0;
  unlockedCount = 1;
  starsPerLevel: Record<number, number> = {};
  private current = 0;
  private callbacks: LevelManagerCallbacks;

  constructor(callbacks: LevelManagerCallbacks) {
    this.callbacks = callbacks;
  }

  totalLevels(): number {
    return levels.length;
  }

  currentLevel(): LevelData {
    return levels[this.current];
  }

  currentIndex(): number {
    return this.current;
  }

  loadLevel(index: number): void {
    this.current = Math.max(0, Math.min(index, levels.length - 1));
    this.callbacks.showIntro(levels[this.current]);
  }

  computeStars(collected: Set<string>): number {
    return computeStars(this.currentLevel(), collected);
  }
}

export function computeStars(level: LevelData, collected: Set<string>): number {
  const total = level.collectibles.length;
  let stars = 1;
  collected.forEach(() => {
    stars++;
  });
  return Math.min(stars, total + 1);
}
