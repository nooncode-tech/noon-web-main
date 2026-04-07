export function viewerOwnsStudioSession(
  viewer: { email: string },
  session: { ownerEmail: string | null },
) {
  return Boolean(
    session.ownerEmail &&
      viewer.email.toLowerCase() === session.ownerEmail.toLowerCase(),
  );
}
