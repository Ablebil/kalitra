import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { BlockItem, ModalData } from '../types/game';

interface GameState {
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  program: BlockItem[];
  setProgram: React.Dispatch<React.SetStateAction<BlockItem[]>>;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  runStatus: string;
  setRunStatus: (status: string) => void;
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
  showModal: boolean;
  modalContent: ModalData | null;
  setModal: (show: boolean, content?: ModalData | null) => void;
}

const GameContext = createContext<GameState | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [program, setProgram] = useState<BlockItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState('Menyiapkan...');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<ModalData | null>(null);

  const setModal = (show: boolean, content: ModalData | null = null) => {
    setShowModal(show);
    setModalContent(content);
  };

  return (
    <GameContext.Provider value={{
      currentLevel, setCurrentLevel, program, setProgram,
      isRunning, setIsRunning, runStatus, setRunStatus,
      activeBlockId, setActiveBlockId, showModal, modalContent, setModal
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame harus digunakan di dalam GameProvider');
  return context;
};