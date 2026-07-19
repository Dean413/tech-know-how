"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/reset-password`
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sky p-6">
      <div className="card w-full max-w-sm">
        <p className="eyebrow">Ashirov Tech Know-How</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          Enter the email on your account and we'll send a reset link.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-teal/30 bg-teal/5 p-4 text-sm text-navy-700">
            If an account exists for <span className="font-medium">{email}</span>, a reset link
            is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-6 block text-center text-sm font-medium text-brand hover:underline">
          Back to log in
        </Link>
      </div>
    </main>
  );
}
