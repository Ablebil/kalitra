import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainScene } from "../game/scenes/MainScene.ts";
import { GAME_W, GAME_H } from "../game/utils/constants.ts";

interface GameCanvasProps {
  onSceneReady?: (scene: MainScene) => void;
}

/** Apply pixel-perfect scaling to the Phaser canvas.
 *
 * Strategy:
 *  - Integer zoom (2×, 3×, …) when the container is large enough — fully crisp.
 *  - Fractional CSS fill (Scale.FIT equivalent) when only 1× fits — fills space,
 *    slightly soft but better than a small floating canvas.
 */
function applyZoom(canvas: HTMLCanvasElement, container: HTMLElement): void {
  const { clientWidth: cw, clientHeight: ch } = container;
  if (cw === 0 || ch === 0) return;

  const intZoom = Math.floor(Math.min(cw / GAME_W, ch / GAME_H));

  if (intZoom >= 2) {
    // Full integer zoom: exactly N× — pixel-perfect.
    canvas.style.width = `${GAME_W * intZoom}px`;
    canvas.style.height = `${GAME_H * intZoom}px`;
    canvas.style.maxWidth = "";
    canvas.style.maxHeight = "";
  } else {
    // Container too small for 2×: fill it fractionally (like Scale.FIT).
    // image-rendering: pixelated in index.html keeps it as sharp as CSS allows.
    canvas.style.width = "";
    canvas.style.height = "";
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
  }
}

export function GameCanvas({ onSceneReady }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSceneReadyRef = useRef(onSceneReady);
  onSceneReadyRef.current = onSceneReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: GAME_W,
      height: GAME_H,
      parent: container,
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      // Note: Phaser 4 reads window.devicePixelRatio internally (OS.pixelRatio).
      render: {
        transparent: true,
        pixelArt: true,
        antialias: false,
        roundPixels: true,
      },
      // Scale.NONE — Phaser must NOT touch the canvas CSS size at all.
      // We own CSS sizing via integer zoom below.
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.NO_CENTER,
      },
      scene: [MainScene],
    });

    game.registry.set("onSceneReadyCallback", onSceneReadyRef.current);

    // Wire up integer-zoom once Phaser has created the canvas element.
    game.events.once(Phaser.Core.Events.READY, () => {
      const canvas = container.querySelector("canvas");
      if (!canvas) return;

      // Initial zoom.
      applyZoom(canvas, container);

      // Debounce re-zoom to one frame on container size changes.
      let rafId = 0;
      const onResize = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => applyZoom(canvas, container));
      };

      const ro = new ResizeObserver(onResize);
      ro.observe(container);

      // Stash cleanup so the destroy callback can reach it.
      (game as any).__zoomCleanup = () => {
        cancelAnimationFrame(rafId);
        ro.disconnect();
      };
    });

    return () => {
      const cleanup = (game as any).__zoomCleanup;
      if (typeof cleanup === "function") cleanup();
      game.destroy(true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
