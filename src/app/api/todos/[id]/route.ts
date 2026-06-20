import { NextRequest } from "next/server";
import { sendOk, sendError, ServiceError } from "@/lib/response";
import { deleteTodo, updateTodo } from "@/lib/services/todoService";
import { getCurrentUserId } from "@/lib/services/userService";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    const id = Number(params.id);
    const body = await req.json();
    const todo = await updateTodo(userId, id, body);
    return sendOk(todo, "할 일 수정 완료");
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
    await deleteTodo(userId, id);
    return sendOk(null, "할 일 삭제 완료");
  } catch (err) {
    if (err instanceof ServiceError) return sendError(err.message, err.status);
    console.error(err);
    return sendError("서버 오류가 발생했습니다.", 500);
  }
}
