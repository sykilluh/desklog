import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { getDeskObjects, saveDeskObjects } from "@/lib/services/deskService";
import { DEMO_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const objects = await getDeskObjects(DEMO_USER_ID);
    return sendOk(objects, "데스크 배치 불러오기 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const objects = await saveDeskObjects(DEMO_USER_ID, body.objects ?? []);
    return sendOk(objects, "데스크 배치 저장 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
