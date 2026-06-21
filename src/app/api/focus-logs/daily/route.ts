import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { getDailyFocusSeconds } from "@/lib/services/focusService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const days = Number(req.nextUrl.searchParams.get("days") ?? 14);
    const daily = await getDailyFocusSeconds(userId, Math.min(60, Math.max(1, days)));
    return sendOk(daily, "일별 집중 시간 조회 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
