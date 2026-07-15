import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainScene } from "../game/scenes/MainScene.ts";
import { GAME_W, GAME_H } from "../game/utils/constants.ts";

interface GameCanvasProps {
  onSceneReady?: (scene: MainScene) => void;
}

export function GameCanvas({ onSceneReady }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: GAME_W,
      height: GAME_H,
      parent: container,
      render: {
        transparent: true,
        antialias: true,
        roundPixels: true, 
      },
      // Delegasi manajemen resolusi ke ScaleManager
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        resolution: window.devicePixelRatio || 1, // Menyelaraskan dengan physical pixel ratio
        autoDensity: true, // Menginstruksikan CSS canvas untuk beradaptasi dengan resolusi internal
      },
      scene: [MainScene],
    });

    game.registry.set("onSceneReadyCallback", onSceneReady);

    return () => {
      game.destroy(true);
    };
  }, [onSceneReady]);

  return <div ref={containerRef} className="flex items-center justify-center w-full h-full" />;
}