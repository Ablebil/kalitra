import { useReducer, useCallback } from "react";
import type { BlockNode, Direction, FailReason, GameState } from "../game/types/index.ts";
import { levels } from "../game/data/levels.ts";
import { computeStars } from "../game/utils/helpers.ts";

function findRepeatContainer(program: BlockNode[], id: string): BlockNode[] | null {
  for (const item of program) {
    if (item.id === id && item.type === "repeat")
      return (item as import("../game/types/index.ts").RepeatBlockNode).children;
    if (item.type === "repeat") {
      const found = findRepeatContainer(
        (item as import("../game/types/index.ts").RepeatBlockNode).children,
        id,
      );
      if (found) return found;
    }
  }
  return null;
}

function removeBlockFromList(
  list: BlockNode[],
  id: string,
): { list: BlockNode[]; removed: BlockNode | null } {
  const idx = list.findIndex((b) => b.id === id);
  if (idx !== -1) {
    const removed = list[idx];
    return { list: [...list.slice(0, idx), ...list.slice(idx + 1)], removed };
  }
  for (const item of list) {
    if (item.type === "repeat") {
      const result = removeBlockFromList(
        (item as import("../game/types/index.ts").RepeatBlockNode).children,
        id,
      );
      if (result.removed) {
        return {
          list: list.map((b) => (b.id === item.id ? { ...b, children: result.list } : b)),
          removed: result.removed,
        };
      }
    }
  }
  return { list, removed: null };
}

function newBlockId(counter: number): string {
  return "blk" + counter;
}

export interface GameActions {
  addAtomicBlock: (type: "forward" | "left" | "right") => void;
  addRepeatBlock: () => void;
  finishRepeatEdit: () => void;
  removeBlock: (id: string) => void;
  undoLast: () => void;
  clearAll: () => void;
  toggleMute: () => void;
  setRunning: (running: boolean) => void;
  loadLevel: (idx: number) => void;
  onLevelWin: () => number;
  onLevelFail: (reason: FailReason) => void;
  setCharState: (col: number, row: number, dir: Direction) => void;
  addCollected: (key: string) => void;
  resetWorldState: () => void;
}

type StateAction =
  | { type: "ADD_ATOMIC"; block: BlockNode; targetId: string | null }
  | { type: "ADD_REPEAT"; block: BlockNode }
  | { type: "FINISH_REPEAT_EDIT" }
  | { type: "REMOVE_BLOCK"; id: string }
  | { type: "UNDO_LAST"; targetId: string | null }
  | { type: "CLEAR_ALL" }
  | { type: "TOGGLE_MUTE" }
  | { type: "SET_RUNNING"; running: boolean }
  | { type: "LOAD_LEVEL"; idx: number }
  | { type: "SET_CHAR"; col: number; row: number; dir: Direction }
  | { type: "ADD_COLLECTED"; key: string }
  | { type: "RESET_WORLD" }
  | { type: "START_EDIT_REPEAT"; id: string; children: BlockNode[] }
  | { type: "UPDATE_REPEAT_COUNT"; id: string; delta: number }
  | { type: "SET_STARS"; levelIndex: number; stars: number }
  | { type: "UNLOCK_NEXT" };

const initialState: GameState = {
  levelIndex: 0,
  unlockedCount: 1,
  starsPerLevel: {},
  program: [],
  activeContainer: null,
  activeRepeatId: null,
  running: false,
  charCol: 0,
  charRow: 0,
  charDir: "right",
  collected: new Set<string>(),
  muted: false,
  blockIdCounter: 0,
};

function gameReducer(state: GameState, action: StateAction): GameState {
  switch (action.type) {
    case "ADD_ATOMIC": {
      const target = action.targetId
        ? findRepeatContainer(state.program, action.targetId)
        : state.program;
      if (!target) return state;
      const level = levels[state.levelIndex];
      const limit = action.targetId ? 6 : level?.maxTop || 10;
      if (target.length >= limit) return state;
      return {
        ...state,
        program: addBlockToTree(state.program, action.targetId, action.block),
        blockIdCounter: state.blockIdCounter + 1,
      };
    }
    case "ADD_REPEAT": {
      const level = levels[state.levelIndex];
      if (state.activeContainer) return state;
      if (state.program.length >= (level?.maxTop || 10)) return state;
      const repeatBlock = action.block as import("../game/types/index.ts").RepeatBlockNode;
      return {
        ...state,
        program: [...state.program, repeatBlock],
        activeContainer: repeatBlock.children,
        activeRepeatId: repeatBlock.id,
        blockIdCounter: state.blockIdCounter + 1,
      };
    }
    case "FINISH_REPEAT_EDIT":
      return { ...state, activeContainer: null, activeRepeatId: null };
    case "REMOVE_BLOCK": {
      const { list, removed } = removeBlockFromList(state.program, action.id);
      const shouldClear = removed && removed.id === state.activeRepeatId;
      return {
        ...state,
        program: list,
        activeContainer: shouldClear ? null : state.activeContainer,
        activeRepeatId: shouldClear ? null : state.activeRepeatId,
      };
    }
    case "UNDO_LAST": {
      const target = action.targetId
        ? findRepeatContainer(state.program, action.targetId)
        : state.program;
      if (!target || target.length === 0) return state;
      const removed = target[target.length - 1];
      const shouldClear = removed && removed.id === state.activeRepeatId;
      return {
        ...state,
        program: removeLastFromTree(state.program, action.targetId),
        activeContainer: shouldClear ? null : state.activeContainer,
        activeRepeatId: shouldClear ? null : state.activeRepeatId,
      };
    }
    case "CLEAR_ALL":
      if (state.program.length === 0) return state;
      return { ...state, program: [], activeContainer: null, activeRepeatId: null };
    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };
    case "SET_RUNNING":
      return { ...state, running: action.running };
    case "LOAD_LEVEL":
      return {
        ...state,
        levelIndex: action.idx,
        program: [],
        activeContainer: null,
        activeRepeatId: null,
        charCol: 0,
        charRow: 0,
        charDir: "right",
        collected: new Set<string>(),
        running: false,
      };
    case "SET_CHAR":
      return { ...state, charCol: action.col, charRow: action.row, charDir: action.dir };
    case "ADD_COLLECTED": {
      const next = new Set(state.collected);
      next.add(action.key);
      return { ...state, collected: next };
    }
    case "START_EDIT_REPEAT":
      return { ...state, activeContainer: action.children, activeRepeatId: action.id };
    case "UPDATE_REPEAT_COUNT": {
      const updateCount = (list: BlockNode[]): BlockNode[] =>
        list.map((item) => {
          if (item.id === action.id && item.type === "repeat") {
            const repeat = item as import("../game/types/index.ts").RepeatBlockNode;
            const newCount = Math.max(2, Math.min(8, repeat.count + action.delta));
            return { ...repeat, count: newCount };
          }
          if (item.type === "repeat") {
            return {
              ...item,
              children: updateCount(
                (item as import("../game/types/index.ts").RepeatBlockNode).children,
              ),
            };
          }
          return item;
        });
      return { ...state, program: updateCount(state.program) };
    }
    case "RESET_WORLD":
      return { ...state, collected: new Set<string>() };
    case "SET_STARS":
      return {
        ...state,
        starsPerLevel: { ...state.starsPerLevel, [action.levelIndex]: action.stars },
      };
    case "UNLOCK_NEXT":
      return { ...state, unlockedCount: state.unlockedCount + 1 };
    default:
      return state;
  }
}

function addBlockToTree(
  program: BlockNode[],
  targetId: string | null,
  block: BlockNode,
): BlockNode[] {
  if (!targetId) return [...program, block];
  return program.map((item) => {
    if (item.id === targetId && item.type === "repeat") {
      const repeat = item as import("../game/types/index.ts").RepeatBlockNode;
      return { ...repeat, children: [...repeat.children, block] };
    }
    if (item.type === "repeat") {
      return {
        ...item,
        children: addBlockToTree(
          (item as import("../game/types/index.ts").RepeatBlockNode).children,
          targetId,
          block,
        ),
      };
    }
    return item;
  });
}

function removeLastFromTree(program: BlockNode[], targetId: string | null): BlockNode[] {
  if (!targetId) return program.slice(0, -1);
  return program.map((item) => {
    if (item.id === targetId && item.type === "repeat") {
      const repeat = item as import("../game/types/index.ts").RepeatBlockNode;
      return { ...repeat, children: repeat.children.slice(0, -1) };
    }
    if (item.type === "repeat") {
      return {
        ...item,
        children: removeLastFromTree(
          (item as import("../game/types/index.ts").RepeatBlockNode).children,
          targetId,
        ),
      };
    }
    return item;
  });
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const addAtomicBlock = useCallback(
    (type: "forward" | "left" | "right") => {
      if (state.running) return;
      const block: BlockNode = { id: newBlockId(state.blockIdCounter), type };
      dispatch({ type: "ADD_ATOMIC", block, targetId: state.activeRepeatId });
    },
    [state.running, state.blockIdCounter, state.activeRepeatId],
  );

  const addRepeatBlock = useCallback(() => {
    if (state.running) return;
    if (state.activeContainer) return;
    const level = levels[state.levelIndex];
    if (!level) return;
    if (state.program.length >= (level.maxTop || 10)) return;
    const block: import("../game/types/index.ts").RepeatBlockNode = {
      id: newBlockId(state.blockIdCounter),
      type: "repeat",
      count: 2,
      children: [],
    };
    dispatch({ type: "ADD_REPEAT", block });
  }, [
    state.running,
    state.activeContainer,
    state.levelIndex,
    state.program.length,
    state.blockIdCounter,
  ]);

  const finishRepeatEdit = useCallback(() => {
    dispatch({ type: "FINISH_REPEAT_EDIT" });
  }, []);

  const removeBlock = useCallback(
    (id: string) => {
      if (state.running) return;
      dispatch({ type: "REMOVE_BLOCK", id });
    },
    [state.running],
  );

  const undoLast = useCallback(() => {
    if (state.running) return;
    dispatch({ type: "UNDO_LAST", targetId: state.activeRepeatId });
  }, [state.running, state.activeRepeatId]);

  const clearAll = useCallback(() => {
    if (state.running) return;
    dispatch({ type: "CLEAR_ALL" });
  }, [state.running]);

  const toggleMute = useCallback(() => {
    dispatch({ type: "TOGGLE_MUTE" });
  }, []);

  const setRunning = useCallback((running: boolean) => {
    dispatch({ type: "SET_RUNNING", running });
  }, []);

  const loadLevel = useCallback((idx: number) => {
    dispatch({ type: "LOAD_LEVEL", idx });
  }, []);

  const onLevelWin = useCallback(
    (collectedOverride?: Set<string>): number => {
      const level = levels[state.levelIndex];
      if (!level) return 1;
      const collected = collectedOverride || state.collected;
      const stars = computeStars(level, collected);
      const prevBest = state.starsPerLevel[state.levelIndex] || 0;
      if (stars > prevBest) {
        dispatch({ type: "SET_STARS", levelIndex: state.levelIndex, stars });
      }
      const isLast = state.levelIndex === levels.length - 1;
      if (state.levelIndex + 1 === state.unlockedCount && !isLast) {
        dispatch({ type: "UNLOCK_NEXT" });
      }
      return stars;
    },
    [state.levelIndex, state.collected, state.starsPerLevel, state.unlockedCount],
  );

  const onLevelFail = useCallback((_reason: FailReason) => {}, []);

  const setCharState = useCallback((col: number, row: number, dir: Direction) => {
    dispatch({ type: "SET_CHAR", col, row, dir });
  }, []);

  const addCollected = useCallback((key: string) => {
    dispatch({ type: "ADD_COLLECTED", key });
  }, []);

  const startEditRepeat = useCallback((id: string, children: BlockNode[]) => {
    dispatch({ type: "START_EDIT_REPEAT", id, children });
  }, []);

  const updateRepeatCount = useCallback((id: string, delta: number) => {
    dispatch({ type: "UPDATE_REPEAT_COUNT", id, delta });
  }, []);

  const resetWorldState = useCallback(() => {
    dispatch({ type: "RESET_WORLD" });
  }, []);

  return {
    state,
    addAtomicBlock,
    addRepeatBlock,
    finishRepeatEdit,
    removeBlock,
    undoLast,
    clearAll,
    toggleMute,
    setRunning,
    loadLevel,
    onLevelWin,
    onLevelFail,
    setCharState,
    addCollected,
    resetWorldState,
    startEditRepeat,
    updateRepeatCount,
  };
}
