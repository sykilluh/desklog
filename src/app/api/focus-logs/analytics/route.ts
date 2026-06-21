import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { getFocusAnalytics, setDailyGoalMinutes } from "@/lib/services/focusService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const period = req.nextUrl.searchParams.get("period") === "monthly" ? 30 : 7;
    const analytics = await getFocusAnalytics(userId, period);
    return sendOk(analytics, "집중 분석 조회 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();
    const goalMinutes = await setDailyGoalMinutes(userId, body.goalMinutes);
    return sendOk({ goalMinutes }, "목표 시간 수정 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
