import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/response";

interface SignupInput {
  email: string;
  password: string;
  nickname?: string;
}

export async function signupUser(input: SignupInput) {
  if (!input.email || !input.password) {
    throw new ServiceError("이메일과 비밀번호를 입력해주세요.", 400);
  }
  if (input.password.length < 8) {
    throw new ServiceError("비밀번호는 8자 이상이어야 합니다.", 400);
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ServiceError("이미 가입된 이메일입니다.", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      nickname: input.nickname,
    },
  });

  return { id: user.id, email: user.email, nickname: user.nickname };
}
