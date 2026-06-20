import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { patchDeskObject } from "@/lib/services/deskService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    const id = Number(params.id);
    const body = await req.json();
    const updated = await patchDeskObject(userId, id, body);
    return sendOk(updated, "오브제 상태 업데이트 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
