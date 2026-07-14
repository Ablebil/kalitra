import React from 'react';
import { useGame } from '../store/GameContext';

export default function TopBar() {
  const { currentLevel } = useGame();

  return (
    <div id="topbar">
      <div className="brand">
        <span className="logo-emoji">🧭</span>
        <span className="brand-text">Kalitra</span>
      </div>
      <div className="level-info" id="level-info-text">
        <span className="lv-num">Lv {currentLevel}</span> Level {currentLevel}
      </div>
      <div className="top-actions">
        <button className="icon-btn" id="btn-mute" title="Suara">🔊</button>
        <button className="icon-btn" id="btn-menu" title="Menu Level">🏠</button>
      </div>
    </div>
  );
}