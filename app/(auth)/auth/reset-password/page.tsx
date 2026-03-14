export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Set New Password</h1>
      <input className="w-full rounded-md border border-[var(--border)] bg-transparent p-3" placeholder="New password" type="password" />
      <button className="w-full rounded-md bg-cyan-500 p-3 font-medium text-slate-900">Update Password</button>
    </main>
  );
}
