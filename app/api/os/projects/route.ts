import { NextResponse } from "next/server";
import { loadProjects } from "@/lib/os/loaders";

export async function GET() {
  return NextResponse.json(await loadProjects());
}
