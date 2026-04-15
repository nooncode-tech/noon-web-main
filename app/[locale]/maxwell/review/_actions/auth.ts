"use server";

import { getReviewPageAccess } from "@/lib/auth/review";

export { getReviewPageAccess };

export async function isReviewAuthorized(): Promise<boolean> {
  const access = await getReviewPageAccess();
  return access.authorized;
}
