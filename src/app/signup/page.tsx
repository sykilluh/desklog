"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname }),
    });
    const json = await res.json();
    setIsSubmitting(false);

    if (!json.ok) {
      setError(json.message);
      return;
    }
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-[#3a332e]">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[#e3e2de] bg-white p-8 shadow-sm">
        <h1 className="font-title text-center text-2xl text-[#3a332e]">데스크로그</h1>
        <p className="text-center text-sm text-[#837a82]">회원가입하고 시작해보세요</p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="이메일"
          className="w-full rounded-full border border-[#e3e2de] bg-white px-4 py-2.5 text-sm placeholder:text-[#b3a8ad]"
        />
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 (선택)"
          className="w-full rounded-full border border-[#e3e2de] bg-white px-4 py-2.5 text-sm placeholder:text-[#b3a8ad]"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="비밀번호 (8자 이상)"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full rounded-full border border-[#e3e2de] bg-white px-4 py-2.5 text-sm placeholder:text-[#b3a8ad]"
        />

        {error && <p className="text-xs text-strawberry-milk-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-full bg-sky-blue-400 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "가입 중..." : "회원가입"}
        </button>

        <p className="text-center text-xs text-[#837a82]">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-bold text-[#3c6577]">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
