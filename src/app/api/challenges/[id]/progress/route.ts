import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { updateChallengeProgress } from "@/lib/services/challengeService";
import { DEMO_USER_ID } from "@/lib/constants";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const challenge = await updateChallengeProgress(DEMO_USER_ID, id, body.currentPages);
    return sendOk(challenge, "진도율 업데이트 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
