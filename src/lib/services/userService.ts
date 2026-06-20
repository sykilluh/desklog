import { auth } from "@/lib/auth";
import { ServiceError } from "@/lib/response";

export async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ServiceError("로그인이 필요합니다.", 401);
  }
  return Number(session.user.id);
}
