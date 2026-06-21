"use client";

/**
 * Tiny procedural sound-effect generator using the Web Audio API. No audio
 * files needed — each effect is synthesized on the fly (noise bursts run
 * through filters/envelopes), so the drink crafting flow has matching
 * tap-by-tap sounds without shipping or hosting any audio assets.
 *
 * Everything routes through a shared master bus (a gentle lowpass to take
 * the digital edge off, plus a small reverb send) instead of straight to
 * destination — dry, instant-onset noise bursts read as cheap/harsh; a touch
 * of room tone and softened attacks make the same synthesis read as a real
 * recorded foley sound instead.
 */

let ctx: AudioContext | null = null;
let masterBus: GainNode | null = null;
let reverbSend: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Shared dry-signal destination: a soft lowpass that rounds off harsh top end. */
function getMasterBus(c: AudioContext): GainNode {
  if (masterBus) return masterBus;
  const warmth = c.createBiquadFilter();
  warmth.type = "lowpass";
  warmth.frequency.value = 9000;
  warmth.Q.value = 0.3;
  warmth.connect(c.destination);
  masterBus = c.createGain();
  masterBus.gain.value = 1;
  masterBus.connect(warmth);
  return masterBus;
}

/**
 * Shared "send" bus: a short feedback-delay tail (a cheap stand-in for a
 * convolution reverb) that gives every dry hit a faint sense of a real room
 * instead of sounding like it's playing in a vacuum — the single biggest
 * thing separating "procedural beep" from "foley sound".
 */
function getReverbSend(c: AudioContext): GainNode {
  if (reverbSend) return reverbSend;
  const input = c.createGain();
  input.gain.value = 1;
  const delay = c.createDelay(1);
  delay.delayTime.value = 0.04;
  const feedback = c.createGain();
  feedback.gain.value = 0.32;
  const damp = c.createBiquadFilter();
  damp.type = "lowpass";
  damp.frequency.value = 2200;
  const wet = c.createGain();
  wet.gain.value = 0.55;

  input.connect(delay);
  delay.connect(damp);
  damp.connect(feedback);
  feedback.connect(delay);
  damp.connect(wet);
  wet.connect(c.destination);
  reverbSend = input;
  return input;
}

/** Connects a node to both the dry master bus and a touch of the reverb send. */
function connectOut(c: AudioContext, node: AudioNode, wetAmount = 0.16) {
  node.connect(getMasterBus(c));
  const send = c.createGain();
  send.gain.value = wetAmount;
  node.connect(send);
  send.connect(getReverbSend(c));
}

function noiseBuffer(c: AudioContext, durationSec: number) {
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * durationSec), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Gain envelope with a brief linear ramp-in instead of an instant jump to
 * peak — the instant jump is what makes a noise burst read as a harsh
 * digital "click" rather than a soft physical knock. */
function softHit(c: AudioContext, gain: GainNode, t: number, peak: number, attack: number, release: number) {
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, t + attack + release);
}

function playPing(c: AudioContext, freq: number, startTime: number, duration: number, gainPeak: number) {
  const osc = c.createOscillator();
  osc.type = "sine";
  const gain = c.createGain();
  osc.frequency.value = freq;
  softHit(c, gain, startTime, gainPeak, 0.01, duration);
  osc.connect(gain);
  connectOut(c, gain, 0.2);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/**
 * One ice-cube "clink": a soft, brief noise transient (the impact against
 * glass/other cubes) with a hint of glassy ring riding on top.
 */
function playClink(c: AudioContext, freq: number, startTime: number, gainPeak: number) {
  const click = c.createBufferSource();
  click.buffer = noiseBuffer(c, 0.03);
  const clickFilter = c.createBiquadFilter();
  clickFilter.type = "highpass";
  clickFilter.frequency.value = 3000;
  const clickGain = c.createGain();
  softHit(c, clickGain, startTime, gainPeak * 1.1, 0.003, 0.035);
  click.connect(clickFilter).connect(clickGain);
  connectOut(c, clickGain, 0.22);
  click.start(startTime);
  click.stop(startTime + 0.04);

  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  const gain = c.createGain();
  softHit(c, gain, startTime, gainPeak * 0.3, 0.004, 0.06);
  osc.connect(gain);
  connectOut(c, gain, 0.18);
  osc.start(startTime);
  osc.stop(startTime + 0.07);

  if (Math.random() > 0.4) {
    const t2 = startTime + 0.025 + Math.random() * 0.015;
    const click2 = c.createBufferSource();
    click2.buffer = noiseBuffer(c, 0.018);
    const filter2 = c.createBiquadFilter();
    filter2.type = "highpass";
    filter2.frequency.value = 3600;
    const gain2 = c.createGain();
    softHit(c, gain2, t2, gainPeak * 0.55, 0.002, 0.02);
    click2.connect(filter2).connect(gain2);
    connectOut(c, gain2, 0.2);
    click2.start(t2);
    click2.stop(t2 + 0.03);
  }
}

/**
 * One turn of a hand-crank grinder: a soft mechanical knock of the crank
 * arm catching the ratchet, immediately followed by a tiny burst of bean
 * crunch. Called once per crank — repeated taps build up a rattly texture
 * driven by the player's own clicks.
 */
export function playGrindCrankTick(turn: number) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  const clack = c.createBufferSource();
  clack.buffer = noiseBuffer(c, 0.04);
  const clackFilter = c.createBiquadFilter();
  clackFilter.type = "bandpass";
  clackFilter.frequency.value = 650;
  clackFilter.Q.value = 1.2;
  const clackGain = c.createGain();
  softHit(c, clackGain, now, 0.14, 0.004, 0.06);
  clack.connect(clackFilter).connect(clackGain);
  connectOut(c, clackGain, 0.2);
  clack.start(now);
  clack.stop(now + 0.08);

  const t = now + 0.035;
  const burst = c.createBufferSource();
  burst.buffer = noiseBuffer(c, 0.08);
  const burstFilter = c.createBiquadFilter();
  burstFilter.type = "bandpass";
  burstFilter.frequency.value = 800 + turn * 55 + Math.random() * 180;
  burstFilter.Q.value = 1.8;
  const burstGain = c.createGain();
  softHit(c, burstGain, t, 0.14, 0.004, 0.09);
  burst.connect(burstFilter).connect(burstGain);
  connectOut(c, burstGain, 0.2);
  burst.start(t);
  burst.stop(t + 0.1);
}

/** A single ice cube dropping in — a proper rattly "달그락" of 2-3 clinks
 * (always at least two; one cube alone almost always knocks against another
 * or the glass wall on the way in), louder and more present than a single
 * faint tap. */
export function playIceDropTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const pitches = [3600, 4300, 3200, 3900, 4700, 5200];
  const count = 2 + (Math.random() > 0.5 ? 1 : 0);
  let t = now;
  for (let i = 0; i < count; i++) {
    playClink(c, pitches[Math.floor(Math.random() * pitches.length)], t, 0.32 * (1 - i * 0.18));
    t += 0.035 + Math.random() * 0.03;
  }
}

/**
 * A real little pour: an audible rushing stream (filtered noise with a
 * wobbling amplitude so it reads as glugging liquid, not a flat hiss) plus
 * a couple of low "glug" thumps — long and loud enough to clearly register
 * as "음료가 쪼르르 부어지는 소리", not just a faint blip.
 */
export function playPourGlugTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const duration = 0.48;

  const source = c.createBufferSource();
  source.buffer = noiseBuffer(c, duration);
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(820, now);
  filter.frequency.linearRampToValueAtTime(560, now + duration);
  filter.Q.value = 0.8;

  // amplitude wobble so the stream glugs instead of hissing flatly
  const wobble = c.createOscillator();
  wobble.frequency.value = 9;
  const wobbleGain = c.createGain();
  wobbleGain.gain.value = 0.5;
  const wobbleTarget = c.createGain();
  wobbleTarget.gain.value = 1;
  wobble.connect(wobbleGain).connect(wobbleTarget.gain);

  const envelope = c.createGain();
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(0.32, now + 0.05);
  envelope.gain.setValueAtTime(0.32, now + duration - 0.16);
  envelope.gain.linearRampToValueAtTime(0, now + duration);

  source.connect(filter).connect(wobbleTarget).connect(envelope);
  connectOut(c, envelope, 0.22);
  source.start(now);
  wobble.start(now);
  source.stop(now + duration);
  wobble.stop(now + duration);

  [0.02, 0.18].forEach((delay) => {
    const t = now + delay;
    const thump = c.createOscillator();
    thump.type = "sine";
    thump.frequency.setValueAtTime(170, t);
    thump.frequency.exponentialRampToValueAtTime(85, t + 0.13);
    const thumpGain = c.createGain();
    softHit(c, thumpGain, t, 0.16, 0.006, 0.13);
    thump.connect(thumpGain);
    connectOut(c, thumpGain, 0.18);
    thump.start(t);
    thump.stop(t + 0.16);
  });
}

/**
 * Whipped cream: a long, breathy "푸우우욱" swell that blooms in and trails
 * off, with a slow wobbling modulation on top so it sounds squishy/molten
 * ("몽글몽글") rather than a thin aerosol hiss — plus the little mechanical
 * trigger click right at the start of a can being pressed.
 */
export function playCreamPuffTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const duration = 0.65;

  const click = c.createBufferSource();
  click.buffer = noiseBuffer(c, 0.02);
  const clickFilter = c.createBiquadFilter();
  clickFilter.type = "bandpass";
  clickFilter.frequency.value = 1600;
  const clickGain = c.createGain();
  softHit(c, clickGain, now, 0.07, 0.004, 0.025);
  click.connect(clickFilter).connect(clickGain);
  connectOut(c, clickGain, 0.16);
  click.start(now);
  click.stop(now + 0.03);

  const hiss = c.createBufferSource();
  hiss.buffer = noiseBuffer(c, duration);
  const hissFilter = c.createBiquadFilter();
  hissFilter.type = "lowpass";
  hissFilter.frequency.setValueAtTime(2200, now + 0.02);
  hissFilter.frequency.linearRampToValueAtTime(1400, now + duration);

  // slow squishy wobble — gives the "몽글몽글" bubbling texture instead of a
  // flat steady hiss
  const wobble = c.createOscillator();
  wobble.frequency.value = 7;
  const wobbleGain = c.createGain();
  wobbleGain.gain.value = 0.45;
  const wobbleTarget = c.createGain();
  wobbleTarget.gain.value = 1;
  wobble.connect(wobbleGain).connect(wobbleTarget.gain);

  const hissGain = c.createGain();
  hissGain.gain.setValueAtTime(0, now + 0.02);
  hissGain.gain.linearRampToValueAtTime(0.22, now + 0.22);
  hissGain.gain.setValueAtTime(0.22, now + duration - 0.3);
  hissGain.gain.linearRampToValueAtTime(0, now + duration);

  hiss.connect(hissFilter).connect(wobbleTarget).connect(hissGain);
  connectOut(c, hissGain, 0.22);
  hiss.start(now + 0.02);
  wobble.start(now + 0.02);
  hiss.stop(now + duration);
  wobble.stop(now + duration);
}

/** One soft dunk of a tea bag, for tap-by-tap steeping. */
export function playSteepDunkTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const dunk = c.createBufferSource();
  dunk.buffer = noiseBuffer(c, 0.14);
  const dunkFilter = c.createBiquadFilter();
  dunkFilter.type = "lowpass";
  dunkFilter.frequency.value = 550;
  const dunkGain = c.createGain();
  softHit(c, dunkGain, now, 0.13, 0.01, 0.19);
  dunk.connect(dunkFilter).connect(dunkGain);
  connectOut(c, dunkGain, 0.24);
  dunk.start(now);
  dunk.stop(now + 0.22);
}

/** A couple of quick whisk taps, for tap-by-tap whisking. */
export function playWhiskStrokeTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [0, 0.07].forEach((delay, i) => {
    const t = now + delay;
    const tap = c.createBufferSource();
    tap.buffer = noiseBuffer(c, 0.03);
    const tapFilter = c.createBiquadFilter();
    tapFilter.type = "bandpass";
    tapFilter.frequency.value = i % 2 === 0 ? 1200 : 950;
    tapFilter.Q.value = 2.2;
    const tapGain = c.createGain();
    softHit(c, tapGain, t, 0.08, 0.004, 0.035);
    tap.connect(tapFilter).connect(tapGain);
    connectOut(c, tapGain, 0.18);
    tap.start(t);
    tap.stop(t + 0.04);
  });
}

/** A short cheerful chime — the drink is finished. */
export function playCompleteSound() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [660, 880, 1320].forEach((freq, i) => playPing(c, freq, now + i * 0.09, 0.4, 0.09));
}
