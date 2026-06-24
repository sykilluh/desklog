import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import {
  addFocusSessionSeconds,
  updateFocusSession,
  saveFocusSessionProgress,
  deleteFocusSession,
} from "@/lib/services/focusSessionService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    const id = Number(params.id);
    const body = await req.json();

    let session = null;
    if (typeof body.addSeconds === "number") {
      session = await addFocusSessionSeconds(userId, id, body.addSeconds);
    }
    if (body.name !== undefined || body.isCompleted !== undefined) {
      session = await updateFocusSession(userId, id, {
        name: body.name,
        isCompleted: body.isCompleted,
      });
    }
    if (typeof body.lastSeconds === "number") {
      session = await saveFocusSessionProgress(userId, id, {
        lastSeconds: body.lastSeconds,
        lastPhase: body.lastPhase === "break" ? "break" : "focus",
        presetFocusMinutes: body.presetFocusMinutes,
        presetBreakMinutes: body.presetBreakMinutes,
      });
    }

    return sendOk(session, "기록 수정 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    const id = Number(params.id);
    await deleteFocusSession(userId, id);
    return sendOk(null, "기록 삭제 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
