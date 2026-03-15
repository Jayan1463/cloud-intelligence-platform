export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-8">
      <section className="surface w-full p-6">
        <h1 className="text-2xl font-semibold">Reset Password</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">This demo route sends a simulated reset action.</p>
        <input className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--card-soft)] p-3" placeholder="Email" />
        <button className="btn-primary mt-3 w-full p-3 text-sm font-semibold">Send Reset Link</button>
      </section>
    </main>
  );
}
