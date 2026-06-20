import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { createFocusLog, getTodayFocusSeconds } from "@/lib/services/focusService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();
    const log = await createFocusLog(userId, body.focusDuration, body.audioPresetName, body.challengeId);
    return sendOk(log, "타이머 세션 기록 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const todaySeconds = await getTodayFocusSeconds(userId);
    return sendOk({ todaySeconds }, "통계 조회 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
