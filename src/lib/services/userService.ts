import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/constants";

export async function ensureDemoUser() {
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: { id: DEMO_USER_ID, email: "demo@desklog.app", password: "demo", nickname: "Demo" },
  });
}
