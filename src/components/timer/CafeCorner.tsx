"use client";

import { useRef, useState } from "react";
import MugIcon, { DRINK_OPTIONS, type DrinkOption } from "@/components/desk/MugIcon";
import {
  playGrindCrankTick,
  playIceDropTick,
  playPourGlugTick,
  playCreamPuffTick,
  playSteepDunkTick,
  playWhiskStrokeTick,
  playCompleteSound,
} from "@/lib/sfx";

interface CraftStep {
  key: "grind" | "steep" | "whisk" | "ice" | "pour" | "cream";
  label: string;
  emoji: string;
  toolEmoji: string;
  particle: string;
  /** Number of taps/cranks needed to finish this step — turns a one-click
   * "done" into a tiny repeated-action mini-game (crank the grinder, drop
   * cubes in one at a time, etc), closer to the reference clips. */
  taps: number;
  /** Called once per tap with the tap index (0-based) so sounds like the
   * grinder crank can vary slightly turn to turn. */
  tick: (turn: number) => void;
}

interface Particle {
  id: number;
  emoji: string;
  left: number;
  rotate: number;
  delay: number;
}

const GRIND_DRINK_IDS = new Set(["iceAmericano", "vanillaLatte"]);
const STEEP_DRINK_IDS = new Set(["milkTea"]);
const WHISK_DRINK_IDS = new Set(["matcha"]);
const ICE_DRINK_IDS = new Set(["iceAmericano", "milkTea", "matcha"]);
const CREAM_DRINK_IDS = new Set(["vanillaLatte", "milkTea", "matcha"]);

/**
 * Every drink gets its own full multi-step crafting sequence — not just the
 * coffee drinks — so 말차라떼/밀크티 also play out as a real little game
 * (whisking matcha, steeping tea) instead of skipping straight to "pour".
 */
function stepsFor(drink: DrinkOption): CraftStep[] {
  const steps: CraftStep[] = [];
  if (GRIND_DRINK_IDS.has(drink.id)) {
    steps.push({ key: "grind", label: "원두 갈기", emoji: "☕", toolEmoji: "⚙️", particle: "🟤", taps: 6, tick: playGrindCrankTick });
  }
  if (STEEP_DRINK_IDS.has(drink.id)) {
    steps.push({ key: "steep", label: "찻잎 우리기", emoji: "🍵", toolEmoji: "🍃", particle: "🍃", taps: 3, tick: playSteepDunkTick });
  }
  if (WHISK_DRINK_IDS.has(drink.id)) {
    steps.push({ key: "whisk", label: "말차 가루 풀기", emoji: "🍵", toolEmoji: "🥢", particle: "🌿", taps: 6, tick: playWhiskStrokeTick });
  }
  if (ICE_DRINK_IDS.has(drink.id)) {
    steps.push({ key: "ice", label: "얼음 넣기", emoji: "🧊", toolEmoji: "🧊", particle: "🧊", taps: 4, tick: playIceDropTick });
  }
  steps.push({ key: "pour", label: "음료 붓기", emoji: "🥤", toolEmoji: "🫗", particle: "💧", taps: 4, tick: playPourGlugTick });
  if (CREAM_DRINK_IDS.has(drink.id)) {
    steps.push({ key: "cream", label: "휘핑크림 올리기", emoji: "🍦", toolEmoji: "🍦", particle: "☁️", taps: 3, tick: playCreamPuffTick });
  }
  return steps;
}

/**
 * The actual drink-picker + step-by-step crafting game. Shared between the
 * "오늘의 추천 메뉴" modal and the standalone /cafe page, so both stay in
 * sync instead of drifting into two copies of the same logic.
 */
export default function CafeCorner({ onComplete }: { onComplete: (drinkId: string) => void }) {
  const [selected, setSelected] = useState<DrinkOption | null>(null);
  const [tapCounts, setTapCounts] = useState<Record<string, number>>({});
  const [doneSteps, setDoneSteps] = useState<Set<string>>(new Set());
  const [brewing, setBrewing] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [wobble, setWobble] = useState(0);
  const particleIdRef = useRef(0);

  const steps = selected ? stepsFor(selected) : [];
  const allDone = selected && doneSteps.size === steps.length;
  const nextStep = steps.find((s) => !doneSteps.has(s.key));

  function selectDrink(drink: DrinkOption) {
    setSelected(drink);
    setTapCounts({});
    setDoneSteps(new Set());
    setBrewing(false);
    setParticles([]);
  }

  function spawnParticles(emoji: string, count = 4) {
    const burst: Particle[] = Array.from({ length: count }, () => ({
      id: particleIdRef.current++,
      emoji,
      left: 30 + Math.random() * 40,
      rotate: Math.random() * 80 - 40,
      delay: Math.random() * 0.15,
    }));
    setParticles((prev) => [...prev, ...burst]);
    window.setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !burst.includes(p)));
    }, 900);
  }

  function runTap(step: CraftStep) {
    if (doneSteps.has(step.key)) return;
    const current = tapCounts[step.key] ?? 0;
    if (current >= step.taps) return;

    step.tick(current);
    spawnParticles(step.particle, current === step.taps - 1 ? 7 : 3);
    setWobble((w) => w + 1);

    const nextCount = current + 1;
    setTapCounts((prev) => ({ ...prev, [step.key]: nextCount }));

    if (nextCount >= step.taps) {
      const nextDone = new Set(doneSteps);
      nextDone.add(step.key);
      setDoneSteps(nextDone);
      if (nextDone.size === steps.length) {
        setBrewing(true);
        playCompleteSound();
      }
    }
  }

  if (!selected) {
    return (
      <>
        <p className="mb-4 text-sm text-[#a8889a]">오늘 공부할 때 마실 음료를 메뉴판에서 골라주세요.</p>
        <div className="grid grid-cols-2 gap-3">
          {DRINK_OPTIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => selectDrink(d)}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-white bg-white/80 p-3 shadow-sm transition hover:-translate-y-0.5 hover:scale-105 hover:border-angel-pink-300 hover:shadow-md"
            >
              <MugIcon size={64} cupFill={d.cupFill} cupStroke={d.cupStroke} liquidFill={d.liquidFill} liquidStroke={d.liquidStroke} variantId={d.id} photo={d.photo} />
              <span className="rounded-full bg-angel-pink-50 px-2 py-0.5 text-xs font-bold text-[#5b4a52]">{d.label}</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  const nextCount = nextStep ? tapCounts[nextStep.key] ?? 0 : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* level progress dots — game-like step tracker */}
      <div className="flex items-center gap-1.5">
        {steps.map((step, i) => {
          const done = doneSteps.has(step.key);
          const isNext = nextStep?.key === step.key;
          return (
            <div key={step.key} className="flex items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition ${
                  done
                    ? "bg-mint-300 text-white"
                    : isNext
                    ? "animate-pulse bg-angel-pink-300 text-white"
                    : "bg-white/70 text-[#cdb8c4]"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {i < steps.length - 1 && (
                <span className={`h-1 w-4 rounded-full ${done ? "bg-mint-300" : "bg-white/70"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden">
        <div key={wobble} className="craft-wobble">
          <MugIcon
            size={150}
            cupFill={selected.cupFill}
            cupStroke={selected.cupStroke}
            liquidFill={selected.liquidFill}
            liquidStroke={selected.liquidStroke}
            variantId={selected.id}
            photo={selected.photo}
            brewing={brewing}
            // Empty cup that visibly gains ice/liquid/cream as each step is
            // tapped through, instead of looking finished from the first
            // click — once every step is done, drop the override so it
            // switches to the real product photo as the finishing reward.
            revealed={allDone ? undefined : { ice: doneSteps.has("ice"), liquid: doneSteps.has("pour"), cream: doneSteps.has("cream") }}
          />
        </div>

        {/* the tool for the current step — spins/bounces a bit further with
            every tap, like a crank handle being turned or a whisk flicking */}
        {nextStep && (
          <div
            key={`${nextStep.key}-${wobble}`}
            className="tool-flick pointer-events-none absolute right-2 top-2 text-3xl"
            style={{ "--turn": `${nextCount * 47}deg` } as React.CSSProperties}
          >
            {nextStep.toolEmoji}
          </div>
        )}

        {particles.map((p) => (
          <span
            key={p.id}
            className="craft-particle pointer-events-none absolute top-0 text-2xl"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              "--rot": `${p.rotate}deg`,
            } as React.CSSProperties}
          >
            {p.emoji}
          </span>
        ))}
        {allDone && (
          <div className="confetti-burst pointer-events-none absolute inset-0">
            {["✨", "🎉", "✨", "🎊", "✨", "🎉"].map((e, i) => (
              <span
                key={i}
                className="confetti-piece absolute text-xl"
                style={{ left: `${10 + i * 15}%`, animationDelay: `${i * 0.07}s` }}
              >
                {e}
              </span>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .confetti-piece {
          top: 50%;
          animation: confetti-pop 1.1s ease-out forwards;
        }
        @keyframes confetti-pop {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translateY(-90px) scale(1.1);
            opacity: 0;
          }
        }
        .craft-wobble {
          animation: craft-wobble 0.4s ease-out;
        }
        @keyframes craft-wobble {
          0% {
            transform: scale(1) rotate(0deg);
          }
          30% {
            transform: scale(1.06) rotate(-3deg);
          }
          60% {
            transform: scale(0.98) rotate(2deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        .craft-particle {
          animation: craft-particle-fall 0.85s ease-in forwards;
        }
        @keyframes craft-particle-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateY(170px) rotate(var(--rot));
            opacity: 0;
          }
        }
        .tool-flick {
          animation: tool-flick-spin 0.3s ease-out;
          transform: rotate(var(--turn));
        }
        @keyframes tool-flick-spin {
          0% {
            transform: rotate(calc(var(--turn) - 30deg)) scale(0.85);
          }
          60% {
            transform: rotate(calc(var(--turn) + 6deg)) scale(1.15);
          }
          100% {
            transform: rotate(var(--turn)) scale(1);
          }
        }
      `}</style>
      <p className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-[#5b4a52] shadow-sm">
        {allDone ? `🎉 ${selected.label} 완성!` : `🧾 주문서 · ${selected.label}`}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {steps.map((step) => {
          const done = doneSteps.has(step.key);
          const isNext = nextStep?.key === step.key;
          const locked = !done && !isNext;
          const count = tapCounts[step.key] ?? 0;
          const progressPct = Math.min(100, (count / step.taps) * 100);
          return (
            <button
              key={step.key}
              onClick={() => !locked && runTap(step)}
              disabled={done || locked}
              title={locked ? "이전 단계를 먼저 끝내주세요" : `${step.taps - count}번 더 눌러주세요`}
              className={`relative overflow-hidden rounded-full border-2 px-4 py-2 text-sm font-bold transition active:scale-95 ${
                done
                  ? "border-mint-200 bg-mint-100 text-[#3a6e58]"
                  : isNext
                  ? "scale-105 border-angel-pink-300 bg-white text-[#5b4a52] shadow-md hover:bg-angel-pink-50"
                  : "border-angel-pink-100 bg-white/40 text-[#cdb8c4] opacity-50"
              }`}
            >
              {/* fill bar showing crank/tap progress toward this step's goal */}
              {isNext && progressPct > 0 && (
                <span
                  className="absolute inset-y-0 left-0 -z-10 bg-angel-pink-100 transition-[width]"
                  style={{ width: `${progressPct}%` }}
                />
              )}
              <span className="relative">
                {step.emoji} {step.label} {done ? "✓" : locked ? "🔒" : isNext ? `${count}/${step.taps}` : ""}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSelected(null)}
          className="rounded-full bg-angel-pink-50 px-4 py-2 text-sm font-bold text-[#a8889a]"
        >
          ← 다시 고르기
        </button>
        <button
          onClick={() => allDone && onComplete(selected.id)}
          disabled={!allDone}
          className="rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-5 py-2 text-sm font-bold text-white shadow transition disabled:opacity-40 enabled:hover:scale-105 enabled:animate-pulse"
        >
          ✨ 이 음료로 공부 시작하기
        </button>
      </div>
    </div>
  );
}
