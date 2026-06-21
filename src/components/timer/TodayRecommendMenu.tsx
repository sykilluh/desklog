"use client";

import { useRef, useState } from "react";
import MugIcon, { DRINK_OPTIONS, type DrinkOption } from "@/components/desk/MugIcon";
import { playIceSound, playPourSound, playGrindSound, playCreamSound, playCompleteSound } from "@/lib/sfx";

interface CraftStep {
  key: "grind" | "ice" | "pour" | "cream";
  label: string;
  emoji: string;
  particle: string;
  play: () => void;
}

interface Particle {
  id: number;
  emoji: string;
  left: number;
  rotate: number;
  delay: number;
}

const COFFEE_DRINK_IDS = new Set(["iceAmericano", "vanillaLatte"]);
const CREAM_DRINK_IDS = new Set(["vanillaLatte", "milkTea", "matcha"]);

function stepsFor(drink: DrinkOption): CraftStep[] {
  const steps: CraftStep[] = [];
  if (COFFEE_DRINK_IDS.has(drink.id)) {
    steps.push({ key: "grind", label: "원두 갈기", emoji: "☕", particle: "🟤", play: playGrindSound });
  }
  steps.push({ key: "ice", label: "얼음 넣기", emoji: "🧊", particle: "🧊", play: playIceSound });
  steps.push({ key: "pour", label: "음료 붓기", emoji: "🥤", particle: "💧", play: playPourSound });
  if (CREAM_DRINK_IDS.has(drink.id)) {
    steps.push({ key: "cream", label: "크림 올리기", emoji: "🍦", particle: "☁️", play: playCreamSound });
  }
  return steps;
}

export default function TodayRecommendMenu({
  onComplete,
  onClose,
}: {
  onComplete: (drinkId: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<DrinkOption | null>(null);
  const [doneSteps, setDoneSteps] = useState<Set<string>>(new Set());
  const [brewing, setBrewing] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [wobble, setWobble] = useState(0);
  const particleIdRef = useRef(0);

  const steps = selected ? stepsFor(selected) : [];
  const allDone = selected && doneSteps.size === steps.length;

  function selectDrink(drink: DrinkOption) {
    setSelected(drink);
    setDoneSteps(new Set());
    setBrewing(false);
    setParticles([]);
  }

  function spawnParticles(emoji: string) {
    const burst: Particle[] = Array.from({ length: 6 }, () => ({
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

  function runStep(step: CraftStep) {
    if (doneSteps.has(step.key)) return;
    step.play();
    spawnParticles(step.particle);
    setWobble((w) => w + 1);
    const next = new Set(doneSteps);
    next.add(step.key);
    setDoneSteps(next);
    if (next.size === steps.length) {
      setBrewing(true);
      playCompleteSound();
    }
  }

  const nextStep = steps.find((s) => !doneSteps.has(s.key));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-white shadow-2xl"
      >
        {/* shelf backdrop */}
        <div className="bg-gradient-to-b from-sky-blue-100 via-[#fdf6f0] to-[#f3dcc0] px-6 pb-6 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-title text-xl text-[#ff6fa5]">🧋 오늘의 카페 코너</h2>
            <button onClick={onClose} className="text-sm font-bold text-[#a8889a]">
              ✕
            </button>
          </div>

          {!selected ? (
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
          ) : (
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
                />
              </div>
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
            `}</style>
            <p className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-[#5b4a52] shadow-sm">
              {allDone ? `🎉 ${selected.label} 완성!` : `🧾 주문서 · ${selected.label}`}
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {steps.map((step) => {
                const done = doneSteps.has(step.key);
                const isNext = nextStep?.key === step.key;
                const locked = !done && !isNext;
                return (
                  <button
                    key={step.key}
                    onClick={() => !locked && runStep(step)}
                    disabled={done || locked}
                    title={locked ? "이전 단계를 먼저 끝내주세요" : undefined}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition active:scale-95 ${
                      done
                        ? "border-mint-200 bg-mint-100 text-[#3a6e58]"
                        : isNext
                        ? "scale-105 border-angel-pink-300 bg-white text-[#5b4a52] shadow-md hover:bg-angel-pink-50"
                        : "border-angel-pink-100 bg-white/40 text-[#cdb8c4] opacity-50"
                    }`}
                  >
                    {step.emoji} {step.label} {done ? "✓" : locked ? "🔒" : ""}
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
          )}
        </div>
      </div>
    </div>
  );
}
