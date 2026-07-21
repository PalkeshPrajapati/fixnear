import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BecomeProviderForm } from "@/components/dashboard/BecomeProviderForm";

export const metadata: Metadata = { title: "Dashboard" };

// ─── Helpers ────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color: i <= rating ? "#f59e0b" : "var(--border-medium)",
            fontSize: "1rem",
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    PROVIDER: { bg: "#dcfce7", text: "#15803d" },
    ADMIN: { bg: "#fef3c7", text: "#b45309" },
    USER: { bg: "#eff6ff", text: "var(--brand-primary)" },
  };
  const s = styles[role] ?? styles.USER;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {role}
    </span>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  // ── Auth guard (server-side) ──────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");

  // ── Parallel data fetch ───────────────────────────────────────────────
  const [dbUser, userReviews, providerProfile, allCategories] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        role: true,
        image: true,
      },
    }),
    prisma.review.findMany({
      where: { userId: session.user.id },
      include: {
        provider: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.provider.findUnique({
      where: { userId: session.user.id },
      include: { categories: true, reviews: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!dbUser) redirect("/auth/sign-in");

  // ── Derived stats ─────────────────────────────────────────────────────
  const providerAvgRating =
    providerProfile && providerProfile.reviews.length > 0
      ? providerProfile.reviews.reduce((sum, r) => sum + r.rating, 0) /
        providerProfile.reviews.length
      : null;

  const initials = dbUser.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberSince = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(dbUser.createdAt);

  return (
    <>
      {/* ── Page header ──────────────────────────────────────────────── */}
      <section
        id="dashboard-header"
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 70%)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="container py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Welcome back, {dbUser.name.split(" ")[0]}!
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Your FixNear dashboard overview
            </p>
          </div>
          <RoleBadge role={dbUser.role} />
        </div>
      </section>

      {/* ── Main grid: user details + provider section ───────────────── */}
      <section id="dashboard-main" className="section">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* ── User Details Card (left col) ──────────────────────── */}
          <div id="user-details-card" className="card p-6 flex flex-col gap-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: "var(--brand-primary)" }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <p
                  className="font-semibold text-base leading-tight truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {dbUser.name}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {dbUser.email}
                </p>
              </div>
            </div>

            <hr style={{ borderColor: "var(--border-light)" }} />

            {/* Details */}
            <div className="flex flex-col gap-4">
              <InfoRow label="Member since" value={memberSince} />
              <InfoRow label="Account role" value={<RoleBadge role={dbUser.role} />} />
              <InfoRow
                label="Email verified"
                value={
                  dbUser.emailVerified ? (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                    >
                      Verified
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
                    >
                      Not verified
                    </span>
                  )
                }
              />
              <InfoRow
                label="Reviews given"
                value={`${userReviews.length} review${userReviews.length !== 1 ? "s" : ""}`}
              />
              {providerProfile && (
                <InfoRow
                  label="Reviews received"
                  value={`${providerProfile.reviews.length} review${providerProfile.reviews.length !== 1 ? "s" : ""}`}
                />
              )}
            </div>
          </div>

          {/* ── Provider Section (right 2 cols) ───────────────────── */}
          <div className="md:col-span-2">
            {providerProfile ? (
              /* ── Provider profile card ──────────────────────── */
              <div id="provider-profile-card" className="card p-6 flex flex-col gap-6">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h2
                      className="text-lg font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Provider Profile
                    </h2>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Your public service provider details
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                    style={
                      providerProfile.isVerified
                        ? { backgroundColor: "#dcfce7", color: "#15803d" }
                        : { backgroundColor: "#fef3c7", color: "#b45309" }
                    }
                  >
                    {providerProfile.isVerified ? "Verified" : "Pending verification"}
                  </span>
                </div>

                {/* Stats row */}
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-lg"
                  style={{ backgroundColor: "var(--bg-muted)" }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {providerProfile.reviews.length}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Total reviews
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {providerAvgRating !== null
                        ? providerAvgRating.toFixed(1)
                        : "—"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Avg. rating
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {providerProfile.experience ?? "—"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Yrs experience
                    </p>
                  </div>
                </div>

                <hr style={{ borderColor: "var(--border-light)" }} />

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InfoRow label="Phone" value={providerProfile.phone} />
                  <InfoRow label="Location" value={providerProfile.location} />
                  {providerProfile.bio && (
                    <div className="sm:col-span-2 flex flex-col gap-0.5">
                      <span
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Bio
                      </span>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {providerProfile.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {providerProfile.categories.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <span
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Service categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {providerProfile.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: "#eff6ff",
                            color: "var(--brand-primary)",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Become a provider form ─────────────────────── */
              <BecomeProviderForm categories={allCategories} />
            )}
          </div>
        </div>
      </section>

      {/* ── Reviews I've given ───────────────────────────────────────── */}
      <section
        id="my-reviews"
        className="section"
        style={{ backgroundColor: "var(--bg-muted)" }}
      >
        <div className="container flex flex-col gap-6">
          {/* Section heading */}
          <div className="flex flex-col gap-1">
            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Reviews I&apos;ve Given
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {userReviews.length > 0
                ? `You have reviewed ${userReviews.length} provider${userReviews.length !== 1 ? "s" : ""}`
                : "Reviews you leave for providers will appear here"}
            </p>
          </div>

          {userReviews.length > 0 ? (
            <ul className="flex flex-col gap-4" role="list">
              {userReviews.map((review) => {
                const date = new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(review.createdAt);

                const providerInitial =
                  review.provider.user.name?.[0]?.toUpperCase() ?? "P";

                return (
                  <li
                    key={review.id}
                    role="listitem"
                    className="card p-5 flex flex-col sm:flex-row gap-4"
                  >
                    {/* Provider avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: "#64748b" }}
                      aria-hidden="true"
                    >
                      {providerInitial}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {review.provider.user.name}
                        </p>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {date}
                        </span>
                      </div>

                      <StarRating rating={review.rating} />

                      {review.comment && (
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* Empty state */
            <div
              className="py-16 flex flex-col items-center gap-3 rounded-xl text-center"
              style={{ border: "1px dashed var(--border-medium)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  style={{ color: "var(--text-muted)" }}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No reviews yet
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Book a service provider and leave your first review
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}