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
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-sm space-y-4 rounded-xl bg-zinc-900 p-8">
        <h1 className="text-xl font-semibold">데스크로그 로그인</h1>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="이메일"
          className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="비밀번호"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500"
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>

        <p className="text-center text-xs text-zinc-500">
          계정이 없으신가요?{" "}
          <a href="/signup" className="text-amber-400">
            회원가입
          </a>
        </p>
      </div>
    </main>
  );
}
