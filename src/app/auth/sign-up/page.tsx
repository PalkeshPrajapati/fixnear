"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-500";
const inputStyle = {
  borderColor: "var(--border-medium)",
  color: "var(--text-primary)",
  backgroundColor: "var(--bg-card)",
};

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    await authClient.signUp.email(
      {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          setLoading(false);
          // No alert() — redirect to the verification pending screen instead
          router.push("/auth/sign-in?verified=pending");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setLoading(false);
        },
      }
    );
  }

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
            Create an account
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Join FixNear to find or offer local services
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
          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-name"
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Full Name
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              autoComplete="name"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-email"
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Email
            </label>
            <input
              id="signup-email"
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
              htmlFor="signup-password"
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Submit */}
          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-1"
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            id="go-to-signin"
            className="font-semibold no-underline hover:underline"
            style={{ color: "var(--brand-primary)" }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}