"use client";

import Link from "next/link";
import { useState } from "react";

export default function SaaSSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      body: JSON.stringify({ name, email, password })
    });
    const payload = await response.json();
    setStatus(payload.message ?? payload.error ?? "Request failed");
    setLoading(false);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-8 md:px-8">
      <section className="surface w-full animate-rise p-6 md:p-8">
        <h1 className="text-3xl font-semibold">Request Member Access</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Submit your account details and an admin can approve you from Organization Members.
        </p>
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
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={onCreateAccount} disabled={loading} className="btn-primary w-full p-3 text-sm font-semibold disabled:opacity-60">
            {loading ? "Submitting..." : "Submit Request"}
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
