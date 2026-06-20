import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";

export async function listTodos(userId: number) {
  return prisma.todo.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}

export async function createTodo(userId: number, title: string) {
  if (!title?.trim()) {
    throw new ServiceError("할 일 내용을 입력해주세요.", 400);
  }
  return prisma.todo.create({ data: { userId, title: title.trim() } });
}

interface UpdateTodoInput {
  title?: string;
  isDone?: boolean;
  addFocusSeconds?: number;
}

export async function updateTodo(userId: number, id: number, input: UpdateTodoInput) {
  const existing = await prisma.todo.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ServiceError("할 일을 찾을 수 없습니다.", 404);
  }

  return prisma.todo.update({
    where: { id },
    data: {
      title: input.title,
      isDone: input.isDone,
      focusSeconds:
        input.addFocusSeconds !== undefined
          ? existing.focusSeconds + input.addFocusSeconds
          : undefined,
    },
  });
}

export async function deleteTodo(userId: number, id: number) {
  const existing = await prisma.todo.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ServiceError("할 일을 찾을 수 없습니다.", 404);
  }
  await prisma.todo.delete({ where: { id } });
}
