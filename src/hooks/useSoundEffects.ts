// Lightweight Web Audio API sound effects — no external files needed
const audioCtx = () => {
  if (!(window as any).__lungAudioCtx) {
    (window as any).__lungAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return (window as any).__lungAudioCtx as AudioContext;
};

const beep = (freq: number, duration: number, type: OscillatorType = "sine", vol = 0.12) => {
  try {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
};

export const playClick = () => beep(800, 0.06, "sine", 0.08);

export const playType = () => beep(1200, 0.03, "sine", 0.04);

export const playSuccess = () => {
  beep(523, 0.12, "sine", 0.1);
  setTimeout(() => beep(659, 0.12, "sine", 0.1), 100);
  setTimeout(() => beep(784, 0.18, "sine", 0.12), 200);
};

export const playError = () => {
  beep(300, 0.15, "square", 0.08);
  setTimeout(() => beep(250, 0.2, "square", 0.06), 120);
};

export const playNavigate = () => {
  beep(440, 0.08, "sine", 0.06);
  setTimeout(() => beep(660, 0.1, "sine", 0.08), 60);
};

export const playScan = () => {
  beep(200, 0.4, "sine", 0.06);
  setTimeout(() => beep(400, 0.3, "sine", 0.08), 300);
  setTimeout(() => beep(600, 0.2, "sine", 0.1), 500);
};

export const playHeartbeat = () => {
  beep(60, 0.15, "sine", 0.15);
  setTimeout(() => beep(60, 0.1, "sine", 0.1), 180);
};
