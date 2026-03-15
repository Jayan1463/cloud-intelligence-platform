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
    <main className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Sign Up</h1>
      <input
        className="w-full rounded-md border border-[var(--border)] bg-transparent p-3"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
      <button onClick={onCreateAccount} disabled={loading} className="w-full rounded-md bg-cyan-500 p-3 font-medium text-slate-900 disabled:opacity-60">
        {loading ? "Submitting..." : "Create Account"}
      </button>
      {status ? <p className="text-sm text-[var(--text-muted)]">{status}</p> : null}
      <p className="text-sm">Already have an account? <Link href="/auth/login">Login</Link></p>
    </main>
  );
}
