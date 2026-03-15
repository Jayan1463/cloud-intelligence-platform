export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-8">
      <section className="surface w-full p-6">
        <h1 className="text-2xl font-semibold">Set New Password</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Use a strong password with numbers and symbols.</p>
        <input className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3" placeholder="New password" type="password" />
        <button className="btn-primary mt-3 w-full p-3 text-sm font-semibold">Update Password</button>
      </section>
    </main>
  );
}
