import Link from "next/link";

interface CategoryCardProps {
  id: string;
  name: string;
}

/**
 * Displays a single service category as a plain text list row.
 * No icons — just the name and a right-arrow indicator.
 * Links to /services/[slug].
 */
export function CategoryCard({ id, name }: CategoryCardProps) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link
      href={`/services/${slug}`}
      id={`category-card-${id}`}
      className="no-underline"
      aria-label={`Browse ${name} providers`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors"
        style={{
          border: "1px solid var(--border-light)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {name}
        </span>

        {/* Chevron arrow */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: "var(--text-muted)" }}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
