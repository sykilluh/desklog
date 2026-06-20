import { sendOk, sendError, ServiceError } from "@/lib/response";
import { waterPlantToday } from "@/lib/services/plantService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function POST() {
  try {
    const userId = await getCurrentUserId();
    const status = await waterPlantToday(userId);
    return sendOk(status, "오늘의 물주기 완료! 🌱");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
