"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SaaSSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("acme-observability");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onCreateAccount() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setStatus("Please fill all fields.");
      return;
    }

    setLoading(true);
    setStatus("");
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, organization })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus(payload.error ?? "Signup failed");
      setLoading(false);
      return;
    }

    router.push("/workspace/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-8 md:px-8">
      <section className="surface w-full animate-rise p-6 md:p-8">
        <h1 className="text-3xl font-semibold">Create Account</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Create your admin account and enter the workspace.</p>
        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3"
            placeholder="Organization Slug"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3"
            placeholder="Password (min 8 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={onCreateAccount} disabled={loading} className="btn-primary w-full p-3 text-sm font-semibold disabled:opacity-60">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
        {status ? <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card-soft)] p-3 text-sm">{status}</p> : null}
        <p className="mt-5 text-sm text-[var(--text-muted)]">
          Already have an account? <Link href="/auth/login" className="text-[var(--primary-strong)] hover:underline">Login</Link>
        </p>
      </section>
    </main>
  );
}
