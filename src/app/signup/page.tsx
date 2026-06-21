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
    <main className="flex min-h-screen items-center justify-center p-6 text-[#5b4a52]">
      <div className="w-full max-w-sm space-y-4 rounded-3xl border-2 border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur">
        <h1 className="font-title text-center text-2xl text-[#3a8fb8]">💙 데스크로그 회원가입</h1>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="이메일"
          className="w-full rounded-full border border-sky-blue-100 bg-white px-4 py-2.5 text-sm placeholder:text-[#b8d3e3]"
        />
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 (선택)"
          className="w-full rounded-full border border-sky-blue-100 bg-white px-4 py-2.5 text-sm placeholder:text-[#b8d3e3]"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="비밀번호 (8자 이상)"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full rounded-full border border-sky-blue-100 bg-white px-4 py-2.5 text-sm placeholder:text-[#b8d3e3]"
        />

        {error && <p className="text-xs text-strawberry-milk-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-sky-blue-300 to-mint-300 px-4 py-2.5 text-sm font-bold text-white shadow disabled:opacity-50"
        >
          {isSubmitting ? "가입 중..." : "회원가입"}
        </button>

        <p className="text-center text-xs text-[#a8889a]">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-bold text-[#3a8fb8]">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
