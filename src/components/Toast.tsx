import { useEffect, useRef } from "react";

interface ToastProps {
  message: string;
  icon?: React.ReactNode;
  duration?: number;
  onDone: () => void;
}

export function Toast({ message, icon, duration = 2200, onDone }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDone, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onDone]);

  return (
    <div className="fixed bottom-[18px] left-1/2 -translate-x-1/2 z-[60] max-w-[90vw] text-center">
      <div
        className="bg-[#4a3728] text-white px-5 py-[10px] rounded-[24px] font-bold text-[13.5px]"
        style={{ animation: "toastIn 0.25s ease" }}
      >
        {icon && <span className="mr-[6px] inline-block">{icon}</span>}
        {message}
      </div>
    </div>
  );
}
