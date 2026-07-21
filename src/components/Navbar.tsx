"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const router = useRouter();


  const { data: session, isPending } = authClient.useSession();


  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in");
          router.refresh();
        },
      },
    });
  };

  return (
    <header
      id="site-navbar"
      style={{
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <nav className="container flex items-center justify-between h-16">
        {/* Brand */}
        <Link
          href="/"
          id="navbar-brand"
          className="flex items-center gap-2 no-underline"
          aria-label="FixNear home"
        >
          {/* Logo mark */}
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            F
          </span>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Fix<span style={{ color: "var(--brand-primary)" }}>Near</span>
          </span>
        </Link>

        {/* Dynamic Actions based on Auth State */}
        <div className="flex items-center gap-2">
          {isPending ? (
            // Optional: Render a lightweight loading state/skeleton to avoid layout shifting
            <span className="text-sm opacity-50">Loading...</span>
          ) : session ? (
            // Rendered when USER IS LOGGED IN
            <>
              <Link
                href="/dashboard"
                id="navbar-dashboard"
                className="btn btn-ghost text-sm"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                id="navbar-logout"
                className="btn btn-primary text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            // Rendered when USER IS NOT LOGGED IN
            <>
              <Link
                href="/auth/sign-in"
                id="navbar-login"
                className="btn btn-ghost text-sm"
              >
                Login
              </Link>
              <Link
                href="/auth/sign-up"
                id="navbar-register"
                className="btn btn-primary text-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
