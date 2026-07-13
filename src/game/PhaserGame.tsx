import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './MainScene';
import { useGame } from '../store/GameContext';

export default function PhaserGame() {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserInstance = useRef<Phaser.Game | null>(null);
  const { program, setIsRunning, setRunStatus, setActiveBlockId, setModal } = useGame();

  useEffect(() => {
    // Inisialisasi Game Canvas ke div DOM
    if (gameRef.current && !phaserInstance.current) {
      phaserInstance.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: 800,
        height: 600,
        backgroundColor: '#transparent',
        transparent: true,
        scene: [MainScene]
      });
    }

    return () => {
      if (phaserInstance.current) {
        phaserInstance.current.destroy(true);
        phaserInstance.current = null;
      }
    };
  }, []);

  // Pendengar Event dari React UI ("JALANKAN")
  useEffect(() => {
    const handleRun = () => {
      if (!phaserInstance.current) return;
      const scene = phaserInstance.current.scene.getScene('MainScene') as MainScene;
      if (scene) {
        setIsRunning(true);
        scene.runProgram(program, {
          onBlockActive: (id: string) => setActiveBlockId(id),
          onStatusChange: (status: string) => setRunStatus(status),
          onComplete: (success: boolean, stars: number) => {
            setIsRunning(false);
            setActiveBlockId(null);
            if (success) {
              setModal(true, { type: 'success', emoji: '🎉', title: 'Berhasil!', message: 'Kamu mencapai tujuan!', stars });
            } else {
              setModal(true, { type: 'fail', emoji: '💥', title: 'Ups!', message: 'Karakter keluar jalur.' });
            }
          }
        });
      }
    };

    window.addEventListener('RUN_GAME', handleRun);
    return () => window.removeEventListener('RUN_GAME', handleRun);
  }, [program, setIsRunning, setRunStatus, setActiveBlockId, setModal]);

  return <div id="game-container" ref={gameRef}></div>;
}