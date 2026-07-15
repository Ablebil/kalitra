import { ClipboardList } from "lucide-react";
import { BlockItem } from "./BlockItem.tsx";
import type { BlockNode } from "../game/types/index.ts";

interface ProgramListProps {
  program: BlockNode[];
  activeRepeatId: string | null;
  editingAnotherRepeat: boolean;
  execHighlights: Set<string>;
  onRemove: (id: string) => void;
  onStartEdit: (id: string, children: BlockNode[]) => void;
  onDecCount: (id: string) => void;
  onIncCount: (id: string) => void;
  disabled: boolean;
  blockCount: number;
  maxBlocks: number;
}

export function ProgramList({
  program,
  activeRepeatId,
  editingAnotherRepeat,
  execHighlights,
  onRemove,
  onStartEdit,
  onDecCount,
  onIncCount,
  disabled,
  blockCount,
  maxBlocks,
}: ProgramListProps) {
  const atLimit = blockCount >= maxBlocks;
  const nearLimit = !atLimit && blockCount >= Math.ceil(maxBlocks * 0.6);

  return (
    <div className="panel-card flex-1 flex flex-col min-h-0" id="program-card">
      <div className="panel-title">
        <ClipboardList size={16} /> Program
        <span
          className={`ml-auto text-[10px] font-extrabold rounded-full px-[8px] py-[2px] leading-none transition-colors ${
            atLimit
              ? "bg-red-500 text-white"
              : nearLimit
                ? "bg-amber-500 text-white"
                : "bg-black/10 text-[#7a6552]"
          }`}
        >
          {blockCount} / {maxBlocks}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto bg-white/60 rounded-[9px] p-2 flex flex-col gap-[6px] min-h-[90px]">
        {program.length === 0 ? (
          <div className="text-[#7a6552] text-[13px] text-center py-[18px] px-[8px] font-semibold opacity-75">
            Klik blok di atas untuk mulai menyusun perintah Prompt!
          </div>
        ) : (
          program.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              isActiveRepeat={block.id === activeRepeatId}
              isEditingRepeat={editingAnotherRepeat}
              isExecActive={execHighlights.has(block.id)}
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
