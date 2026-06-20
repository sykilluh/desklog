import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { createChallenge, listChallenges } from "@/lib/services/challengeService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const challenges = await listChallenges(userId);
    return sendOk(challenges, "챌린지 목록 조회 완료");
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
    const challenge = await createChallenge(userId, body);
    return sendOk(challenge, "완독 챌린지 등록 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
