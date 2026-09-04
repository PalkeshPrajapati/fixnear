import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { ReviewForm } from "@/components/providers/ReviewForm";
import { BookingForm } from "@/components/providers/BookingForm";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProviderPageProps {
  params: Promise<{ id: string }>;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const { id } = await params;
  const provider = await prisma.provider.findUnique({
    where: { id },
    select: { user: { select: { name: true } } },
  });
  if (!provider) return { title: "Provider not found" };
  return {
    title: `${provider.user.name} — Provider`,
    description: `View the profile and reviews for ${provider.user.name} on FixNear.`,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StarRating({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const fontSize = size === "lg" ? "1.4rem" : size === "sm" ? "0.8rem" : "1rem";
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ color: i <= rating ? "#f59e0b" : "var(--border-medium)", fontSize, lineHeight: 1 }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold select-none flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--brand-primary)",
        fontSize: size * 0.35,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex flex-col items-center gap-1 p-4 rounded-xl"
      style={{ backgroundColor: "var(--bg-muted)" }}
    >
      <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { id } = await params;

  // ── Fetch provider + session in parallel ──────────────────────────────
  const [provider, session] = await Promise.all([
    prisma.provider.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, createdAt: true, image: true } },
        categories: { orderBy: { name: "asc" } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!provider) notFound();

  // ── Derived stats ─────────────────────────────────────────────────────
  const reviewCount = provider.reviews.length;
  const avgRating =
    reviewCount > 0
      ? provider.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  // ── Per-user state for the review form ────────────────────────────────
  const currentUserId = session?.user?.id ?? null;
  const isGuest = !currentUserId;
  // Check if current user already reviewed this provider
  const alreadyReviewed = !isGuest
    ? provider.reviews.some((r) => r.user.id === currentUserId)
    : false;

  const memberSince = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(provider.user.createdAt);

  return (
    <>
      {/* ── Hero / Profile header ───────────────────────────────────── */}
      <section
        id="provider-header"
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 70%)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="container py-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <Avatar name={provider.user.name} size={80} />

            {/* Name + meta */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {provider.user.name}
                </h1>

                {/* Verified badge */}
                {provider.isVerified && (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                  >
                    Verified
                  </span>
                )}
                {!provider.isVerified && (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#fef3c7", color: "#b45309" }}
                  >
                    Unverified
                  </span>
                )}
              </div>

              {/* Category chips */}
              {provider.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {provider.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
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
              )}

              {/* Rating row */}
              {avgRating !== null && (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(avgRating)} size="sm" />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                  </span>
                </div>
              )}

              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Member since {memberSince}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ────────────────────────────────────────────── */}
      <section id="provider-main" className="section">
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left column: Details ──────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Reviews"
                value={reviewCount}
              />
              <StatCard
                label="Avg rating"
                value={avgRating !== null ? avgRating.toFixed(1) : "—"}
              />
              <StatCard
                label="Yrs exp."
                value={provider.experience ?? "—"}
              />
            </div>

            {/* About card */}
            <div id="provider-about" className="card p-6 flex flex-col gap-5">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                About
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <span style={{ color: "var(--text-muted)", marginTop: 2 }} aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      Location
                    </p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {provider.location}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <span style={{ color: "var(--text-muted)", marginTop: 2 }} aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      Phone
                    </p>
                    <a
                      href={`tel:${provider.phone}`}
                      className="text-sm font-medium no-underline"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {provider.phone}
                    </a>
                  </div>
                </div>

                {/* Experience */}
                {provider.experience !== null && (
                  <div className="flex items-start gap-3">
                    <span style={{ color: "var(--text-muted)", marginTop: 2 }} aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                        Experience
                      </p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {provider.experience} year{provider.experience !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="flex items-start gap-3">
                  <span style={{ color: "var(--text-muted)", marginTop: 2 }} aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      Email
                    </p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {provider.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {provider.bio && (
                <>
                  <hr style={{ borderColor: "var(--border-light)" }} />
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      Bio
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {provider.bio}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* ── Reviews list ───────────────────────────────────── */}
            <div id="provider-reviews" className="flex flex-col gap-4">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Reviews
                {reviewCount > 0 && (
                  <span
                    className="ml-2 text-sm font-normal"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ({reviewCount})
                  </span>
                )}
              </h2>

              {reviewCount > 0 ? (
                <ul className="flex flex-col gap-4" role="list">
                  {provider.reviews.map((review) => {
                    const date = new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(review.createdAt);

                    return (
                      <li key={review.id} role="listitem" className="card p-5 flex gap-4">
                        {/* Reviewer avatar */}
                        <Avatar name={review.user.name} size={40} />

                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {review.user.name}
                            </p>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {date}
                            </span>
                          </div>

                          <StarRating rating={review.rating} size="sm" />

                          {review.comment && (
                            <p
                              className="text-sm leading-relaxed mt-1"
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
                <div
                  className="py-10 flex flex-col items-center gap-2 rounded-xl text-center"
                  style={{ border: "1px dashed var(--border-medium)" }}
                >
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    No reviews yet
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Be the first to review this provider
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column: Book & Review ─────────────────────── */}
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-20">
            {/* Booking Card */}
            <div id="request-booking" className="card p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h2
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Book Service
                </h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Schedule an appointment with {provider.user.name.split(" ")[0]}
                </p>
              </div>

              <hr style={{ borderColor: "var(--border-light)" }} />

              <BookingForm
                providerId={provider.id}
                providerName={provider.user.name}
                isGuest={isGuest}
                isSelf={provider.userId === currentUserId}
              />
            </div>

            {/* Write a review card */}
            <div id="write-review" className="card p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h2
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Write a Review
                </h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Share your experience with {provider.user.name.split(" ")[0]}
                </p>
              </div>

              <hr style={{ borderColor: "var(--border-light)" }} />

              <ReviewForm
                providerId={provider.id}
                alreadyReviewed={alreadyReviewed}
                isGuest={isGuest}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}