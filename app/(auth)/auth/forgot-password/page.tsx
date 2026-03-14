export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Reset Password</h1>
      <input className="w-full rounded-md border border-[var(--border)] bg-transparent p-3" placeholder="Email" />
      <button className="w-full rounded-md bg-cyan-500 p-3 font-medium text-slate-900">Send Reset Link</button>
    </main>
  );
}
