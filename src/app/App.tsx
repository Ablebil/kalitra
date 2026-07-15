import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Puzzle, VolumeX, Volume2, Home, Check } from "lucide-react";
import { GameCanvas } from "../components/GameCanvas.tsx";
import { CommandPalette } from "../components/CommandPalette.tsx";
import { ProgramList } from "../components/ProgramList.tsx";
import { ActionButtons } from "../components/ActionButtons.tsx";
import { IntroModal } from "../components/IntroModal.tsx";
import { WinModal } from "../components/WinModal.tsx";
import { FailModal } from "../components/FailModal.tsx";
import { LevelSelectModal } from "../components/LevelSelectModal.tsx";
import { Toast } from "../components/Toast.tsx";
import { LevelManager } from "../game/managers/LevelManager.ts";
import { SaveManager } from "../game/managers/SaveManager.ts";
import { executeList, resetStop } from "../game/systems/ExecutionEngine.ts";
import { resetWorldState } from "../game/systems/MovementSystem.ts";
import { startIdleBob } from "../game/systems/LevelBuilder.ts";
import { levels } from "../game/data/levels.ts";
import { useGameState } from "../hooks/useGameState.ts";
import { useAudio } from "../hooks/useAudio.ts";
import type { LevelData } from "../game/types/index.ts";

const saveManager = new SaveManager();

export function AppShell() {
  const {
    state,
    addAtomicBlock,
    addRepeatBlock,
    finishRepeatEdit,
    removeBlock,
    undoLast,
    clearAll,
    toggleMute,
    setRunning,
    loadLevel: loadLevelAction,
    onLevelWin: onLevelWinAction,
    startEditRepeat,
    updateRepeatCount,
  } = useGameState();

  const { sound, toggleMute: toggleMuteAudio } = useAudio(state.muted, (muted) => {
    if (muted !== state.muted) toggleMute();
  });

  const sceneRef = useRef<any>(null);
  const levelManagerRef = useRef<LevelManager | null>(null);
  const [execHighlights, setExecHighlights] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{
    type: string;
    level?: LevelData;
    stars?: number;
    justUnlocked?: boolean;
    isLast?: boolean;
    reason?: string;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [levelSelectOpen, setLevelSelectOpen] = useState(false);

  const { scrambledUnlockedCount, scrambledStarsPerLevel } = useMemo(() => {
    const saved = saveManager.load();
    return {
      scrambledUnlockedCount: saved.unlockedCount > 0 ? saved.unlockedCount : 1,
      scrambledStarsPerLevel: saved.starsPerLevel || {},
    };
  }, []);

  const effectiveUnlockedCount = Math.max(state.unlockedCount, scrambledUnlockedCount);
  const effectiveStarsPerLevel = { ...scrambledStarsPerLevel, ...state.starsPerLevel };

  const onSceneReady = useCallback(
    (scene: any) => {
      sceneRef.current = scene;
      levelManagerRef.current = new LevelManager({
        showIntro: (level) => setModal({ type: "intro", level }),
        showWin: (level, stars, justUnlocked, isLast) =>
          setModal({ type: "win", level, stars, justUnlocked, isLast }),
        showFail: (reason) => setModal({ type: "fail", reason }),
        showLevelSelect: () => setLevelSelectOpen(true),
        playSound: (name: string) => sound(name),
        onProgramReset: () => {
          // state reset is handled by loadLevelAction in handleLevelSelect
        },
      });
    },
    [sound],
  );

  useEffect(() => {
    if (!sceneRef.current || !levelManagerRef.current) return;
    const lm = levelManagerRef.current;
    lm.levelIndex = state.levelIndex;
    lm.unlockedCount = state.unlockedCount;
    lm.starsPerLevel = state.starsPerLevel;
  }, [state.levelIndex, state.unlockedCount, state.starsPerLevel]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.muted = state.muted;
    }
  }, [state.muted]);

  const handleLevelSelect = useCallback(
    (idx: number) => {
      setLevelSelectOpen(false);
      loadLevelAction(idx);
      if (sceneRef.current && levelManagerRef.current) {
        levelManagerRef.current.loadLevel(idx);
      }
    },
    [loadLevelAction],
  );

  const handleStartLevel = useCallback(() => {
    setModal(null);
    if (sceneRef.current) {
      sceneRef.current.loadLevel(state.levelIndex);
    }
  }, [state.levelIndex]);

  // Derived limit values — re-computed on every render so handlers close over them
  const _activeLevel = levels[state.levelIndex];
  const _isInRepeat = !!state.activeRepeatId;
  const _blockCount = _isInRepeat ? (state.activeContainer?.length ?? 0) : state.program.length;
  const _maxBlocks = _isInRepeat ? 6 : _activeLevel?.maxTop || 10;
  const _atLimit = _blockCount >= _maxBlocks;
  const _atLimitMsg = _isInRepeat
    ? `Batas ${_maxBlocks} blok di dalam Ulangi! Selesaikan dulu atau hapus blok.`
    : `Batas ${_maxBlocks} blok! Coba gunakan Ulangi untuk lebih banyak langkah.`;

  const handleAddForward = useCallback(() => {
    if (state.running) return;
    if (_atLimit) {
      setToastMsg(_atLimitMsg);
      return;
    }
    addAtomicBlock("forward");
    sound("click");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.running, _atLimit, _atLimitMsg, addAtomicBlock, sound]);

  const handleAddLeft = useCallback(() => {
    if (state.running) return;
    if (_atLimit) {
      setToastMsg(_atLimitMsg);
      return;
    }
    addAtomicBlock("left");
    sound("click");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.running, _atLimit, _atLimitMsg, addAtomicBlock, sound]);

  const handleAddRight = useCallback(() => {
    if (state.running) return;
    if (_atLimit) {
      setToastMsg(_atLimitMsg);
      return;
    }
    addAtomicBlock("right");
    sound("click");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.running, _atLimit, _atLimitMsg, addAtomicBlock, sound]);

  const handleAddRepeat = useCallback(() => {
    if (state.running) return;
    if (state.activeContainer) return;
    if (_atLimit) {
      setToastMsg(_atLimitMsg);
      return;
    }
    addRepeatBlock();
    sound("click");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.running, state.activeContainer, _atLimit, _atLimitMsg, addRepeatBlock, sound]);

  const handleRemoveBlock = useCallback(
    (id: string) => {
      if (state.running) return;
      removeBlock(id);
      sound("click");
    },
    [state.running, removeBlock, sound],
  );

  const handleStartEdit = useCallback(
    (id: string, children: any[]) => {
      if (state.activeContainer) return;
      startEditRepeat(id, children);
      sound("click");
    },
    [state.activeContainer, startEditRepeat, sound],
  );

  const handleDecCount = useCallback(
    (id: string) => {
      if (state.running) return;
      updateRepeatCount(id, -1);
      sound("click");
    },
    [state.running, updateRepeatCount, sound],
  );

  const handleIncCount = useCallback(
    (id: string) => {
      if (state.running) return;
      updateRepeatCount(id, 1);
      sound("click");
    },
    [state.running, updateRepeatCount, sound],
  );

  const handleUndo = useCallback(() => {
    if (state.running) return;
    undoLast();
    sound("click");
  }, [state.running, undoLast, sound]);

  const handleClear = useCallback(() => {
    if (state.running) return;
    clearAll();
    sound("click");
  }, [state.running, clearAll, sound]);

  const handleRun = useCallback(async () => {
    if (state.running) return;
    if (state.program.length === 0) {
      setToastMsg("Susun dulu perintahnya, yuk!");
      return;
    }
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const level = levels[state.levelIndex];
    if (!level) return;

    setRunning(true);
    resetStop();
    setExecHighlights(new Set());

    const highlightCb = (id: string, on: boolean) => {
      setExecHighlights((prev) => {
        const next = new Set(prev);
        if (on) next.add(id);
        else next.delete(id);
        return next;
      });
    };

    const execState = {
      charCol: level.start.col,
      charRow: level.start.row,
      charDir: level.start.dir,
      collected: new Set<string>(),
    };
    resetWorldState(scene, level, execState);
    const result = await executeList(scene, level, execState, state.program, highlightCb);

    setExecHighlights(new Set());
    setRunning(false);

    // Resume idle bob after execution ends regardless of result
    if (scene.charSprite && scene.charScale) {
      startIdleBob(scene, scene.charScale);
    }

    if (result === "stopped") return;

    if (result === "ok") {
      const atFinish =
        execState.charCol === level.finish.col && execState.charRow === level.finish.row;
      if (atFinish) {
        const stars = onLevelWinAction(scene.collectedSet);
        const isLast = state.levelIndex === levels.length - 1;
        const justUnlocked = state.levelIndex + 1 === state.unlockedCount && !isLast;
        sound("win");
        setModal({ type: "win", level, stars, justUnlocked, isLast });
      } else {
        sound("fail");
        setModal({ type: "fail", reason: "notreach" });
      }
    } else {
      sound("fail");
      setModal({ type: "fail", reason: result === "obstacle" ? "obstacle" : "bounds" });
    }
  }, [
    state.running,
    state.program,
    state.levelIndex,
    state.unlockedCount,
    setRunning,
    onLevelWinAction,
    sound,
  ]);

  const handleReplay = useCallback(() => {
    setModal(null);
    if (!sceneRef.current) return;
    const level = levels[state.levelIndex];
    if (!level) return;
    resetWorldState(sceneRef.current, level, state as any);
  }, [state]);

  const handleNextLevel = useCallback(() => {
    setModal(null);
    const idx = state.levelIndex + 1;
    if (idx >= levels.length) return;
    loadLevelAction(idx);
    if (sceneRef.current && levelManagerRef.current) {
      levelManagerRef.current.loadLevel(idx);
    }
  }, [state.levelIndex, loadLevelAction]);

  const handleMenu = useCallback(() => {
    setModal(null);
    setLevelSelectOpen(true);
  }, []);

  const handleFinishRepeat = useCallback(() => {
    finishRepeatEdit();
    sound("click");
  }, [finishRepeatEdit, sound]);

  const currentLevel = levels[state.levelIndex];
  const isEditingRepeat = !!state.activeRepeatId;
  // Limit values for passing to UI components
  const uiBlockCount = _blockCount;
  const uiMaxBlocks = _maxBlocks;
  const uiAtLimit = _atLimit;

  return (
    <div
      className="flex flex-col h-dvh w-full"
      style={{ background: "linear-gradient(180deg,#8ed4f5,#ffe9b8)" }}
    >
      {/* TOPBAR */}
      <header className="flex items-center justify-between px-[14px] py-2 bg-white/80 backdrop-blur-sm border-b-3 border-white/50 shrink-0 gap-2">
        <div className="flex items-center gap-2 font-extrabold text-xl text-[#4a3728] tracking-[0.5px]">
          <img
            src="/assets/icon.png"
            className="h-[28px] w-auto drop-shadow-[0_2px_0_rgba(0,0,0,0.15)]"
          />
          <span className="max-[480px]:hidden">Kalitra</span>
        </div>
        <div className="font-bold text-[14px] text-[#7a6552] text-center flex-1 truncate">
          {currentLevel && (
            <>
              <span className="inline-block bg-purple-400 text-white rounded-[20px] px-[10px] py-[2px] mr-[6px] text-[12px]">
                {currentLevel.id}
              </span>
              {currentLevel.name}
            </>
          )}
        </div>
        <div className="flex gap-[6px] items-center">
          <button
            className="w-[38px] h-[38px] rounded-full border-none cursor-pointer bg-gradient-to-b from-white to-[#eee6d6] shadow-[0_3px_0_rgba(0,0,0,0.15)] text-[18px] flex items-center justify-center active:translate-y-[2px] active:shadow-[0_1px_0_rgba(0,0,0,0.15)]"
            onClick={() => {
              const wasMuted = state.muted;
              toggleMuteAudio();
              if (wasMuted) sound("click");
            }}
          >
            {state.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            className="w-[38px] h-[38px] rounded-full border-none cursor-pointer bg-gradient-to-b from-white to-[#eee6d6] shadow-[0_3px_0_rgba(0,0,0,0.15)] text-[18px] flex items-center justify-center active:translate-y-[2px] active:shadow-[0_1px_0_rgba(0,0,0,0.15)]"
            onClick={() => setLevelSelectOpen(true)}
          >
            <Home size={18} />
          </button>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex-1 flex min-h-0 p-2.5 gap-2.5 max-[820px]:flex-col max-[820px]:p-2 max-[820px]:gap-2">
        {/* GAME PANE */}
        <div className="flex-[1.35] flex items-center justify-center min-w-0 min-h-0 relative">
          <GameCanvas onSceneReady={onSceneReady} />
          {state.running && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#4a3728] text-white px-[18px] py-[7px] rounded-[30px] font-bold text-[13px] shadow-[0_4px_10px_rgba(0,0,0,0.25)] pointer-events-none whitespace-nowrap z-5">
              Menjalankan program...
            </div>
          )}
        </div>

        {/* CONTROL PANEL */}
        <div className="flex-1 max-w-[380px] min-w-[260px] flex flex-col gap-2 min-h-0 max-[820px]:max-w-none">
          <CommandPalette
            onAddForward={handleAddForward}
            onAddLeft={handleAddLeft}
            onAddRight={handleAddRight}
            onAddRepeat={handleAddRepeat}
            disabled={state.running}
            repeatDisabled={state.running || !!state.activeContainer}
            atLimit={!state.running && uiAtLimit}
          />

          <ProgramList
            program={state.program}
            activeRepeatId={state.activeRepeatId}
            editingAnotherRepeat={isEditingRepeat}
            execHighlights={execHighlights}
            onRemove={handleRemoveBlock}
            onStartEdit={handleStartEdit}
            onDecCount={handleDecCount}
            onIncCount={handleIncCount}
            disabled={state.running}
            blockCount={uiBlockCount}
            maxBlocks={uiMaxBlocks}
          />

          {state.activeRepeatId && (
            <button
              className="w-full border-none rounded-[9px] cursor-pointer py-3 px-[10px] font-extrabold text-[13px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)] disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-opacity"
              style={{ background: "linear-gradient(180deg,#7cc142,#59a02a)" }}
              onClick={handleFinishRepeat}
              disabled={state.running}
            >
              <Check size={16} /> Selesai
            </button>
          )}

          <ActionButtons
            onUndo={handleUndo}
            onClear={handleClear}
            onRun={handleRun}
            disabled={state.running || state.program.length === 0}
          />
        </div>
      </div>

      {/* MODALS */}
      {modal?.type === "intro" && modal.level && (
        <IntroModal open level={modal.level} onStart={handleStartLevel} />
      )}
      {modal?.type === "win" && modal.level && (
        <WinModal
          open
          level={modal.level}
          stars={modal.stars || 1}
          justUnlocked={modal.justUnlocked || false}
          isLast={modal.isLast || false}
          onReplay={handleReplay}
          onNext={handleNextLevel}
          onMenu={handleMenu}
        />
      )}
      {modal?.type === "fail" && (
        <FailModal
          open
          reason={modal.reason || "notreach"}
          onRetry={handleReplay}
          onMenu={handleMenu}
        />
      )}

      <LevelSelectModal
        open={levelSelectOpen}
        unlockedCount={effectiveUnlockedCount}
        starsPerLevel={effectiveStarsPerLevel}
        onSelect={handleLevelSelect}
        onClose={() => setLevelSelectOpen(false)}
      />

      {toastMsg && (
        <Toast
          message={toastMsg}
          icon={<Puzzle size={16} className="inline-block align-middle" />}
          onDone={() => setToastMsg(null)}
        />
      )}
    </div>
  );
}
