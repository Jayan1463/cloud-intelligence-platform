import Link from "next/link";

export default function SaaSSignupPage() {
  return (
    <main className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Sign Up</h1>
      <input className="w-full rounded-md border border-[var(--border)] bg-transparent p-3" placeholder="Name" />
      <input className="w-full rounded-md border border-[var(--border)] bg-transparent p-3" placeholder="Email" />
      <input className="w-full rounded-md border border-[var(--border)] bg-transparent p-3" placeholder="Password" type="password" />
      <button className="w-full rounded-md bg-cyan-500 p-3 font-medium text-slate-900">Create Account</button>
      <p className="text-sm">Already have an account? <Link href="/auth/login">Login</Link></p>
    </main>
  );
}
