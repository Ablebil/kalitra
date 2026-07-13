import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { BlockItem, CommandType } from '../types/game';

export default function ControlPanel({ onRun }: { onRun: () => void }) {
  const { program, setProgram, isRunning, activeBlockId } = useGame();
  const [editingRepeatId, setEditingRepeatId] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addCommand = (type: CommandType) => {
    const newBlock: BlockItem = { id: generateId(), type };
    if (editingRepeatId) {
      setProgram(prev => prev.map(b => {
        if (b.type === 'repeat' && b.id === editingRepeatId) {
          return { ...b, children: [...b.children, newBlock] };
        }
        return b;
      }));
    } else {
      setProgram(prev => [...prev, newBlock]);
    }
  };

  const addRepeat = () => {
    const newBlock: BlockItem = { id: generateId(), type: 'repeat', count: 2, children: [] };
    setProgram(prev => [...prev, newBlock]);
    setEditingRepeatId(newBlock.id);
  };

  const undo = () => setProgram(prev => prev.slice(0, -1));
  
  const clear = () => {
    setProgram([]);
    setEditingRepeatId(null);
  };

  const renderBlock = (block: BlockItem) => {
    const isActive = activeBlockId === block.id;
    if (block.type === 'repeat') {
      return (
        <div key={block.id} className={`block block-repeat ${block.id === editingRepeatId ? 'active-container' : ''} ${isActive ? 'exec-active' : ''}`}>
          <div className="repeat-header">
            <span>🔁 Ulangi</span><span className="repeat-count">{block.count}x</span>
          </div>
          <div className="repeat-children">
            {block.children.map(renderBlock)}
          </div>
        </div>
      );
    }
    const label = block.type === 'forward' ? 'Maju' : block.type === 'left' ? 'Kiri' : 'Kanan';
    return (
      <div key={block.id} className={`block block-${block.type} block-atomic ${isActive ? 'exec-active' : ''}`}>
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div id="control-panel">
      <div className="panel-card">
        <div className="panel-title">🧩 Blok Perintah</div>
        <div id="palette">
          <button className="cmd-btn forward" disabled={isRunning} onClick={() => addCommand('forward')}><span className="cmd-icon"></span>Maju</button>
          <button className="cmd-btn left" disabled={isRunning} onClick={() => addCommand('left')}><span className="cmd-icon"></span>Kiri</button>
          <button className="cmd-btn right" disabled={isRunning} onClick={() => addCommand('right')}><span className="cmd-icon"></span>Kanan</button>
          <button className="cmd-btn repeat" style={{ gridColumn: 'span 3' }} disabled={isRunning || !!editingRepeatId} onClick={addRepeat}>
            <span className="cmd-icon">🔁</span>Ulangi (Repeat)
          </button>
        </div>
        {editingRepeatId && (
          <div id="repeat-done-row" className="show">
            <button id="repeat-done-btn" onClick={() => setEditingRepeatId(null)}>✅ Selesai Isi Repeat</button>
          </div>
        )}
      </div>

      <div className="panel-card" id="program-card">
        <div className="panel-title">📜 Program Kamu</div>
        <div id="program-list">
          {program.length === 0 && <div className="empty-hint">Belum ada blok instruksi</div>}
          {program.map(renderBlock)}
        </div>
        <div id="action-row">
          <button className="action-btn" id="btn-undo" disabled={isRunning || program.length === 0} onClick={undo}>↶<span>Undo</span></button>
          <button className="action-btn" id="btn-clear" disabled={isRunning || program.length === 0} onClick={clear}>🗑️<span>Hapus</span></button>
          <button className="action-btn" id="btn-run" disabled={isRunning || program.length === 0} onClick={onRun}>▶️<span>JALANKAN</span></button>
        </div>
      </div>
    </div>
  );
}