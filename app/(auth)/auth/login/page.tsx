import Link from "next/link";

export default function SaaSLoginPage() {
  return (
    <main className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Login</h1>
      <input className="w-full rounded-md border border-[var(--border)] bg-transparent p-3" placeholder="Email" />
      <input className="w-full rounded-md border border-[var(--border)] bg-transparent p-3" placeholder="Password" type="password" />
      <button className="w-full rounded-md bg-cyan-500 p-3 font-medium text-slate-900">Sign In</button>
      <div className="flex justify-between text-sm">
        <Link href="/auth/forgot-password">Forgot password?</Link>
        <Link href="/auth/signup">Create account</Link>
      </div>
    </main>
  );
}
