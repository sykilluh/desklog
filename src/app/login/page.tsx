"use client";

import { useState } from "react";
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
    <main className="flex min-h-screen items-center justify-center p-6 text-[#5b4a52]">
      <div className="w-full max-w-sm space-y-4 rounded-3xl border-2 border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur">
        <h1 className="text-center text-2xl text-[#ff6fa5]">🩷 데스크로그 로그인</h1>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="이메일"
          className="w-full rounded-full border border-angel-pink-100 bg-white px-4 py-2.5 text-sm placeholder:text-[#cdb8c4]"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="비밀번호"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full rounded-full border border-angel-pink-100 bg-white px-4 py-2.5 text-sm placeholder:text-[#cdb8c4]"
        />

        {error && <p className="text-xs text-strawberry-milk-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-angel-pink-300 to-strawberry-milk-300 px-4 py-2.5 text-sm font-bold text-white shadow disabled:opacity-50"
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>

        <p className="text-center text-xs text-[#a8889a]">
          계정이 없으신가요?{" "}
          <a href="/signup" className="font-bold text-[#ff6fa5]">
            회원가입
          </a>
        </p>
      </div>
    </main>
  );
}
