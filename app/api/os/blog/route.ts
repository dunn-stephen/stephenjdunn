import { NextResponse } from "next/server";
import { loadPosts } from "@/lib/os/loaders";

export async function GET() {
  return NextResponse.json(await loadPosts());
}
