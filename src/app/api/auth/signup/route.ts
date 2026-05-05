import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "This email is already registered." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name || email.split("@")[0],
      email,
      passwordHash,
    },
  });

  const slugBase = user.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "workspace";
  const slug = `${slugBase}-${user.id.slice(0, 6)}`;

  const org = await prisma.organization.create({
    data: {
      name: `${user.name}'s workspace`,
      slug,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
      subscription: {
        create: {
          plan: "FREE",
          status: "ACTIVE",
        },
      },
      projects: {
        create: {
          userId: user.id,
          name: "Getting started project",
        },
      },
    },
  });

  return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name }, organization: { id: org.id, name: org.name } }, { status: 201 });
}
