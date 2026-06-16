import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Returns the signed-in user (id + profile) for use in route handlers, or null.
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
