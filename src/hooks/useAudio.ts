import { useCallback } from "react";
import { playSound } from "../lib/audio.ts";

export function useAudio(muted: boolean, setMuted: (muted: boolean) => void) {
  const sound = useCallback(
    (name: string) => {
      playSound(muted, name);
    },
    [muted],
  );

  const toggleMute = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  return { sound, toggleMute };
}
