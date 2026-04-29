import { NextResponse } from "next/server";
import { loadPostDocument } from "@/lib/os/loaders";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const post = await loadPostDocument(slug);

  if (!post) {
    return NextResponse.json(
      {
        error: "Post not found."
      },
      { status: 404 }
    );
  }

  return NextResponse.json(post);
}
