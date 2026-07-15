import { Puzzle, ArrowUp, ArrowLeft, ArrowRight, Repeat } from "lucide-react";

interface CommandPaletteProps {
  onAddForward: () => void;
  onAddLeft: () => void;
  onAddRight: () => void;
  onAddRepeat: () => void;
  disabled: boolean;
  repeatDisabled: boolean;
}

export function CommandPalette({
  onAddForward,
  onAddLeft,
  onAddRight,
  onAddRepeat,
  disabled,
  repeatDisabled,
}: CommandPaletteProps) {
  return (
    <div className="panel-card">
      <div className="panel-title">
        <Puzzle size={16} /> Perintah
      </div>
      <div className="grid grid-cols-2 gap-2">
        <CmdButton
          label="Maju"
          icon={<ArrowUp size={22} />}
          style="bg-gradient-to-b from-blue-400 to-blue-600"
          onClick={onAddForward}
          disabled={disabled}
        />
        <CmdButton
          label="Kiri"
          icon={<ArrowLeft size={22} />}
          style="bg-gradient-to-b from-[#5ec8e0] to-[#34a1c2]"
          onClick={onAddLeft}
          disabled={disabled}
        />
        <CmdButton
          label="Kanan"
          icon={<ArrowRight size={22} />}
          style="bg-gradient-to-b from-[#5ec8e0] to-[#34a1c2]"
          onClick={onAddRight}
          disabled={disabled}
        />
        <CmdButton
          label="Ulangi"
          icon={<Repeat size={22} />}
          style="bg-gradient-to-b from-purple-400 to-[#7259ad]"
          onClick={onAddRepeat}
          disabled={repeatDisabled}
        />
      </div>
    </div>
  );
}

function CmdButton({
  label,
  icon,
  style,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  style: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      className={`border-none rounded-[9px] cursor-pointer py-[10px_4px_8px] flex flex-col items-center gap-1 font-bold text-[11.5px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)] disabled:opacity-40 disabled:cursor-not-allowed ${style}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex items-center justify-center h-[22px]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
