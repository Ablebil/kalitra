export type Direction = "up" | "right" | "down" | "left";

export type DirVec = [number, number];

export type ObstacleType = "bush" | "tree" | "rock" | "fence";

export type BuildingType = "house" | "school";

export type CommandType = "forward" | "left" | "right" | "repeat";

export interface AtomicBlockNode {
  id: string;
  type: "forward" | "left" | "right";
}

export interface RepeatBlockNode {
  id: string;
  type: "repeat";
  count: number;
  children: BlockNode[];
}

export type BlockNode = AtomicBlockNode | RepeatBlockNode;

export interface LevelStart {
  col: number;
  row: number;
  dir: Direction;
}

export interface LevelFinish {
  col: number;
  row: number;
  building: BuildingType;
}

export interface LevelObstacle {
  col: number;
  row: number;
  type: ObstacleType;
}

export interface LevelCollectible {
  col: number;
  row: number;
}

export interface LevelData {
  id: number;
  name: string;
  cols: number;
  rows: number;
  start: LevelStart;
  finish: LevelFinish;
  obstacles: LevelObstacle[];
  collectibles: LevelCollectible[];
  intro: string;
  maxTop: number;
}

export type ExecuteResult = "ok" | "obstacle" | "bounds" | "stopped";

export type FailReason = "obstacle" | "bounds" | "notreach";

export type ObstacleKey =
  | "bush0"
  | "bush1"
  | "bush2"
  | "tree0"
  | "tree1"
  | "tree2"
  | "rock0"
  | "rock1"
  | "rock2"
  | "fence0"
  | "fence1"
  | "fence2";

export type GrassKey = "grass0" | "grass1" | "grass2";

export interface GameState {
  levelIndex: number;
  unlockedCount: number;
  starsPerLevel: Record<number, number>;
  program: BlockNode[];
  activeContainer: BlockNode[] | null;
  activeRepeatId: string | null;
  running: boolean;
  charCol: number;
  charRow: number;
  charDir: Direction;
  collected: Set<string>;
  muted: boolean;
  blockIdCounter: number;
}
