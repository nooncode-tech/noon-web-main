import { NextResponse } from "next/server";
import { getReviewRequestAccess } from "@/lib/auth/review";
import {
  getProposalRequest,
  getStudioSession,
} from "@/lib/maxwell/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await getReviewRequestAccess(request);
  if (!access.authorized) {
    const status = access.reason === "sign_in_required" ? 401 : 403;
    return NextResponse.json({ message: "Unauthorized." }, { status });
  }

  const { searchParams } = new URL(request.url);
  const proposalRequestId = searchParams.get("id");

  if (!proposalRequestId) {
    return NextResponse.json(
      { message: "Missing required query parameter: id" },
      { status: 400 }
    );
  }

  const proposal = await getProposalRequest(proposalRequestId);
  if (!proposal) {
    return NextResponse.json({ message: "Proposal request not found." }, { status: 404 });
  }

  const session = await getStudioSession(proposal.studioSessionId);

  return NextResponse.json({
    proposal_request: proposal,
    session: session ?? null,
  });
}

export async function POST(request: Request) {
  const access = await getReviewRequestAccess(request);
  if (!access.authorized) {
    const status = access.reason === "sign_in_required" ? 401 : 403;
    return NextResponse.json({ message: "Unauthorized." }, { status });
  }

  return NextResponse.json(
    {
      message: "Proposal review is handled in Noon App. Website review mutations are disabled.",
      code: "NOON_APP_REVIEW_REQUIRED",
    },
    { status: 409 },
  );
}
