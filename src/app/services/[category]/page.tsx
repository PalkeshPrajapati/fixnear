import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// ─── Slug → Category name lookup ─────────────────────────────────────────────

/**
 * The slug is built by CategoryCard as:
 *   name.toLowerCase().replace(/\s+/g, "-")
 * We reverse it here by comparing every category's slug against the param.
 */
async function findCategoryBySlug(slug: string) {
  const all = await prisma.category.findMany({ select: { id: true, name: true } });
  return all.find((c) => c.name.toLowerCase().replace(/\s+/g, "-") === slug) ?? null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = await findCategoryBySlug(slug);
  if (!cat) return { title: "Category not found" };
  return {
    title: `${cat.name} Providers`,
    description: `Find trusted ${cat.name} service providers near you on FixNear.`,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            style={{
              color: i <= rounded ? "#f59e0b" : "var(--border-medium)",
              fontSize: "0.85rem",
              lineHeight: 1,
            }}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        {rating.toFixed(1)}
      </span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        ({count})
      </span>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 select-none"
      style={{ backgroundColor: "var(--brand-primary)" }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;

  // 1. Resolve slug → category row
  const category = await findCategoryBySlug(slug);
  if (!category) notFound();

  // 2. Fetch providers for this category (with reviews for rating calc)
  const providers = await prisma.provider.findMany({
    where: {
      categories: { some: { id: category.id } },
    },
    include: {
      user: { select: { name: true } },
      categories: { select: { name: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { isVerified: "desc" }, // verified providers first
  });

  // 3. Derive per-provider stats
  const enriched = providers.map((p) => {
    const count = p.reviews.length;
    const avg = count > 0
      ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / count
      : null;
    return { ...p, reviewCount: count, avgRating: avg };
  });

  return (
    <>
      {/* ── Page header ───────────────────────────────────────────────── */}
      <section
        id="category-header"
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 70%)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="container py-8 flex flex-col gap-2">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <Link href="/" className="no-underline hover:underline" style={{ color: "var(--text-muted)" }}>
              Home
            </Link>
            <span aria-hidden="true">›</span>
            <span style={{ color: "var(--text-secondary)" }}>{category.name}</span>
          </nav>

          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {category.name} Providers
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {enriched.length > 0
              ? `${enriched.length} provider${enriched.length !== 1 ? "s" : ""} available near you`
              : "No providers found in this category yet"}
          </p>
        </div>
      </section>

      {/* ── Providers list ────────────────────────────────────────────── */}
      <section id="providers-list" className="section">
        <div className="container">
          {enriched.length === 0 ? (
            /* Empty state */
            <div
              className="py-20 flex flex-col items-center gap-3 rounded-xl text-center"
              style={{ border: "1px dashed var(--border-medium)" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-muted)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7"
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  No {category.name} providers yet
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Check back soon — providers are joining every day
                </p>
              </div>
              <Link href="/" className="btn btn-outline mt-2">
                Browse other categories
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4" role="list">
              {enriched.map((provider) => (
                <li key={provider.id} role="listitem">
                  {/*
                    No outer <Link> here — that would nest <a> inside <a> (invalid HTML)
                    and require an onClick handler (forbidden in Server Components).
                    Instead: name + "View profile" are separate Links; phone is a tel: anchor.
                  */}
                  <div
                    id={`provider-card-${provider.id}`}
                    className="card flex flex-col sm:flex-row gap-4 sm:items-center p-5"
                  >
                    {/* Avatar — links to profile */}
                    <Link
                      href={`/providers/${provider.id}`}
                      className="no-underline flex-shrink-0"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <Avatar name={provider.user.name} />
                    </Link>

                    {/* Main info — grows to fill */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      {/* Name row — name itself is the profile link */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/providers/${provider.id}`}
                          className="no-underline hover:underline"
                          aria-label={`View ${provider.user.name}'s profile`}
                        >
                          <h2
                            className="text-base font-bold leading-tight"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            {provider.user.name}
                          </h2>
                        </Link>
                        {provider.isVerified && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
                          >
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Location + experience row */}
                      <div
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {/* Location */}
                        <span className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {provider.location}
                        </span>

                        {/* Experience */}
                        {provider.experience !== null && (
                          <span className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3.5 h-3.5 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {provider.experience} yr{provider.experience !== 1 ? "s" : ""} exp.
                          </span>
                        )}

                        {/* Other categories they serve */}
                        {provider.categories.filter((c) => c.name !== category.name).length > 0 && (
                          <span className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3.5 h-3.5 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                              />
                            </svg>
                            Also:{" "}
                            {provider.categories
                              .filter((c) => c.name !== category.name)
                              .map((c) => c.name)
                              .join(", ")}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {provider.avgRating !== null ? (
                        <StarRating rating={provider.avgRating} count={provider.reviewCount} />
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          No reviews yet
                        </span>
                      )}
                    </div>

                    {/* Right column: phone + view-profile link */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                      {/* Phone — plain tel: anchor, no event handler needed */}
                      <a
                        href={`tel:${provider.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm no-underline transition-colors"
                        style={{
                          backgroundColor: "#eff6ff",
                          color: "var(--brand-primary)",
                          border: "1px solid #bfdbfe",
                        }}
                        aria-label={`Call ${provider.user.name} at ${provider.phone}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3.5 h-3.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        {provider.phone}
                      </a>

                      {/* View profile — real Link, no span trick */}
                      <Link
                        href={`/providers/${provider.id}`}
                        className="text-xs font-semibold flex items-center gap-1 no-underline"
                        style={{ color: "var(--text-muted)" }}
                      >
                        View profile
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}