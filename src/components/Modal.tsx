import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(30,20,10,0.55)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="bg-[#fff8ea] rounded-[26px] p-[22px_24px_24px] max-w-[420px] w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.35)] max-h-[92vh] overflow-y-auto"
        style={{ animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
