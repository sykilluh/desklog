export interface AsmrPreset {
  id: string;
  label: string;
  emoji: string;
  searchQuery: string;
  weatherCodes: number[];
}

export const ASMR_PRESETS: AsmrPreset[] = [
  { id: "rain", label: "빗소리", emoji: "🌧️", searchQuery: "빗소리 ASMR 1시간", weatherCodes: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82] },
  { id: "thunder", label: "뇌우 소리", emoji: "⛈️", searchQuery: "천둥 번개 소리 ASMR", weatherCodes: [95, 96, 99] },
  { id: "snow", label: "눈 내리는 소리", emoji: "❄️", searchQuery: "눈 내리는 소리 ASMR", weatherCodes: [71, 73, 75, 77, 85, 86] },
  { id: "sunny", label: "햇살 좋은 날 새소리", emoji: "☀️", searchQuery: "맑은 날 새소리 ASMR", weatherCodes: [0, 1] },
  { id: "cloudy", label: "잔잔한 카페 ASMR", emoji: "☁️", searchQuery: "카페 분위기 ASMR 로파이", weatherCodes: [2, 3, 45, 48] },
  { id: "waves", label: "파도 소리", emoji: "🌊", searchQuery: "파도 소리 ASMR", weatherCodes: [] },
  { id: "fire", label: "모닥불 소리", emoji: "🔥", searchQuery: "모닥불 소리 ASMR", weatherCodes: [] },
];

export function getAsmrForWeatherCode(code: number): AsmrPreset {
  return ASMR_PRESETS.find((preset) => preset.weatherCodes.includes(code)) ?? ASMR_PRESETS[3];
}

export function describeWeatherCode(code: number): string {
  if ([0, 1].includes(code)) return "맑음";
  if ([2, 3].includes(code)) return "구름 많음";
  if ([45, 48].includes(code)) return "안개";
  if ([51, 53, 55, 56, 57].includes(code)) return "이슬비";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "비";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "눈";
  if ([95, 96, 99].includes(code)) return "뇌우";
  return "알 수 없음";
}

export function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
