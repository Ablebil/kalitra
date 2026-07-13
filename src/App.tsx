import React from 'react';
import TopBar from './components/TopBar';
import ControlPanel from './components/ControlPanel';
import Modal from './components/Modal';
import PhaserGame from './game/PhaserGame';
import { GameProvider, useGame } from './store/GameContext';

function GameLayout() {
  const { isRunning, runStatus } = useGame();

  const handleRun = () => {
    // Memberikan perintah run dari React Components ke Phaser Canvas Wrapper
    window.dispatchEvent(new CustomEvent('RUN_GAME'));
  };

  return (
    <div id="app">
      <TopBar />
      <div id="main">
        <div id="game-pane">
          <PhaserGame />
          <div id="run-status-banner" className={isRunning ? 'show' : ''}>
            {runStatus}
          </div>
        </div>
        <ControlPanel onRun={handleRun} />
      </div>
      <Modal />
      <div id="toast"></div> {/* Tempat rendering notifikasi bawah jika diperlukan */}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}