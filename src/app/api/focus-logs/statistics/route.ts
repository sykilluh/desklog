import { sendOk, sendError, ServiceError } from "@/lib/response";
import {
  getMostUsedAudioPreset,
  getTodayFocusSeconds,
  getTotalFocusSeconds,
} from "@/lib/services/focusService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const [todaySeconds, totalSeconds, mostUsedAudioPreset] = await Promise.all([
      getTodayFocusSeconds(userId),
      getTotalFocusSeconds(userId),
      getMostUsedAudioPreset(userId),
    ]);

    return sendOk({ todaySeconds, totalSeconds, mostUsedAudioPreset }, "통계 데이터 조회 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
