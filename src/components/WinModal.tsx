import { Star, PartyPopper, RotateCcw, ArrowRight, Home } from "lucide-react";
import { Modal } from "./Modal.tsx";
import type { LevelData } from "../game/types/index.ts";

interface WinModalProps {
  open: boolean;
  level: LevelData;
  stars: number;
  justUnlocked: boolean;
  isLast: boolean;
  onReplay: () => void;
  onNext: () => void;
  onMenu: () => void;
}

export function WinModal({
  open,
  level,
  stars,
  justUnlocked,
  isLast,
  onReplay,
  onNext,
  onMenu,
}: WinModalProps) {
  const maxStars = level.collectibles.length + 1;
  const starEls = [];
  for (let i = 0; i < maxStars; i++) {
    const earned = i < stars;
    starEls.push(
      <span
        key={i}
        className={`inline-flex ${earned ? "" : "grayscale opacity-35"}`}
        style={earned ? { animation: `starPop 0.4s ease ${i * 0.15}s` } : undefined}
      >
        <Star
          size={40}
          fill={earned ? "#fbbf24" : "none"}
          stroke={earned ? "#fbbf24" : "#9ca3af"}
          strokeWidth={1.5}
        />
      </span>,
    );
  }

  return (
    <Modal open={open}>
      <img
        src="/assets/success.png"
        alt=""
        className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[260px] pointer-events-none"
      />
      <PartyPopper size={54} className="block mb-[2px] mx-auto" />
      <h2 className="text-[22px] font-extrabold text-[#4a3728] my-[4px_6px]">Level Selesai!</h2>
      <p className="text-[14.5px] font-semibold text-[#7a6552] leading-relaxed my-[4px_14px]">
        Prompt berhasil sampai tujuan di level "<b>{level.name}</b>".
        {justUnlocked && " Level baru terbuka!"}
      </p>
      <div className="flex justify-center gap-[6px] my-[8px_14px]">{starEls}</div>
      <div className="flex gap-2 mt-[6px] flex-wrap">
        <button
          className="flex-1 min-w-[110px] border-none rounded-[14px] cursor-pointer py-3 px-[10px] font-extrabold text-[14px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)] flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(180deg,#cfcfcf,#a3a3a3)" }}
          onClick={onReplay}
        >
          <RotateCcw size={16} /> Ulangi
        </button>
        {!isLast && (
          <button
            className="flex-1 min-w-[110px] border-none rounded-[14px] cursor-pointer py-3 px-[10px] font-extrabold text-[14px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)] flex items-center justify-center gap-1.5"
            style={{ background: "linear-gradient(180deg,#7cc142,#59a02a)" }}
            onClick={onNext}
          >
            <ArrowRight size={16} /> Selanjutnya
          </button>
        )}
        <button
          className="flex-1 min-w-[110px] border-none rounded-[14px] cursor-pointer py-3 px-[10px] font-extrabold text-[14px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)] flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(180deg,#b6a2e8,#9b7fd4)" }}
          onClick={onMenu}
        >
          <Home size={16} /> Menu
        </button>
      </div>
    </Modal>
  );
}
