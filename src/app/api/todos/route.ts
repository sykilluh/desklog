import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { createTodo, listTodos } from "@/lib/services/todoService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const todos = await listTodos(userId);
    return sendOk(todos, "할 일 목록 조회 완료");
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
    const todo = await createTodo(userId, body.title);
    return sendOk(todo, "할 일 추가 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
