import type { Metadata } from "next";
import {
  getRouteMetadata,
  getStaticRouteParams,
  renderRouteContent
} from "@/components/views/RouteContent";

type CatchAllPageProps = {
  params: Promise<{ slug: string[] }>;
};

export function generateStaticParams() {
  return getStaticRouteParams();
}

export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
  const { slug } = await params;
  return getRouteMetadata(slug);
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  return renderRouteContent(slug);
}
