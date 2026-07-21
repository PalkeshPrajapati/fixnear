"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Server action: registers the current user as a service provider.
 * Creates a Provider record and updates User.role to PROVIDER in one transaction.
 * Designed to be used with React 19's useActionState hook.
 */
export async function becomeProvider(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // 1. Authenticate server-side — never trust client state
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "You must be logged in to do this." };
  }

  // 2. Idempotency guard — prevent double-submission
  const existing = await prisma.provider.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return { success: false, error: "You are already registered as a provider." };
  }

  // 3. Parse and validate form data
  const phone = (formData.get("phone") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim() || null;
  const experienceRaw = (formData.get("experience") as string)?.trim();
  const experience =
    experienceRaw !== "" && !isNaN(Number(experienceRaw))
      ? parseInt(experienceRaw, 10)
      : null;
  const categoryIds = formData.getAll("categoryIds") as string[];

  if (!phone) return { success: false, error: "Phone number is required." };
  if (!location) return { success: false, error: "Location / service area is required." };
  if (categoryIds.length === 0) {
    return { success: false, error: "Please select at least one service category." };
  }

  // 4. Create Provider + promote User role in one atomic transaction
  try {
    await prisma.$transaction([
      prisma.provider.create({
        data: {
          userId: session.user.id,
          phone,
          location,
          bio,
          experience,
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { role: "PROVIDER" },
      }),
    ]);
  } catch (err) {
    console.error("[becomeProvider]", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // 5. Re-render the dashboard page in the same response round-trip
  revalidatePath("/dashboard");
  return { success: true };
}
