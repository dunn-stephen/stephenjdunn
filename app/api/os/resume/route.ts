import { NextResponse } from "next/server";
import { loadResume } from "@/lib/os/loaders";

export async function GET() {
  return NextResponse.json(await loadResume());
}
