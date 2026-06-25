import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { getSubjectMonthlyLogs, setSubjectDailyLogSeconds } from "@/lib/services/focusSessionService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const now = new Date();
    const year = Number(req.nextUrl.searchParams.get("year")) || now.getFullYear();
    const month = Number(req.nextUrl.searchParams.get("month")) || now.getMonth() + 1;
    const subjects = await getSubjectMonthlyLogs(userId, year, month);
    return sendOk({ year, month, subjects }, "과목별 월간 기록 조회 완료");
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
    const log = await setSubjectDailyLogSeconds(userId, body.subjectName, body.date, body.seconds);
    return sendOk(log, "일별 기록 수정 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
