"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type ReviewActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Server action: submits a review for a provider.
 * - Validates the user is authenticated and not reviewing themselves.
 * - Prevents duplicate reviews (one per user per provider).
 * - Validates rating is 1–5.
 */
export async function submitReview(
  _prevState: ReviewActionResult,
  formData: FormData
): Promise<ReviewActionResult> {
  // 1. Auth guard
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "You must be logged in to leave a review." };
  }

  // 2. Parse inputs
  const providerId = (formData.get("providerId") as string)?.trim();
  const ratingRaw = formData.get("rating") as string;
  const comment = (formData.get("comment") as string)?.trim() || null;

  if (!providerId) return { success: false, error: "Invalid provider." };

  const rating = parseInt(ratingRaw, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Please select a rating between 1 and 5." };
  }

  // 3. Make sure provider exists
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { id: true, userId: true },
  });
  if (!provider) return { success: false, error: "Provider not found." };

  // 4. Prevent self-review
  if (provider.userId === session.user.id) {
    return { success: false, error: "You cannot review yourself." };
  }

  // 5. Prevent duplicate review
  const existing = await prisma.review.findFirst({
    where: { userId: session.user.id, providerId },
  });
  if (existing) {
    return { success: false, error: "You have already reviewed this provider." };
  }

  // 6. Create review
  try {
    await prisma.review.create({
      data: {
        userId: session.user.id,
        providerId,
        rating,
        comment,
      },
    });
  } catch (err) {
    console.error("[submitReview]", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/providers/${providerId}`);
  return { success: true };
}
