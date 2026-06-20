import { sendOk, sendError, ServiceError } from "@/lib/response";
import { getPlantStatus } from "@/lib/services/plantService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const status = await getPlantStatus(userId);
    return sendOk(status, "식물 상태 조회 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
