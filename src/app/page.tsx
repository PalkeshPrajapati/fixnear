import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { CategorySearch } from "@/components/CategorySearch";

export const metadata: Metadata = {
  title: "Find Trusted Local Service Providers Near You",
};

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="section"
        style={{
          background:
            "linear-gradient(135deg, #eff6ff 0%, #f8fafc 60%, #f0fdf4 100%)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div className="container flex flex-col items-center text-center gap-6">
          {/* Badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: "#dbeafe",
              color: "var(--brand-primary)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--brand-primary)" }}
            />
            Local services, right at your doorstep
          </span>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            Find Trusted{" "}
            <span style={{ color: "var(--brand-primary)" }}>
              Local Service Providers
            </span>{" "}
            Near You
          </h1>

          {/* Subtext */}
          <p
            className="text-base sm:text-lg max-w-xl leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            From plumbing to painting, discover verified professionals in your
            neighbourhood — quickly, easily, and affordably.
          </p>

          {/* Search bar + category list — client component */}
          <CategorySearch categories={categories} />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="section"
        style={{ backgroundColor: "var(--bg-muted)" }}
      >
        <div className="container flex flex-col gap-8">
          <div className="flex flex-col gap-1 text-center">
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              How FixNear Works
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Get the help you need in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Pick a Category",
                description:
                  "Browse from our list of service categories to find exactly what you need.",
              },
              {
                step: "02",
                title: "Compare Providers",
                description:
                  "View profiles, ratings, and reviews of verified local professionals.",
              },
              {
                step: "03",
                title: "Book & Relax",
                description:
                  "Connect directly with your chosen provider and get the job done.",
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="card flex flex-col gap-3 p-6">
                <span
                  className="text-3xl font-extrabold"
                  style={{ color: "#dbeafe" }}
                >
                  {step}
                </span>
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}