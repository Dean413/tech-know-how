"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  // async function handleSubmit(e: React.FormEvent) {
  //   e.preventDefault();
  //   setError(null);
  //   setLoading(true);

  //   const { data, error: signUpError } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: { data: { full_name: fullName } }
  //   });

  //   setLoading(false);

  //   if (signUpError) {
  //     setError(signUpError.message);
  //     return;
  //   }

  //   if (data.session) {
  //     router.push("/dashboard");
  //     router.refresh();
  //   } else {
  //     setCheckEmail(true);
  //   }
  // }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      toast.success("sign up successful")
      router.push("/login");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: brand panel */}
      <section className="relative hidden overflow-hidden bg-navy-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-hero-grid opacity-20" style={{ backgroundSize: "18px 18px" }} />
        <p className="relative font-display text-lg font-semibold text-white">
          Ashirov Tech Know-How
        </p>
        <div className="relative">
          <p className="eyebrow text-brand-200">Enrollment</p>
          <h1 className="mt-3 max-w-md font-display text-4xl font-semibold leading-tight text-white">
            Learn the skills you need to build with technology.
          </h1>

          <p className="mt-4 max-w-sm text-navy-200">
            A guided learning experience combining theory, hands-on practice, projects, and evaluations
            to help you develop valuable technical skills.
          </p>
        </div>
        <p className="relative text-xs text-navy-300">© 2026 Ashirov Tech Know-How</p>
      </section>

      {/* Right: form */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-navy-800">Create your account</h2>
          <p className="mt-1 text-sm text-navy-500">
            Already registered?{" "}
            <Link href="/login" className="font-medium text-brand hover:underline">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label" htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                className="input"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Amina Yusuf"
              />
            </div>
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
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>

                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

        </div>
      </section>
    </main>
  );
}
