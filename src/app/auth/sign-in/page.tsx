"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";

const inputClass =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-500";
const inputStyle = {
  borderColor: "var(--border-medium)",
  color: "var(--text-primary)",
  backgroundColor: "var(--bg-card)",
};

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    await authClient.signIn.email(
      {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => setLoading(false),
        onError: (ctx) => {
          setError(ctx.error.message);
          setLoading(false);
        },
      }
    );
  }

  /* ── Email verification pending screen ──────────────────────────────── */
  if (searchParams.get("verified") === "pending") {
    return (
      <div className="section flex items-center justify-center">
        <div
          className="card flex flex-col items-center gap-4 p-8 text-center w-full max-w-sm"
        >
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#eff6ff" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              style={{ color: "var(--brand-primary)" }}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Check your email
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              We&apos;ve sent a verification link to your email address. Click
              the link to activate your account, then sign in below.
            </p>
          </div>

          <Link
            href="/auth/sign-in"
            className="btn btn-primary w-full"
            id="go-to-signin"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  /* ── Sign In form ────────────────────────────────────────────────────── */
  return (
    <div
      className="flex flex-1 items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 70%)",
      }}
    >
      <div className="card w-full max-w-sm p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-1 text-center">
          {/* Brand mark */}
          <Link href="/" className="no-underline mb-2" aria-label="FixNear home">
            <span
              className="inline-flex items-center gap-1.5 text-xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Fix<span style={{ color: "var(--brand-primary)" }}>Near</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="rounded-lg px-4 py-3 text-sm font-medium"
            style={{
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signin-email"
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Email
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signin-password"
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Password
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Submit */}
          <button
            id="signin-submit"
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-1"
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            id="go-to-signup"
            className="font-semibold no-underline hover:underline"
            style={{ color: "var(--brand-primary)" }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}