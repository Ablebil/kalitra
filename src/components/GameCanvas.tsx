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

    // 1. Ekstensi tipe di root untuk menerima 'resolution'
    const config: Phaser.Types.Core.GameConfig & { resolution?: number } = {
      type: Phaser.AUTO,
      width: GAME_W,
      height: GAME_H,
      parent: container,
      resolution: window.devicePixelRatio || 1, 
      render: {
        transparent: true,
        antialias: true,
        roundPixels: true,
      },
      // 2. Inline casting (Type Assertion) untuk blok scale
      // Menginstruksikan TS bahwa objek ini adalah ScaleConfig standar DITAMBAH autoDensity
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoDensity: true,
      } as Phaser.Types.Core.ScaleConfig & { autoDensity?: boolean },
      scene: [MainScene],
    };

    const game = new Phaser.Game(config);

    game.registry.set("onSceneReadyCallback", onSceneReady);

    return () => {
      game.destroy(true);
    };
  }, [onSceneReady]);

  return <div ref={containerRef} className="flex items-center justify-center w-full h-full" />;
}