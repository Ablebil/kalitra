let audioCtx: AudioContext | null = null;

export function getAudioCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function beep(
  freq: number,
  duration: number,
  type: OscillatorType,
  vol: number,
  delay?: number,
): void {
  const ctx = getAudioCtx();
  if (!ctx) return;
  delay = delay || 0;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + delay;
  gain.gain.setValueAtTime(vol || 0.12, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
  osc.onended = () => {
    try {
      osc.disconnect();
    } catch {
      /* already disconnected */
    }
    try {
      gain.disconnect();
    } catch {
      /* already disconnected */
    }
  };
}

export function playSound(muted: boolean, name: string): void {
  if (muted) return;
  switch (name) {
    case "click":
      beep(600, 0.07, "triangle", 0.1);
      break;
    case "step":
      beep(300 + Math.random() * 50, 0.08, "square", 0.05);
      break;
    case "turn":
      beep(520, 0.09, "sine", 0.08);
      break;
    case "collect":
      beep(880, 0.1, "triangle", 0.14);
      beep(1180, 0.14, "triangle", 0.11, 0.08);
      break;
    case "win":
      [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.2, "triangle", 0.14, i * 0.11));
      break;
    case "fail":
      beep(220, 0.28, "sawtooth", 0.1);
      break;
    case "bump":
      beep(110, 0.16, "square", 0.14);
      break;
    case "unlock":
      [660, 880, 1100].forEach((f, i) => beep(f, 0.15, "sine", 0.12, i * 0.09));
      break;
  }
}
