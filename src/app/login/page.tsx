"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setIsSubmitting(false);

    if (result?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-[#3a332e]">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[#e3e2de] bg-white p-8 shadow-sm">
        <h1 className="font-title text-center text-2xl text-[#3a332e]">데스크로그</h1>
        <p className="text-center text-sm text-[#837a82]">로그인하고 오늘의 집중을 기록하세요</p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="이메일"
          className="w-full rounded-full border border-[#e3e2de] bg-white px-4 py-2.5 text-sm placeholder:text-[#b3a8ad]"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="비밀번호"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full rounded-full border border-[#e3e2de] bg-white px-4 py-2.5 text-sm placeholder:text-[#b3a8ad]"
        />

        {error && <p className="text-xs text-strawberry-milk-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-full bg-angel-pink-200 px-4 py-2.5 text-sm font-bold text-[#7a3c54] shadow-sm transition hover:bg-angel-pink-300 disabled:opacity-50"
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>

        <p className="text-center text-xs text-[#837a82]">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-bold text-[#d2658f]">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
