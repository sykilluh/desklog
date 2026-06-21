import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|signup|dev|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};
