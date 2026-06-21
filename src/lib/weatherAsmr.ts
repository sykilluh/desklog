export interface AsmrPreset {
  id: string;
  label: string;
  emoji: string;
  searchQuery: string;
  videoId: string;
  weatherCodes: number[];
}

// Video IDs below are real, long-running, embeddable ambience videos on YouTube
// (rain / thunder / snow-quiet / birdsong / cafe ambience(no music) / ocean waves / fireplace).
export const ASMR_PRESETS: AsmrPreset[] = [
  { id: "rain", label: "빗소리", emoji: "🌧️", searchQuery: "빗소리 ASMR 1시간", videoId: "q76bMs-NwRk", weatherCodes: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82] },
  { id: "thunder", label: "뇌우 소리", emoji: "⛈️", searchQuery: "천둥 번개 소리 ASMR", videoId: "yIQd2Ya0Ziw", weatherCodes: [95, 96, 99] },
  { id: "snow", label: "눈 내리는 소리", emoji: "❄️", searchQuery: "눈 내리는 소리 ASMR", videoId: "2sxNgD6cnno", weatherCodes: [71, 73, 75, 77, 85, 86] },
  { id: "sunny", label: "햇살 좋은 날 새소리", emoji: "☀️", searchQuery: "맑은 날 새소리 ASMR", videoId: "xNN7iTA57jM", weatherCodes: [0, 1] },
  { id: "cloudy", label: "잔잔한 카페 ASMR", emoji: "☁️", searchQuery: "카페 백색소음 ASMR 노래없이", videoId: "aJx3b2DIS68", weatherCodes: [2, 3, 45, 48] }, // coffee shop ambience only, no music
  { id: "waves", label: "파도 소리", emoji: "🌊", searchQuery: "파도 소리 ASMR", videoId: "E7qRkUYu580", weatherCodes: [] },
  { id: "fire", label: "모닥불 소리", emoji: "🔥", searchQuery: "모닥불 소리 ASMR", videoId: "L_LUpnjgPso", weatherCodes: [] },
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

export function weatherBlurb(code: number): string {
  const condition = describeWeatherCode(code);
  const preset = getAsmrForWeatherCode(code);
  return `오늘의 날씨는 ${condition}, ${condition}과 함께 어울리는 ${preset.label} ASMR 어떠세요?`;
}

export function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
