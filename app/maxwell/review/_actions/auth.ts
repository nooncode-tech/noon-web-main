"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "noon_review_token";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function loginAction(formData: FormData) {
  const token = formData.get("token")?.toString().trim() ?? "";
  const secret = process.env.REVIEW_API_SECRET;

  if (!secret || token !== secret) {
    redirect("/maxwell/review?error=invalid");
  }

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/maxwell/review",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect("/maxwell/review");
}

export async function isReviewAuthorized(): Promise<boolean> {
  const secret = process.env.REVIEW_API_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === secret;
}
