"use client";

import { useState } from "react";
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
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-sm space-y-4 rounded-xl bg-zinc-900 p-8">
        <h1 className="text-xl font-semibold">데스크로그 회원가입</h1>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="이메일"
          className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500"
        />
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 (선택)"
          className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="비밀번호 (8자 이상)"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500"
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
        >
          {isSubmitting ? "가입 중..." : "회원가입"}
        </button>

        <p className="text-center text-xs text-zinc-500">
          이미 계정이 있으신가요?{" "}
          <a href="/login" className="text-amber-400">
            로그인
          </a>
        </p>
      </div>
    </main>
  );
}
