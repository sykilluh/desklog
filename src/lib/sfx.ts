"use client";

/**
 * Tiny procedural sound-effect generator using the Web Audio API. No audio
 * files needed — each effect is synthesized on the fly (noise bursts run
 * through filters/envelopes, plus a few oscillator pings), so the drink
 * crafting flow has matching sounds for ice/pour/grind/cream without
 * shipping or hosting any audio assets.
 */

let ctx: AudioContext | null = null;

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

function noiseBuffer(c: AudioContext, durationSec: number) {
  const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * durationSec), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function playPing(c: AudioContext, freq: number, startTime: number, duration: number, gainPeak: number) {
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/**
 * One ice-cube "clink": almost entirely a very short, very bright noise
 * transient (the impact against glass/other cubes) with just a hint of
 * glassy ring riding on top — a clean oscillator ping by itself reads as a
 * UI bell, not ice. The transient needs to dominate and sit high (4-6kHz)
 * to read as "달그락" rattling rather than a chime.
 */
function playClink(c: AudioContext, freq: number, startTime: number, gainPeak: number) {
  // the knock: a very short, sharp high-passed noise crack
  const click = c.createBufferSource();
  click.buffer = noiseBuffer(c, 0.025);
  const clickFilter = c.createBiquadFilter();
  clickFilter.type = "highpass";
  clickFilter.frequency.value = 3200;
  const clickGain = c.createGain();
  clickGain.gain.setValueAtTime(gainPeak * 1.4, startTime);
  clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);
  click.connect(clickFilter).connect(clickGain).connect(c.destination);
  click.start(startTime);
  click.stop(startTime + 0.03);

  // a faint, very fast-decaying glassy overtone — just a hint, not a bell
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  const gain = c.createGain();
  gain.gain.setValueAtTime(gainPeak * 0.35, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.045);
  osc.connect(gain).connect(c.destination);
  osc.start(startTime);
  osc.stop(startTime + 0.05);

  // ice cubes usually bounce twice in quick succession on impact
  if (Math.random() > 0.4) {
    const t2 = startTime + 0.02 + Math.random() * 0.015;
    const click2 = c.createBufferSource();
    click2.buffer = noiseBuffer(c, 0.015);
    const filter2 = c.createBiquadFilter();
    filter2.type = "highpass";
    filter2.frequency.value = 3800;
    const gain2 = c.createGain();
    gain2.gain.setValueAtTime(gainPeak * 0.7, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.015);
    click2.connect(filter2).connect(gain2).connect(c.destination);
    click2.start(t2);
    click2.stop(t2 + 0.02);
  }
}

/** A little rattling cluster of ice-cube clinks dropping into a glass and settling. */
export function playIceSound() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const pitches = [4200, 5100, 3800, 4700, 5600];
  const count = 4 + Math.floor(Math.random() * 3);
  let t = now;
  for (let i = 0; i < count; i++) {
    t += 0.05 + Math.random() * 0.08;
    const settle = i / count; // later clinks are softer/closer together, like cubes settling
    playClink(c, pitches[i % pitches.length] * (0.92 + Math.random() * 0.16), t, 0.2 * (1 - settle * 0.4));
  }
}

/**
 * Liquid pouring into a glass: a steady filtered noise "stream" with a
 * slow, slightly irregular amplitude wobble layered on top so it reads as
 * trickling/glugging rather than flat hiss, plus a couple of soft low
 * "glug" thumps near the start.
 */
export function playPourSound() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const duration = 0.85;

  const source = c.createBufferSource();
  source.buffer = noiseBuffer(c, duration);
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.linearRampToValueAtTime(550, now + duration);
  filter.Q.value = 0.7;

  // slow wobble so the stream isn't perfectly flat
  const wobble = c.createOscillator();
  wobble.frequency.value = 7;
  const wobbleGain = c.createGain();
  wobbleGain.gain.value = 0.4;
  const wobbleTarget = c.createGain();
  wobbleTarget.gain.value = 1;
  wobble.connect(wobbleGain).connect(wobbleTarget.gain);

  const envelope = c.createGain();
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(0.16, now + 0.1);
  envelope.gain.setValueAtTime(0.16, now + duration - 0.2);
  envelope.gain.linearRampToValueAtTime(0, now + duration);

  source.connect(filter).connect(wobbleTarget).connect(envelope).connect(c.destination);
  source.start(now);
  wobble.start(now);
  source.stop(now + duration);
  wobble.stop(now + duration);

  // a couple of soft low glug thumps as the pour starts
  [0.04, 0.22].forEach((delay) => {
    const t = now + delay;
    const thump = c.createOscillator();
    thump.type = "sine";
    thump.frequency.setValueAtTime(180, t);
    thump.frequency.exponentialRampToValueAtTime(90, t + 0.12);
    const thumpGain = c.createGain();
    thumpGain.gain.setValueAtTime(0.1, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    thump.connect(thumpGain).connect(c.destination);
    thump.start(t);
    thump.stop(t + 0.14);
  });
}

/**
 * Coffee grinder: a steady motor whir (low sawtooth, slightly detuned for
 * grit) underneath a rapid rattle of tiny crunchy bursts — the actual bean
 * fragments being chewed up. A single AM-modulated noise band alone reads
 * as a vacuum cleaner, not a grinder; the layered crunch clicks are what
 * sell it.
 */
export function playGrindSound() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const duration = 1.1;

  // motor whir: two slightly mistuned sawtooths for a buzzy mechanical edge
  const motorGain = c.createGain();
  motorGain.gain.setValueAtTime(0, now);
  motorGain.gain.linearRampToValueAtTime(0.07, now + 0.1);
  motorGain.gain.setValueAtTime(0.07, now + duration - 0.15);
  motorGain.gain.linearRampToValueAtTime(0, now + duration);
  const motorFilter = c.createBiquadFilter();
  motorFilter.type = "lowpass";
  motorFilter.frequency.value = 500;
  motorFilter.connect(motorGain).connect(c.destination);
  [150, 156].forEach((freq) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.connect(motorFilter);
    osc.start(now);
    osc.stop(now + duration);
  });

  // bean crunch: a rapid, irregular rattle of short noise bursts
  let t = now + 0.05;
  while (t < now + duration - 0.05) {
    const burst = c.createBufferSource();
    burst.buffer = noiseBuffer(c, 0.04);
    const burstFilter = c.createBiquadFilter();
    burstFilter.type = "bandpass";
    burstFilter.frequency.value = 900 + Math.random() * 900;
    burstFilter.Q.value = 2;
    const burstGain = c.createGain();
    burstGain.gain.setValueAtTime(0.12 + Math.random() * 0.06, t);
    burstGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    burst.connect(burstFilter).connect(burstGain).connect(c.destination);
    burst.start(t);
    burst.stop(t + 0.04);
    t += 0.025 + Math.random() * 0.035;
  }
}

/**
 * Whipped cream dispenser: a held aerosol hiss that swells in then trails
 * off, with a tiny mechanical "trigger click" right at the start — a short
 * blip alone sounds like a UI sound effect, not a can being pressed.
 */
export function playCreamSound() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const duration = 0.7;

  // trigger click
  const click = c.createBufferSource();
  click.buffer = noiseBuffer(c, 0.02);
  const clickFilter = c.createBiquadFilter();
  clickFilter.type = "bandpass";
  clickFilter.frequency.value = 1800;
  const clickGain = c.createGain();
  clickGain.gain.setValueAtTime(0.08, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
  click.connect(clickFilter).connect(clickGain).connect(c.destination);
  click.start(now);
  click.stop(now + 0.025);

  // aerosol hiss
  const source = c.createBufferSource();
  source.buffer = noiseBuffer(c, duration);
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 4200;
  filter.Q.value = 0.6;

  const flutter = c.createOscillator();
  flutter.frequency.value = 14;
  const flutterGain = c.createGain();
  flutterGain.gain.value = 0.2;
  const flutterTarget = c.createGain();
  flutterTarget.gain.value = 1;
  flutter.connect(flutterGain).connect(flutterTarget.gain);

  const envelope = c.createGain();
  envelope.gain.setValueAtTime(0, now + 0.02);
  envelope.gain.linearRampToValueAtTime(0.13, now + 0.12);
  envelope.gain.setValueAtTime(0.13, now + duration - 0.25);
  envelope.gain.linearRampToValueAtTime(0, now + duration);

  source.connect(filter).connect(flutterTarget).connect(envelope).connect(c.destination);
  source.start(now);
  flutter.start(now);
  source.stop(now + duration);
  flutter.stop(now + duration);
}

/** A short cheerful chime — the drink is finished. */
export function playCompleteSound() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [660, 880, 1320].forEach((freq, i) => playPing(c, freq, now + i * 0.09, 0.4, 0.1));
}
