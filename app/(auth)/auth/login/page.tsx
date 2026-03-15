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
            A Firebase-style SaaS control plane for project health, observability, alerts, and cost optimization.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <article className="surface-soft p-4">
              <p className="text-sm font-medium">Realtime Monitoring</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Topology insights, CPU trends, and anomaly tracking from one dashboard.</p>
            </article>
            <article className="surface-soft p-4">
              <p className="text-sm font-medium">FinOps Intelligence</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Cost visibility by project, workload, and service boundaries.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="surface animate-rise p-6 md:p-8">
        <h2 className="text-3xl font-semibold">Sign In</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Access your workspace and manage your organization securely.</p>
        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={onSignIn} disabled={loading} className="btn-primary w-full p-3 text-sm font-semibold disabled:opacity-60">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@test.com");
              setPassword("123456");
            }}
            className="btn-secondary px-3 py-2 text-sm"
          >
            Use Admin Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("member@test.com");
              setPassword("123456");
            }}
            className="btn-secondary px-3 py-2 text-sm"
          >
            Use Member Demo
          </button>
        </div>

        <p className="mt-4 text-xs text-[var(--text-muted)]">
          Admin: <span className="font-medium">admin@test.com / 123456</span> | Member: <span className="font-medium">member@test.com / 123456</span>
        </p>
        {status ? (
          <p className={`mt-3 rounded-lg border p-2 text-sm ${status.toLowerCase().includes("invalid") ? "border-[var(--danger)] text-[var(--danger)]" : "border-[var(--warning)] text-[var(--warning)]"}`}>
            {status}
          </p>
        ) : null}
        <div className="mt-5 flex justify-between text-sm">
          <Link href="/auth/forgot-password" className="text-[var(--text-muted)] hover:text-[var(--text)]">
            Forgot password?
          </Link>
          <Link href="/auth/signup" className="text-[var(--primary-strong)] hover:underline">
            Create account
          </Link>
        </div>
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          New signups require admin approval in the Members page.
        </p>
      </section>
      <div className="md:col-span-2">
        <p className="px-1 text-center text-xs text-[var(--text-muted)]">Built for showcasing cloud observability, governance, and security workflows.</p>
      </div>
    </main>
  );
}
