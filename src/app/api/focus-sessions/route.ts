import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { listFocusSessions, createFocusSession } from "@/lib/services/focusSessionService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const sessions = await listFocusSessions(userId);
    return sendOk(sessions, "기록 조회 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();
    const session = await createFocusSession(userId, body.name, body.mode, body.preset);
    return sendOk(session, "새 기록 생성 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
