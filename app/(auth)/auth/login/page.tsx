"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SaaSLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSignIn() {
    setLoading(true);
    setStatus("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus(payload.error ?? "Invalid credentials");
      setLoading(false);
      return;
    }

    router.push("/workspace/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Login</h1>
      <input
        className="w-full rounded-md border border-[var(--border)] bg-transparent p-3"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full rounded-md border border-[var(--border)] bg-transparent p-3"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={onSignIn} disabled={loading} className="w-full rounded-md bg-cyan-500 p-3 font-medium text-slate-900 disabled:opacity-60">
        {loading ? "Signing In..." : "Sign In"}
      </button>
      <p className="text-xs text-[var(--text-muted)]">Admin login: admin@test.com / 123456</p>
      {status ? <p className="text-sm text-rose-300">{status}</p> : null}
      <div className="flex justify-between text-sm">
        <Link href="/auth/forgot-password">Forgot password?</Link>
        <Link href="/auth/signup">Create account</Link>
      </div>
    </main>
  );
}
