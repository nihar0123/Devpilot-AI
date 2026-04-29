import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateUserOrg } from "../context/route";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, website } = body;

  const { org, role } = await getOrCreateUserOrg(
    session.user.id,
    session.user.name || "",
    session.user.email || ""
  );

  if (role !== "OWNER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const updated = await prisma.organization.update({
    where: { id: org.id },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(website !== undefined && { website }),
    },
  });

  return NextResponse.json({ success: true, organization: updated });
}
