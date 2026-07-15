import { Undo2, Trash2, Play } from "lucide-react";

interface ActionButtonsProps {
  onUndo: () => void;
  onClear: () => void;
  onRun: () => void;
  disabled: boolean;
}

export function ActionButtons({ onUndo, onClear, onRun, disabled }: ActionButtonsProps) {
  return (
    <div className="flex gap-[7px] mt-2">
      <button
        className="flex-1 border-none rounded-[14px] cursor-pointer py-[11px_4px] font-extrabold text-[13px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] flex flex-col items-center gap-[2px] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)] disabled:opacity-45 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(180deg,#ffc966,#f0821a)" }}
        onClick={onUndo}
        disabled={disabled}
      >
        <Undo2 size={18} />
        <span>Undo</span>
      </button>
      <button
        className="flex-1 border-none rounded-[14px] cursor-pointer py-[11px_4px] font-extrabold text-[13px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] flex flex-col items-center gap-[2px] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)] disabled:opacity-45 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(180deg,#f27c6d,#d43a2c)" }}
        onClick={onClear}
        disabled={disabled}
      >
        <Trash2 size={18} />
        <span>Hapus</span>
      </button>
      <button
        className="flex-[1.3] border-none rounded-[14px] cursor-pointer py-[11px_4px] font-extrabold text-[15px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] flex flex-col items-center gap-[2px] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)] disabled:opacity-45 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(180deg,#7cc142,#59a02a)" }}
        onClick={onRun}
        disabled={disabled}
      >
        <Play size={18} fill="white" />
        <span>JALANKAN</span>
      </button>
    </div>
  );
}
