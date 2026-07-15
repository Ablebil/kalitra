import { Compass, Rocket } from "lucide-react";
import { Modal } from "./Modal.tsx";
import type { LevelData } from "../game/types/index.ts";

interface IntroModalProps {
  open: boolean;
  level: LevelData;
  onStart: () => void;
}

export function IntroModal({ open, level, onStart }: IntroModalProps) {
  return (
    <Modal open={open}>
      <Compass size={54} className="block mb-[2px] mx-auto" />
      <h2 className="text-[22px] font-extrabold text-[#4a3728] my-[4px_6px]">
        Level {level.id}: {level.name}
      </h2>
      <p className="text-[14.5px] font-semibold text-[#7a6552] leading-relaxed my-[4px_14px]">
        {level.intro}
      </p>
      <div className="flex gap-2 mt-[6px] flex-wrap">
        <button
          className="flex-1 min-w-[110px] border-none rounded-[14px] cursor-pointer py-3 px-[10px] font-extrabold text-[14px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)] flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(180deg,#7cc142,#59a02a)" }}
          onClick={onStart}
        >
          Mulai! <Rocket size={16} />
        </button>
      </div>
    </Modal>
  );
}
