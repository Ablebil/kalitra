import React from 'react';
import { useGame } from '../store/GameContext';

export default function Modal() {
  const { showModal, modalContent, setModal } = useGame();

  if (!showModal || !modalContent) return null;

  return (
    <div id="modal-overlay" className="show">
      <div className="modal-card">
        {modalContent.type === 'success' && <img id="success-fx-img" src="/assets/effects/success.png" alt="Success FX" />}
        <span id="modal-emoji">{modalContent.emoji}</span>
        <h2>{modalContent.title}</h2>
        <p>{modalContent.message}</p>
        
        {modalContent.type === 'success' && (
          <div className="stars-row">
            {[1, 2, 3].map(s => (
              <span key={s} className={`star ${s <= (modalContent.stars || 0) ? 'earned' : ''}`}>⭐</span>
            ))}
          </div>
        )}

        <div className="modal-btn-row">
          <button className="modal-btn tertiary" onClick={() => setModal(false)}>Tutup</button>
          <button className="modal-btn primary" onClick={() => {
            setModal(false);
            window.dispatchEvent(new CustomEvent(modalContent.type === 'success' ? 'NEXT_LEVEL' : 'RETRY_LEVEL'));
          }}>
            {modalContent.type === 'success' ? 'Selanjutnya ➡️' : 'Coba Lagi 🔄'}
          </button>
        </div>
      </div>
    </div>
  );
}