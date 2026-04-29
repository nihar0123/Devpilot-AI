import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  const body = await req.json();
  const { memberId } = await params;
  return NextResponse.json({ id: memberId, ...body, success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  return NextResponse.json({ id: memberId, removed: true });
}
