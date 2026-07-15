import { Repeat, X, ArrowUp, ArrowLeft, ArrowRight } from "lucide-react";
import type { BlockNode } from "../game/types/index.ts";

interface BlockItemProps {
  block: BlockNode;
  isActiveRepeat: boolean;
  isEditingRepeat: boolean;
  isExecActive: boolean;
  onRemove: (id: string) => void;
  onStartEdit: (id: string, children: BlockNode[]) => void;
  onDecCount: (id: string) => void;
  onIncCount: (id: string) => void;
  disabled: boolean;
}

export function BlockItem({
  block,
  isActiveRepeat,
  isEditingRepeat,
  isExecActive,
  onRemove,
  onStartEdit,
  onDecCount,
  onIncCount,
  disabled,
}: BlockItemProps) {
  if (block.type === "repeat") {
    const isEmpty = block.children.length === 0;
    return (
      <div
        className={`rounded-[12px] p-[6px] shadow-[0_2px_0_rgba(0,0,0,0.15)] cursor-pointer bg-gradient-to-b from-[#b6a2e8] to-[#9b7fd4] ${isActiveRepeat ? "outline-3 outline-dashed outline-offset-2 outline-[#6e4fc7]" : ""} ${isExecActive ? "outline-3 outline-solid outline-offset-2 outline-[#ffe066] shadow-[0_0_0_4px_rgba(255,224,102,0.4),0_2px_0_rgba(0,0,0,0.15)]" : ""}`}
        style={{ animation: "blockIn 0.18s ease" }}
        onClick={() => {
          if (disabled) return;
          if (isActiveRepeat) return;
          if (isEditingRepeat) return;
          onStartEdit(block.id, block.children);
        }}
      >
        <div className="flex items-center gap-[5px] text-white font-extrabold text-[12.5px] px-[4px] pb-[2px]">
          <Repeat size={16} />
          <span>Ulangi</span>
          <button
            className="w-5 h-5 rounded-full border-none cursor-pointer bg-white/35 text-white font-black text-[13px] flex items-center justify-center leading-none"
            onClick={(e) => {
              e.stopPropagation();
              onDecCount(block.id);
            }}
            disabled={disabled}
          >
            −
          </button>
          <span className="min-w-[26px] text-center">{block.count}×</span>
          <button
            className="w-5 h-5 rounded-full border-none cursor-pointer bg-white/35 text-white font-black text-[13px] flex items-center justify-center leading-none"
            onClick={(e) => {
              e.stopPropagation();
              onIncCount(block.id);
            }}
            disabled={disabled}
          >
            +
          </button>
          <button
            className="ml-auto w-5 h-5 rounded-full border-none cursor-pointer bg-black/18 text-white text-[11px] flex items-center justify-center shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(block.id);
            }}
            disabled={disabled}
          >
            <X size={11} />
          </button>
        </div>
        <div className="flex flex-col gap-1 mt-[5px] pl-[10px] border-l-3 border-dashed border-white/50">
          {isEmpty ? (
            <div className="text-[#7a6552]/60 text-[11px] italic py-1">
              {isActiveRepeat ? "Klik Maju/Kiri/Kanan untuk mengisi..." : "(kosong)"}
            </div>
          ) : (
            block.children.map((child) => (
              <BlockItem
                key={child.id}
                block={child}
                isActiveRepeat={false}
                isEditingRepeat={isEditingRepeat}
                isExecActive={false}
                onRemove={onRemove}
                onStartEdit={onStartEdit}
                onDecCount={onDecCount}
                onIncCount={onIncCount}
                disabled={disabled}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  const labelIcon =
    {
      forward: <ArrowUp size={14} className="inline-block align-middle mr-1" />,
      left: <ArrowLeft size={14} className="inline-block align-middle mr-1" />,
      right: <ArrowRight size={14} className="inline-block align-middle mr-1" />,
    }[block.type] || null;
  const color =
    block.type === "forward"
      ? "bg-gradient-to-b from-[#4fc3f7] to-[#229fe0]"
      : "bg-gradient-to-b from-[#5ec8e0] to-[#34a1c2]";

  return (
    <div
      className={`rounded-[10px] py-[7px] px-[10px] font-bold text-[13px] flex items-center justify-between gap-[6px] shadow-[0_2px_0_rgba(0,0,0,0.15)] cursor-default text-white ${color} ${isExecActive ? "outline-3 outline-solid outline-offset-2 outline-[#ffe066] shadow-[0_0_0_4px_rgba(255,224,102,0.4),0_2px_0_rgba(0,0,0,0.15)]" : ""}`}
      style={{ animation: "blockIn 0.18s ease" }}
    >
      <span>
        {labelIcon}
        {{ forward: "Maju", left: "Kiri", right: "Kanan" }[block.type] || block.type}
      </span>
      <button
        className="w-5 h-5 rounded-full border-none cursor-pointer bg-black/18 text-white text-[11px] flex items-center justify-center shrink-0"
        onClick={() => onRemove(block.id)}
        disabled={disabled}
      >
        <X size={11} />
      </button>
    </div>
  );
}
