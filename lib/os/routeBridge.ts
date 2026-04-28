import { createCanonicalWindow } from "@/lib/os/appRegistry";
import { getLaunchIntent } from "@/lib/os/launchIntent";
import type { WindowInit } from "@/lib/os/types";

export function windowInitFromPathname(pathname: string): WindowInit | null {
  const intent = getLaunchIntent(pathname);

  if (!intent?.appId) {
    return null;
  }

  return createCanonicalWindow(intent.appId, intent.route, {
    slug: intent.slug
  });
}
