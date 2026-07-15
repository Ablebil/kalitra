import { Map, Star, Lock } from "lucide-react";
import { Modal } from "./Modal.tsx";
import { levels } from "../game/data/levels.ts";
import type { LevelData } from "../game/types/index.ts";

interface LevelSelectModalProps {
  open: boolean;
  unlockedCount: number;
  starsPerLevel: Record<number, number>;
  onSelect: (idx: number) => void;
  onClose: () => void;
}

export function LevelSelectModal({
  open,
  unlockedCount,
  starsPerLevel,
  onSelect,
  onClose,
}: LevelSelectModalProps) {
  return (
    <Modal open={open}>
      <Map size={54} className="block mb-[2px] mx-auto" />
      <h2 className="text-[22px] font-extrabold text-[#4a3728] my-[4px_6px]">Pilih Level</h2>
      <p className="text-[14.5px] font-semibold text-[#7a6552] leading-relaxed my-[4px_14px]">
        Bantu Prompt menyelesaikan setiap petualangan!
      </p>
      <div className="grid grid-cols-3 gap-[10px] my-[10px_4px]">
        {levels.map((lv: LevelData, i: number) => {
          const locked = i >= unlockedCount;
          const starCount = starsPerLevel[i] || 0;
          const maxStars = lv.collectibles.length + 1;
          const starEls = [];
          for (let j = 0; j < maxStars; j++) {
            const earned = j < starCount;
            starEls.push(
              <Star
                key={j}
                size={12}
                fill={earned ? "#fbbf24" : "none"}
                stroke={earned ? "#fbbf24" : "#d1d5db"}
                strokeWidth={1.5}
              />,
            );
          }
          return (
            <button
              key={i}
              disabled={locked}
              className={`border-none rounded-[16px] cursor-pointer py-3 px-[6px] flex flex-col items-center gap-[4px] font-extrabold text-[#4a3728] shadow-[0_4px_0_rgba(0,0,0,0.15)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.15)] ${locked ? "opacity-50 cursor-not-allowed bg-[#e2e2e2]" : "bg-gradient-to-b from-white to-[#f2e4c6]"}`}
              onClick={() => onSelect(i)}
            >
              <span className="text-[22px] font-black text-[#9b7fd4]">
                {lv.id}
                {locked && <Lock size={14} className="inline-block ml-1 align-middle" />}
              </span>
              <span>{lv.name}</span>
              <span className="flex items-center gap-[2px]">{starEls}</span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mt-[6px] flex-wrap">
        <button
          className="flex-1 min-w-[110px] border-none rounded-[14px] cursor-pointer py-3 px-[10px] font-extrabold text-[14px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)]"
          style={{ background: "linear-gradient(180deg,#cfcfcf,#a3a3a3)" }}
          onClick={onClose}
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
}
