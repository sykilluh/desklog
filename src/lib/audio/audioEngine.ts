export type FilterPreset = {
  type: BiquadFilterType;
  frequency: number;
  Q?: number;
};

const FILTER_PRESETS: Record<string, FilterPreset> = {
  turntable: { type: "bandpass", frequency: 900, Q: 0.7 },
  lamp: { type: "lowpass", frequency: 220, Q: 0.4 },
  plant: { type: "highpass", frequency: 2200, Q: 0.5 },
  book: { type: "highpass", frequency: 3500, Q: 0.3 },
  cup: { type: "bandpass", frequency: 1400, Q: 1.2 },
};

interface ActiveNode {
  source: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
}

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
const activeNodes = new Map<number, ActiveNode>();
let masterGain: GainNode | null = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function getNoiseBuffer(ctx: AudioContext) {
  if (noiseBuffer) return noiseBuffer;
  const length = ctx.sampleRate * 2;
  noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

export function activateObjectAudio(id: number, objectName: string, volume: number) {
  if (activeNodes.has(id)) return;

  const ctx = getContext();
  const preset = FILTER_PRESETS[objectName] ?? FILTER_PRESETS.lamp;

  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx);
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = preset.type;
  filter.frequency.value = preset.frequency;
  filter.Q.value = preset.Q ?? 1;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.connect(filter).connect(gain).connect(masterGain!);
  source.start();

  activeNodes.set(id, { source, filter, gain });
}

export function deactivateObjectAudio(id: number) {
  const node = activeNodes.get(id);
  if (!node) return;
  node.source.stop();
  node.source.disconnect();
  node.filter.disconnect();
  node.gain.disconnect();
  activeNodes.delete(id);
}

export function setObjectVolume(id: number, volume: number) {
  const node = activeNodes.get(id);
  if (!node || !audioCtx) return;
  node.gain.gain.setValueAtTime(volume, audioCtx.currentTime);
}

export function setMasterMuted(muted: boolean) {
  if (!masterGain || !audioCtx) return;
  masterGain.gain.setValueAtTime(muted ? 0 : 1, audioCtx.currentTime);
}

export function stopAllAudio() {
  for (const id of Array.from(activeNodes.keys())) {
    deactivateObjectAudio(id);
  }
}
