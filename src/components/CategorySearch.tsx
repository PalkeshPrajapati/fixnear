"use client";

import { useState, useMemo } from "react";
import { CategoryCard } from "@/components/CategoryCard";

interface Category {
  id: string;
  name: string;
}

interface CategorySearchProps {
  categories: Category[];
}

/**
 * Client component: owns search query state and filters the category list.
 * The parent server component fetches categories and passes them as props.
 */
export function CategorySearch({ categories }: CategorySearchProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, categories]);

  return (
    <>
      {/* ── Search bar ───────────────────────────────────────────── */}
      <div
        id="hero-search"
        className="w-full max-w-xl flex items-center gap-2 p-2 rounded-xl"
        style={{
          backgroundColor: "var(--bg-card)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border-light)",
        }}
      >
        {/* Search icon */}
        <span
          className="pl-2 flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </span>

        <input
          id="hero-search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a service (e.g. Electrician)…"
          aria-label="Search for a service"
          className="flex-1 bg-transparent outline-none text-sm py-1 px-1"
          style={{ color: "var(--text-primary)" }}
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="btn btn-ghost px-2 py-1 text-xs"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Quick hints ──────────────────────────────────────────── */}
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Popular:{" "}
        {["Electrician", "Plumber", "AC Repair"].map((s, i) => (
          <span key={s}>
            <button
              type="button"
              className="font-medium hover:underline bg-transparent border-none cursor-pointer p-0"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setQuery(s)}
            >
              {s}
            </button>
            {i < 2 && (
              <span style={{ color: "var(--border-medium)" }}> · </span>
            )}
          </span>
        ))}
      </p>

      {/* ── Category list (filtered) ─────────────────────────────── */}
      <section id="categories" className="section w-full">
        <div className="container flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Browse by Category
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {query
                ? `Showing ${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"`
                : "Choose a service category to find providers near you"}
            </p>
          </div>

          {filtered.length > 0 ? (
            <ul
              id="categories-list"
              className="flex flex-col gap-2"
              role="list"
            >
              {filtered.map((category) => (
                <li key={category.id} role="listitem">
                  <CategoryCard id={category.id} name={category.name} />
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="py-12 text-center rounded-lg"
              style={{ border: "1px dashed var(--border-medium)" }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                No categories found for &ldquo;{query}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="btn btn-outline mt-3 text-xs"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
