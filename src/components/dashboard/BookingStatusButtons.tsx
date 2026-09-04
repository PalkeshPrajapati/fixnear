"use client";

import { useTransition, useState } from "react";
import { updateBookingStatus } from "@/app/actions/booking";

export function BookingStatusButtons({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = (status: "APPROVED" | "DENIED") => {
    setError(null);
    startTransition(async () => {
      const res = await updateBookingStatus(bookingId, status);
      if (!res.success) {
        setError(res.error || "Failed to update status.");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("APPROVED")}
          className="btn text-xs py-1.5 px-3 rounded-lg font-medium text-white transition-opacity"
          style={{
            backgroundColor: "#16a34a",
            opacity: isPending ? 0.6 : 1,
          }}
          title="Approve this booking request"
        >
          {isPending ? "Updating..." : "Approve"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("DENIED")}
          className="btn text-xs py-1.5 px-3 rounded-lg font-medium transition-opacity"
          style={{
            backgroundColor: "transparent",
            color: "#dc2626",
            border: "1px solid #fca5a5",
            opacity: isPending ? 0.6 : 1,
          }}
          title="Deny this booking request"
        >
          Deny
        </button>
      </div>

      {error && (
        <span className="text-xs text-red-600 font-medium">{error}</span>
      )}
    </div>
  );
}
