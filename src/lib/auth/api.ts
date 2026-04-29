import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function requireApiSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
