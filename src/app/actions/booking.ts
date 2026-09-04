"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type BookingActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Server action: submits a booking request to a service provider.
 * - Requires user to be authenticated.
 * - Prevents booking yourself.
 * - Validates date and provider existence.
 */
export async function createBooking(
  _prevState: BookingActionResult,
  formData: FormData
): Promise<BookingActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "You must be logged in to request a booking." };
  }

  const providerId = (formData.get("providerId") as string)?.trim();
  const dateStr = (formData.get("date") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!providerId) {
    return { success: false, error: "Invalid provider." };
  }

  if (!dateStr) {
    return { success: false, error: "Please select a date for the service." };
  }

  const bookingDate = new Date(dateStr);
  if (isNaN(bookingDate.getTime())) {
    return { success: false, error: "Please enter a valid date." };
  }

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { id: true, userId: true },
  });

  if (!provider) {
    return { success: false, error: "Provider not found." };
  }

  if (provider.userId === session.user.id) {
    return { success: false, error: "You cannot book your own service." };
  }

  try {
    await prisma.booking.create({
      data: {
        userId: session.user.id,
        providerId,
        date: bookingDate,
        notes,
        status: "PENDING",
      },
    });
  } catch (err) {
    console.error("[createBooking]", err);
    return { success: false, error: "Failed to submit booking request. Please try again." };
  }

  revalidatePath(`/providers/${providerId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server action: provider approves or denies an incoming booking request.
 * - Requires user to be authenticated.
 * - Ensures the caller is the provider who received the booking.
 */
export async function updateBookingStatus(
  bookingId: string,
  status: "APPROVED" | "DENIED"
): Promise<BookingActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "You must be logged in to update booking status." };
  }

  if (status !== "APPROVED" && status !== "DENIED") {
    return { success: false, error: "Invalid status update." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: true },
  });

  if (!booking) {
    return { success: false, error: "Booking request not found." };
  }

  if (booking.provider.userId !== session.user.id) {
    return { success: false, error: "Unauthorized: You are not the provider for this booking." };
  }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  } catch (err) {
    console.error("[updateBookingStatus]", err);
    return { success: false, error: "Failed to update booking status. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
