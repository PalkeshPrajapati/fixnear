"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/app/providers/[id]/actions";
import type { ReviewActionResult } from "@/app/providers/[id]/actions";

interface ReviewFormProps {
  providerId: string;
  /** true if the current session user has already reviewed this provider */
  alreadyReviewed: boolean;
  /** true if there is no session (user not logged in) */
  isGuest: boolean;
}

const initialState: ReviewActionResult = { success: false };

const inputBase =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2";
const inputStyle = {
  borderColor: "var(--border-medium)",
  color: "var(--text-primary)",
  backgroundColor: "var(--bg-card)",
};

/** Interactive star picker — clicking a star sets the rating. */
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none"
          style={{ color: n <= active ? "#f59e0b" : "var(--border-medium)" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ providerId, alreadyReviewed, isGuest }: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(0);

  /* ── Guest prompt ──────────────────────────────────────────────────── */
  if (isGuest) {
    return (
      <div
        className="rounded-xl px-5 py-6 text-center flex flex-col gap-2"
        style={{ backgroundColor: "var(--bg-muted)", border: "1px dashed var(--border-medium)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Sign in to leave a review
        </p>
        <a href="/auth/sign-in" className="btn btn-primary mx-auto" id="review-signin-link">
          Sign In
        </a>
      </div>
    );
  }

  /* ── Already reviewed ──────────────────────────────────────────────── */
  if (alreadyReviewed || state.success) {
    return (
      <div
        className="rounded-xl px-5 py-6 text-center"
        style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#15803d" }}>
          {state.success ? "Thank you! Your review has been posted." : "You have already reviewed this provider."}
        </p>
      </div>
    );
  }

  /* ── Review form ───────────────────────────────────────────────────── */
  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Hidden provider id */}
      <input type="hidden" name="providerId" value={providerId} />
      {/* Hidden rating value so FormData carries it */}
      <input type="hidden" name="rating" value={rating} />

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

      {/* Star picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Your Rating <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <StarPicker value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="review-comment"
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Comment{" "}
          <span className="font-normal" style={{ color: "var(--text-muted)" }}>
            (optional)
          </span>
        </label>
        <textarea
          id="review-comment"
          name="comment"
          rows={3}
          placeholder="Share your experience with this provider…"
          className={`${inputBase} resize-none`}
          style={inputStyle}
        />
      </div>

      {/* Submit */}
      <button
        id="review-submit-btn"
        type="submit"
        disabled={isPending || rating === 0}
        className="btn btn-primary w-full"
        style={{
          opacity: isPending || rating === 0 ? 0.6 : 1,
          cursor: isPending || rating === 0 ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? "Posting…" : "Post Review"}
      </button>
    </form>
  );
}
