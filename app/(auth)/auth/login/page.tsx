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
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1.2fr_1fr] md:px-8">
      <section className="surface animate-fade relative overflow-hidden p-6 md:p-10">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[color-mix(in_srgb,var(--primary)_25%,transparent)] blur-3xl" />
        <div className="relative">
          <p className="badge">Cloud Intelligence Platform</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">Deploy Faster. Operate Smarter.</h1>
          <p className="mt-4 max-w-xl text-base text-[var(--text-muted)]">
            A SaaS control plane for project health, observability, alerts, and cost optimization.
          </p>
        </div>
      </section>

      <section className="surface animate-rise p-6 md:p-8">
        <h2 className="text-3xl font-semibold">Sign In</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Use your account credentials.</p>
        <div className="mt-5 space-y-3">
          <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={onSignIn} disabled={loading} className="btn-primary w-full p-3 text-sm font-semibold disabled:opacity-60">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>

        {status ? <p className="mt-3 rounded-lg border border-[var(--danger)] p-2 text-sm text-[var(--danger)]">{status}</p> : null}

        <div className="mt-5 flex justify-between text-sm">
          <Link href="/auth/forgot-password" className="text-[var(--text-muted)] hover:text-[var(--text)]">Forgot password?</Link>
          <Link href="/auth/signup" className="text-[var(--primary-strong)] hover:underline">Create account</Link>
        </div>
      </section>
    </main>
  );
}
