"use client";

import { useActionState } from "react";
import { becomeProvider } from "@/app/dashboard/actions";
import type { ActionResult } from "@/app/dashboard/actions";

interface Category {
  id: string;
  name: string;
}

const initialState: ActionResult = { success: false };

const inputClass =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2";
const inputStyle = {
  borderColor: "var(--border-medium)",
  color: "var(--text-primary)",
  backgroundColor: "var(--bg-card)",
};

export function BecomeProviderForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(becomeProvider, initialState);

  return (
    <div
      className="card flex flex-col gap-6 p-6 h-full"
    >
      {/* Section header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            P
          </span>
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Become a Provider
          </h2>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Register as a service professional and start receiving booking
          requests from customers near you.
        </p>
      </div>

      {/* Error banner */}
      {state.error && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
          role="alert"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="provider-phone"
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Phone Number <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            id="provider-phone"
            name="phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            required
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="provider-location"
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Location / Service Area <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            id="provider-location"
            name="location"
            type="text"
            placeholder="e.g. Koramangala, Bengaluru"
            required
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {/* Experience */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="provider-experience"
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Years of Experience{" "}
            <span className="font-normal" style={{ color: "var(--text-muted)" }}>
              (optional)
            </span>
          </label>
          <input
            id="provider-experience"
            name="experience"
            type="number"
            min="0"
            max="60"
            placeholder="e.g. 5"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="provider-bio"
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Bio{" "}
            <span className="font-normal" style={{ color: "var(--text-muted)" }}>
              (optional)
            </span>
          </label>
          <textarea
            id="provider-bio"
            name="bio"
            rows={3}
            placeholder="Briefly describe your skills, experience, and what makes you stand out…"
            className={`${inputClass} resize-none`}
            style={inputStyle}
          />
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-2.5">
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Service Categories <span style={{ color: "#dc2626" }}>*</span>
            <span
              className="ml-1.5 font-normal"
              style={{ color: "var(--text-muted)" }}
            >
              — select at least one
            </span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors"
                style={{
                  border: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-muted)",
                }}
              >
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={cat.id}
                  className="rounded flex-shrink-0 accent-blue-600 w-4 h-4"
                />
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="become-provider-submit"
          disabled={isPending}
          className="btn btn-primary w-full mt-1"
          style={{ opacity: isPending ? 0.7 : 1, cursor: isPending ? "not-allowed" : "pointer" }}
        >
          {isPending ? "Submitting…" : "Register as Provider"}
        </button>
      </form>
    </div>
  );
}
