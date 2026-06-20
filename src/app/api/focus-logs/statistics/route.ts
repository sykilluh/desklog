import { sendOk, sendError, ServiceError } from "@/lib/response";
import {
  getMostUsedAudioPreset,
  getTodayFocusSeconds,
  getTotalFocusSeconds,
} from "@/lib/services/focusService";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const [todaySeconds, totalSeconds, mostUsedAudioPreset] = await Promise.all([
      getTodayFocusSeconds(DEMO_USER_ID),
      getTotalFocusSeconds(DEMO_USER_ID),
      getMostUsedAudioPreset(DEMO_USER_ID),
    ]);

    return sendOk({ todaySeconds, totalSeconds, mostUsedAudioPreset }, "통계 데이터 조회 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
