import { NextResponse } from "next/server";
import { loadProjectDocument } from "@/lib/os/loaders";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const project = await loadProjectDocument(slug);

  if (!project) {
    return NextResponse.json(
      {
        error: "Project not found."
      },
      { status: 404 }
    );
  }

  return NextResponse.json(project);
}
