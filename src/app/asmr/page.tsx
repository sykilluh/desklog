"use client";

import { useEffect, useState } from "react";
import { ASMR_PRESETS, describeWeatherCode, getAsmrForWeatherCode, youtubeSearchUrl } from "@/lib/weatherAsmr";

interface WeatherState {
  code: number;
  temperature: number;
}

export default function AsmrPage() {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [error, setError] = useState("");

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

  return (
    <main className="min-h-screen p-6 text-[#5b4a52] sm:p-8">
      <a href="/" className="mb-4 inline-block text-sm text-[#a8889a]">
        ← 데스크로 돌아가기
      </a>
      <h1 className="mb-6 text-3xl text-[#3a8fb8]">🌈 오늘의 날씨 ASMR</h1>

      <div className="mx-auto max-w-2xl space-y-6">
        {recommended ? (
          <div className="rounded-3xl border-2 border-white/70 bg-gradient-to-br from-sky-blue-100 to-mint-100 p-8 text-center shadow-md">
            <p className="text-sm text-[#3a8fb8]">
              지금 날씨: {describeWeatherCode(weather!.code)} · {Math.round(weather!.temperature)}°C
            </p>
            <p className="mt-3 text-7xl">{recommended.emoji}</p>
            <p className="mt-2 text-2xl font-bold text-[#3a6e58]">{recommended.label} 추천!</p>
            <a
              href={youtubeSearchUrl(recommended.searchQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-full bg-gradient-to-r from-sky-blue-300 to-mint-300 px-6 py-3 text-base font-bold text-white shadow"
            >
              🔎 유튜브에서 &ldquo;{recommended.searchQuery}&rdquo; 찾아보기
            </a>
            <p className="mt-3 text-xs text-[#8fb0c4]">
              마음에 드는 영상 링크를 복사해서 하단 플레이리스트에 붙여넣으면 바로 재생돼요!
            </p>
          </div>
        ) : (
          <p className="text-center text-[#a8889a]">{error || "날씨 확인 중..."}</p>
        )}

        <div className="rounded-3xl border-2 border-white/70 bg-white/80 p-6 shadow-md backdrop-blur">
          <p className="mb-4 text-lg font-bold text-[#ff6fa5]">직접 골라서 듣기</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ASMR_PRESETS.map((preset) => (
              <a
                key={preset.id}
                href={youtubeSearchUrl(preset.searchQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-2xl border-2 border-angel-pink-100 bg-white px-3 py-4 text-center shadow-sm transition hover:scale-105 hover:bg-angel-pink-50"
              >
                <span className="text-3xl">{preset.emoji}</span>
                <span className="text-sm font-bold">{preset.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
