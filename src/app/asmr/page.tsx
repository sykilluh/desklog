"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ASMR_PRESETS, describeWeatherCode, getAsmrForWeatherCode, type AsmrPreset } from "@/lib/weatherAsmr";
import { useAsmrPlayer } from "@/components/providers/AsmrPlayerProvider";

interface WeatherState {
  code: number;
  temperature: number;
}

export default function AsmrPage() {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [error, setError] = useState("");
  const asmr = useAsmrPlayer();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("이 브라우저는 위치 정보를 지원하지 않아요. 아래에서 직접 골라보세요!");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const json = await res.json();
          setWeather({
            code: json.current_weather.weathercode,
            temperature: json.current_weather.temperature,
          });
        } catch {
          setError("날씨 정보를 가져오지 못했어요. 아래에서 직접 골라보세요!");
        }
      },
      () => setError("위치 권한이 없어서 자동 추천을 못 했어요. 아래에서 직접 골라보세요!")
    );
  }, []);

  const recommended = weather ? getAsmrForWeatherCode(weather.code) : null;

  function handlePlayPreset(preset: AsmrPreset) {
    if (asmr.currentVideoId === preset.videoId && asmr.isPlaying) {
      asmr.pause();
      return;
    }
    if (asmr.currentVideoId === preset.videoId) {
      asmr.play();
      return;
    }
    asmr.loadVideo(preset.videoId, true);
  }

  function isPresetPlaying(preset: AsmrPreset) {
    return asmr.currentVideoId === preset.videoId && asmr.isPlaying;
  }

  return (
    <main className="min-h-screen p-6 text-[#3a332e] sm:p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-[#837a82] hover:text-[#3a332e]">
        ← 데스크로 돌아가기
      </Link>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#9c948b]">Weather Sounds</p>
      <h1 className="font-title mb-6 text-3xl text-[#3a332e]">오늘의 날씨 ASMR</h1>

      <div className="mx-auto max-w-2xl space-y-6">
        {recommended ? (
          <div className="relative rounded-sm border border-[#e3e2de] bg-[#ffffff] p-8 text-center shadow-[0_18px_36px_rgba(40,32,28,0.12)]">
            <span className="font-hand absolute -left-3 -top-3 -rotate-6 rounded-full bg-sky-blue-400 px-3 py-1 text-sm text-white shadow-sm">
              Today's Pick
            </span>
            <p className="text-sm text-[#5c8a9c]">
              지금 날씨: {describeWeatherCode(weather!.code)} · {Math.round(weather!.temperature)}°C
            </p>
            <p className="mt-3 text-7xl">{recommended.emoji}</p>
            <p className="font-hand mt-2 text-3xl text-[#3f6f43]">{recommended.label} 추천!</p>
            <button
              onClick={() => handlePlayPreset(recommended)}
              className="press-pop mt-5 inline-block rounded-full bg-ink-600 px-6 py-3 text-base font-bold text-white shadow-sm"
            >
              {isPresetPlaying(recommended) ? "일시정지" : "바로 재생"}
            </button>
            <p className="mt-3 text-xs text-[#7c93a0]">
              음악과 동시에 재생되는 별도 채널이라, 페이지를 옮겨도 계속 들려요.
            </p>
          </div>
        ) : (
          <p className="text-center text-[#837a82]">{error || "날씨 확인 중..."}</p>
        )}

        <div className="rounded-2xl border border-[#e3e2de] bg-white p-6 shadow-sm">
          <p className="font-hand mb-4 text-2xl text-[#3a332e]">직접 골라서 듣기</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {ASMR_PRESETS.map((preset, i) => {
              const playing = isPresetPlaying(preset);
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePlayPreset(preset)}
                  style={{ "--tilt": i % 2 === 0 ? "-2deg" : "2deg" } as React.CSSProperties}
                  className={`tilt-sticker hover-lift press-pop flex flex-col items-center gap-1 rounded-md border-2 px-3 py-4 text-center shadow-md ${
                    playing ? "border-sky-blue-400 bg-sky-blue-50" : "border-white bg-white"
                  }`}
                >
                  <span className="text-3xl">{preset.emoji}</span>
                  <span className="font-hand text-lg text-[#3a332e]">{preset.label}</span>
                  <span className="text-xs text-[#837a82]">{playing ? "재생 중" : "재생"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {asmr.currentVideoId && (
          <button
            onClick={asmr.isPlaying ? asmr.pause : asmr.play}
            className="press-pop w-full rounded-full bg-angel-pink-200 px-6 py-3 text-base font-bold text-[#7a3c54] shadow-sm transition hover:bg-angel-pink-300"
          >
            {asmr.isPlaying ? "ASMR 일시정지" : "ASMR 다시 재생"}
          </button>
        )}
      </div>
    </main>
  );
}
