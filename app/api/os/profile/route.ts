import { NextResponse } from "next/server";
import { loadProfile } from "@/lib/os/loaders";

export async function GET() {
  return NextResponse.json(await loadProfile());
}
