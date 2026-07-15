const SAVE_KEY = "kalitra_save";

interface SaveData {
  unlockedCount: number;
  starsPerLevel: Record<number, number>;
}

export class SaveManager {
  load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { unlockedCount: 0, starsPerLevel: {} };
      return JSON.parse(raw) as SaveData;
    } catch {
      return { unlockedCount: 0, starsPerLevel: {} };
    }
  }

  save(data: SaveData): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // silently fail
    }
  }
}
