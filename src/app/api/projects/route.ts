import { NextResponse } from "next/server";
import { getProjects } from "@/lib/server/data";

export async function GET() {
  return NextResponse.json(await getProjects());
}
