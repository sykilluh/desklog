import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { updateChallenge, deleteChallenge } from "@/lib/services/challengeService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    const id = Number(params.id);
    const body = await req.json();
    const challenge = await updateChallenge(userId, id, body);
    return sendOk(challenge, "챌린지 수정 완료");
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
    await deleteChallenge(userId, id);
    return sendOk(null, "챌린지 삭제 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
