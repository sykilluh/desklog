import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { createFocusLog, getTodayFocusSeconds } from "@/lib/services/focusService";
import { DEMO_USER_ID } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const log = await createFocusLog(
      DEMO_USER_ID,
      body.focusDuration,
      body.audioPresetName,
      body.challengeId
    );
    return sendOk(log, "타이머 세션 기록 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}

export async function GET() {
  try {
    const todaySeconds = await getTodayFocusSeconds(DEMO_USER_ID);
    return sendOk({ todaySeconds }, "통계 조회 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
