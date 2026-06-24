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

/** A single ice cube dropping in — a clean "달그락 달그락" double-knock,
 * with a clear gap between the two hits instead of a blurred rattle, so
 * each one reads as a distinct clink-clink rather than a single crunch. */
export function playIceDropTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const pitches = [3600, 4300, 3200, 3900, 4700, 5200];
  playClink(c, pitches[Math.floor(Math.random() * pitches.length)], now, 0.34);
  playClink(c, pitches[Math.floor(Math.random() * pitches.length)], now + 0.1, 0.26);
}

/**
 * 쪼르륵: a thin, fast, slightly babbling trickle — not a heavy glug. Higher
 * pitched and quicker-fluttering than a held pour, so it reads as a light
 * stream splashing into the cup rather than a deep gurgle.
 */
export function playPourGlugTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const duration = 0.42;

  const source = c.createBufferSource();
  source.buffer = noiseBuffer(c, duration);
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1500, now);
  filter.frequency.linearRampToValueAtTime(1050, now + duration);
  filter.Q.value = 1.1;

  // fast flutter so the stream babbles/trickles instead of hissing flatly
  const flutter = c.createOscillator();
  flutter.frequency.value = 17;
  const flutterGain = c.createGain();
  flutterGain.gain.value = 0.55;
  const flutterTarget = c.createGain();
  flutterTarget.gain.value = 1;
  flutter.connect(flutterGain).connect(flutterTarget.gain);

  // a second, slightly detuned flutter layered in for an irregular
  // "babbling" texture rather than one clean tremolo
  const flutter2 = c.createOscillator();
  flutter2.frequency.value = 23;
  const flutter2Gain = c.createGain();
  flutter2Gain.gain.value = 0.3;
  flutter2.connect(flutter2Gain).connect(flutterTarget.gain);

  const envelope = c.createGain();
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(0.24, now + 0.035);
  envelope.gain.setValueAtTime(0.24, now + duration - 0.13);
  envelope.gain.linearRampToValueAtTime(0, now + duration);

  source.connect(filter).connect(flutterTarget).connect(envelope);
  connectOut(c, envelope, 0.22);
  source.start(now);
  flutter.start(now);
  flutter2.start(now);
  source.stop(now + duration);
  flutter.stop(now + duration);
  flutter2.stop(now + duration);

  // one light high splash right at the start, not a deep low thump
  const splash = c.createBufferSource();
  splash.buffer = noiseBuffer(c, 0.05);
  const splashFilter = c.createBiquadFilter();
  splashFilter.type = "highpass";
  splashFilter.frequency.value = 2200;
  const splashGain = c.createGain();
  softHit(c, splashGain, now, 0.1, 0.004, 0.05);
  splash.connect(splashFilter).connect(splashGain);
  connectOut(c, splashGain, 0.2);
  splash.start(now);
  splash.stop(now + 0.06);
}

/**
 * 푸슈슈룩: an airy "푸슈슈" hiss swell, finished off with a distinct wet
 * "룩" squelch/blop right at the tail — the squelch is what was missing
 * before; without it the hiss alone just sounds like a spray can, not cream
 * landing in a soft dollop.
 */
export function playCreamPuffTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const hissDuration = 0.42;

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

  // 푸슈슈 — airy hiss swell
  const hiss = c.createBufferSource();
  hiss.buffer = noiseBuffer(c, hissDuration);
  const hissFilter = c.createBiquadFilter();
  hissFilter.type = "bandpass";
  hissFilter.frequency.value = 3400;
  hissFilter.Q.value = 0.6;
  const hissGain = c.createGain();
  hissGain.gain.setValueAtTime(0, now + 0.02);
  hissGain.gain.linearRampToValueAtTime(0.16, now + 0.16);
  hissGain.gain.linearRampToValueAtTime(0.06, now + hissDuration);
  hiss.connect(hissFilter).connect(hissGain);
  connectOut(c, hissGain, 0.2);
  hiss.start(now + 0.02);
  hiss.stop(now + hissDuration);

  // 룩 — a soft wet squelch right as the hiss tails off: a quick downward
  // pitch blob plus a damp low-passed noise "plop"
  const squelchT = now + hissDuration - 0.04;
  const blob = c.createOscillator();
  blob.type = "sine";
  blob.frequency.setValueAtTime(420, squelchT);
  blob.frequency.exponentialRampToValueAtTime(140, squelchT + 0.16);
  const blobGain = c.createGain();
  softHit(c, blobGain, squelchT, 0.13, 0.01, 0.17);
  blob.connect(blobGain);
  connectOut(c, blobGain, 0.22);
  blob.start(squelchT);
  blob.stop(squelchT + 0.2);

  const plop = c.createBufferSource();
  plop.buffer = noiseBuffer(c, 0.1);
  const plopFilter = c.createBiquadFilter();
  plopFilter.type = "lowpass";
  plopFilter.frequency.value = 700;
  const plopGain = c.createGain();
  softHit(c, plopGain, squelchT + 0.01, 0.12, 0.008, 0.13);
  plop.connect(plopFilter).connect(plopGain);
  connectOut(c, plopGain, 0.22);
  plop.start(squelchT + 0.01);
  plop.stop(squelchT + 0.15);
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

/**
 * 스슥 스슥: a dry, grainy brushing/scraping sweep — like a bamboo whisk
 * dragging through fine dry powder — not a wet percussive tap. Two quick
 * sweeps of bright, narrow-band noise with a fast attack and a slightly
 * longer scrape-like decay than a tap would have.
 */
export function playWhiskStrokeTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [0, 0.1].forEach((delay, i) => {
    const t = now + delay;
    const sweepDuration = 0.09;
    const sweep = c.createBufferSource();
    sweep.buffer = noiseBuffer(c, sweepDuration);
    const sweepFilter = c.createBiquadFilter();
    sweepFilter.type = "bandpass";
    sweepFilter.frequency.setValueAtTime(i % 2 === 0 ? 4200 : 3600, t);
    sweepFilter.frequency.linearRampToValueAtTime(i % 2 === 0 ? 3200 : 2700, t + sweepDuration);
    sweepFilter.Q.value = 1.4;
    const sweepGain = c.createGain();
    softHit(c, sweepGain, t, 0.07, 0.006, sweepDuration);
    sweep.connect(sweepFilter).connect(sweepGain);
    connectOut(c, sweepGain, 0.16);
    sweep.start(t);
    sweep.stop(t + sweepDuration + 0.01);
  });
}

/** A short cheerful chime — the drink is finished. */
export function playCompleteSound() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [660, 880, 1320].forEach((freq, i) => playPing(c, freq, now + i * 0.09, 0.4, 0.09));
}
