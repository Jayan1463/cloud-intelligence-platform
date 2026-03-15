"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SaaSSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  function onCreateAccount() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setStatus("Please fill all fields.");
      return;
    }

    setStatus("Self-signup is disabled. Please login with admin@test.com / 123456.");
    router.push("/auth/login");
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
      <button onClick={onCreateAccount} className="w-full rounded-md bg-cyan-500 p-3 font-medium text-slate-900">
        Create Account
      </button>
      {status ? <p className="text-sm text-[var(--text-muted)]">{status}</p> : null}
      <p className="text-sm">Already have an account? <Link href="/auth/login">Login</Link></p>
    </main>
  );
}
