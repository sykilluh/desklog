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
    <main className="min-h-screen p-6 text-[#5b4a52] sm:p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-[#a8889a]">
        ← 데스크로 돌아가기
      </Link>
      <h1 className="font-title mb-6 text-3xl text-[#3a8fb8]">🌈 오늘의 날씨 ASMR</h1>

      <div className="mx-auto max-w-2xl space-y-6">
        {recommended ? (
          <div className="rounded-3xl border-2 border-white/70 bg-gradient-to-br from-sky-blue-100 to-mint-100 p-8 text-center shadow-md shadow-sky-blue-200/40">
            <p className="text-sm text-[#3a8fb8]">
              지금 날씨: {describeWeatherCode(weather!.code)} · {Math.round(weather!.temperature)}°C
            </p>
            <p className="mt-3 text-7xl">{recommended.emoji}</p>
            <p className="mt-2 text-2xl font-bold text-[#3a6e58]">{recommended.label} 추천!</p>
            <button
              onClick={() => handlePlayPreset(recommended)}
              className="mt-5 inline-block rounded-full bg-gradient-to-r from-sky-blue-300 to-mint-300 px-6 py-3 text-base font-bold text-white shadow"
            >
              {isPresetPlaying(recommended) ? "⏸ 일시정지" : "▶ 바로 재생"}
            </button>
            <p className="mt-3 text-xs text-[#8fb0c4]">
              음악과 동시에 재생되는 별도 채널이라, 페이지를 옮겨도 계속 들려요.
            </p>
          </div>
        ) : (
          <p className="text-center text-[#a8889a]">{error || "날씨 확인 중..."}</p>
        )}

        <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-6 shadow-md shadow-angel-pink-100/40 backdrop-blur">
          <p className="mb-4 text-lg font-bold text-[#ff6fa5]">직접 골라서 듣기</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ASMR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePlayPreset(preset)}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-4 text-center shadow-sm transition hover:scale-105 ${
                  isPresetPlaying(preset)
                    ? "border-sky-blue-300 bg-sky-blue-50"
                    : "border-angel-pink-100 bg-white hover:bg-angel-pink-50"
                }`}
              >
                <span className="text-3xl">{preset.emoji}</span>
                <span className="text-sm font-bold">{preset.label}</span>
                <span className="text-xs text-[#a8889a]">{isPresetPlaying(preset) ? "⏸ 재생 중" : "▶ 재생"}</span>
              </button>
            ))}
          </div>
        </div>

        {asmr.currentVideoId && (
          <button
            onClick={asmr.isPlaying ? asmr.pause : asmr.play}
            className="w-full rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-6 py-3 text-base font-bold text-white shadow"
          >
            {asmr.isPlaying ? "⏸ ASMR 일시정지" : "▶ ASMR 다시 재생"}
          </button>
        )}
      </div>
    </main>
  );
}
