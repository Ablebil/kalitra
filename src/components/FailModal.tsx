import { Smile, RotateCcw, Home, TreePine, TriangleAlert, HelpCircle } from "lucide-react";
import { Modal } from "./Modal.tsx";

interface FailModalProps {
  open: boolean;
  reason: string;
  onRetry: () => void;
  onMenu: () => void;
}

const ICON: Record<string, React.ReactNode> = {
  obstacle: <TreePine size={18} className="inline-block align-middle mr-1" />,
  bounds: <TriangleAlert size={18} className="inline-block align-middle mr-1" />,
  notreach: <HelpCircle size={18} className="inline-block align-middle mr-1" />,
};

const MSGS: Record<string, string> = {
  obstacle: "Waduh, Prompt menabrak rintangan!",
  bounds: "Prompt keluar dari batas jalan!",
  notreach: "Perintah sudah habis, tapi Prompt belum sampai tujuan.",
};

export function FailModal({ open, reason, onRetry, onMenu }: FailModalProps) {
  return (
    <Modal open={open}>
      <Smile size={54} className="block mb-[2px] mx-auto" />
      <h2 className="text-[22px] font-extrabold text-[#4a3728] my-[4px_6px]">Coba Lagi, Yuk!</h2>
      <p className="text-[14.5px] font-semibold text-[#7a6552] leading-relaxed my-[4px_14px]">
        {ICON[reason]}
        {MSGS[reason] || "Prompt belum berhasil."}
        <br />
        Program kamu masih tersimpan, coba perbaiki susunannya.
      </p>
      <div className="flex gap-2 mt-[6px] flex-wrap">
        <button
          className="flex-1 min-w-[110px] border-none rounded-[14px] cursor-pointer py-3 px-[10px] font-extrabold text-[14px] text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.18)] flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(180deg,#7cc142,#59a02a)" }}
          onClick={onRetry}
        >
          <RotateCcw size={16} /> Coba Lagi
        </button>
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
