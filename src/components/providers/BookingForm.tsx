"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createBooking } from "@/app/actions/booking";
import type { BookingActionResult } from "@/app/actions/booking";

interface BookingFormProps {
  providerId: string;
  providerName: string;
  isGuest: boolean;
  isSelf: boolean;
}

const initialState: BookingActionResult = { success: false };

const inputBase =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2";
const inputStyle = {
  borderColor: "var(--border-medium)",
  color: "var(--text-primary)",
  backgroundColor: "var(--bg-card)",
};

export function BookingForm({ providerId, providerName, isGuest, isSelf }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(createBooking, initialState);
  const [submitted, setSubmitted] = useState(false);

  // Today's date string YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split("T")[0];

  /* ── Guest prompt ──────────────────────────────────────────────────── */
  if (isGuest) {
    return (
      <div
        className="rounded-xl px-5 py-6 text-center flex flex-col gap-3"
        style={{ backgroundColor: "var(--bg-muted)", border: "1px dashed var(--border-medium)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Sign in to request an appointment with {providerName.split(" ")[0]}
        </p>
        <Link href="/auth/sign-in" className="btn btn-primary mx-auto text-sm" id="booking-signin-link">
          Sign In to Book
        </Link>
      </div>
    );
  }

  /* ── Provider viewing their own profile ────────────────────────────── */
  if (isSelf) {
    return (
      <div
        className="rounded-xl px-4 py-4 text-center text-xs font-medium"
        style={{ backgroundColor: "var(--bg-muted)", color: "var(--text-muted)" }}
      >
        This is your provider profile. You cannot book your own service.
      </div>
    );
  }

  /* ── Booking submitted successfully ───────────────────────────────── */
  if (state.success || submitted) {
    return (
      <div
        className="rounded-xl p-5 text-center flex flex-col gap-3"
        style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
      >
        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-lg">
          ✓
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#15803d" }}>
            Booking Request Sent!
          </p>
          <p className="text-xs mt-1" style={{ color: "#166534" }}>
            {providerName.split(" ")[0]} has received your request and will review it shortly.
          </p>
        </div>
        <div className="flex justify-center gap-2 mt-1">
          <Link href="/dashboard" className="btn btn-primary text-xs py-1.5 px-3">
            View in Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="btn btn-outline text-xs py-1.5 px-3"
          >
            Book Another Date
          </button>
        </div>
      </div>
    );
  }

  /* ── Booking Form ─────────────────────────────────────────────────── */
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="providerId" value={providerId} />

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

      {/* Preferred Date */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="booking-date"
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Preferred Date <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          id="booking-date"
          name="date"
          type="date"
          required
          min={today}
          className={inputBase}
          style={inputStyle}
        />
      </div>

      {/* Service Notes */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="booking-notes"
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Service Details / Issue{" "}
          <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
            (optional)
          </span>
        </label>
        <textarea
          id="booking-notes"
          name="notes"
          rows={3}
          placeholder="Briefly describe what needs fixing or specific requirements..."
          className={inputBase}
          style={inputStyle}
          maxLength={500}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        id="submit-booking-btn"
        disabled={isPending}
        className="btn btn-primary w-full py-2.5 mt-1"
      >
        {isPending ? "Sending Request..." : "Request Booking"}
      </button>
    </form>
  );
}
