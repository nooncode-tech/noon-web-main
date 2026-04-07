import { getAuthenticatedViewer, type AuthenticatedViewer } from "@/lib/auth/session";

export type ReviewAccessReason =
  | "sign_in_required"
  | "not_allowed"
  | "not_configured";

export type ReviewPageAccess =
  | { authorized: true; viewer: AuthenticatedViewer }
  | { authorized: false; reason: ReviewAccessReason; viewer: AuthenticatedViewer | null };

export type ReviewRequestAccess =
  | {
      authorized: true;
      via: "session" | "secret";
      actor: string;
      viewer: AuthenticatedViewer | null;
    }
  | {
      authorized: false;
      reason: ReviewAccessReason;
      viewer: AuthenticatedViewer | null;
    };

function parseAllowedReviewEmails(): Set<string> {
  const raw = process.env.REVIEW_ALLOWED_EMAILS ?? "";
  return new Set(
    raw
      .split(/[\s,;]+/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isReviewAuthorizationConfigured(): boolean {
  return parseAllowedReviewEmails().size > 0;
}

export function isReviewTeamMember(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;

  const allowed = parseAllowedReviewEmails();
  if (allowed.size === 0) {
    return process.env.NODE_ENV !== "production";
  }

  return allowed.has(normalized);
}

export async function getReviewPageAccess(): Promise<ReviewPageAccess> {
  const viewer = await getAuthenticatedViewer();

  if (!viewer) {
    return { authorized: false, reason: "sign_in_required", viewer: null };
  }

  if (isReviewTeamMember(viewer.email)) {
    return { authorized: true, viewer };
  }

  return {
    authorized: false,
    reason: isReviewAuthorizationConfigured() ? "not_allowed" : "not_configured",
    viewer,
  };
}

export async function getReviewRequestAccess(
  request: Request,
): Promise<ReviewRequestAccess> {
  const secret = process.env.REVIEW_API_SECRET?.trim();
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader === `Bearer ${secret}`) {
    return {
      authorized: true,
      via: "secret",
      actor: "system",
      viewer: null,
    };
  }

  const viewer = await getAuthenticatedViewer();
  if (!viewer) {
    return { authorized: false, reason: "sign_in_required", viewer: null };
  }

  if (isReviewTeamMember(viewer.email)) {
    return {
      authorized: true,
      via: "session",
      actor: viewer.email,
      viewer,
    };
  }

  return {
    authorized: false,
    reason: isReviewAuthorizationConfigured() ? "not_allowed" : "not_configured",
    viewer,
  };
}
