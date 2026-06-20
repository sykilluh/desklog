import { auth } from "@/lib/auth";
import { sendOk, sendError } from "@/lib/response";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return sendError("로그인이 필요합니다.", 401);
  }
  return sendOk(session.user, "회원정보 조회 완료");
}
