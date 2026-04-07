import { auth, isGoogleAuthConfigured } from "@/auth";

export type AuthenticatedViewer = {
  email: string;
  name: string | null;
  image: string | null;
};

export async function getAuthenticatedViewer(): Promise<AuthenticatedViewer | null> {
  if (!isGoogleAuthConfigured()) return null;

  const session = await auth();
  const user = session?.user;
  const email = user?.email?.trim().toLowerCase();
  if (!email) return null;

  return {
    email,
    name: user?.name?.trim() ?? null,
    image: user?.image?.trim() ?? null,
  };
}
