import type { Route } from "next";
import profile from "@/content/profile.json";

export type ProfileData = {
  name: string;
  domain: string;
  description: string;
  initials: string;
  sidebar: {
    name: string;
    role: string;
    company: string;
  };
  hero: {
    eyebrow: string;
    subtitle: string;
    ascii: string;
  };
  socialLinks: {
    github: string;
    linkedin: string;
    email: string;
    apolloLabs: string;
  };
  home: {
    currentRole: {
      title: string;
      subtitle: string;
    };
    sideProject: {
      title: string;
      subtitle: string;
    };
    specialties: string[];
    hint: string;
  };
  contact: {
    availability: Array<{
      label: string;
      tone: "open" | "neutral" | "closed";
    }>;
    quickMessageSubject: string;
  };
  resume: {
    pdfPath: string | null;
  };
};

export const profileData = profile as ProfileData;

export const siteConfig = {
  name: profileData.name,
  domain: profileData.domain,
  description: profileData.description,
  socialLinks: profileData.socialLinks
} as const;

export const primaryRoutes = [
  {
    href: "/" as Route,
    key: "home",
    label: "HOME",
    number: "01",
    hotkey: "1",
    paletteGlyph: "■"
  },
  {
    href: "/projects" as Route,
    key: "projects",
    label: "PROJECTS",
    number: "02",
    hotkey: "2",
    paletteGlyph: "◆"
  },
  {
    href: "/resume" as Route,
    key: "resume",
    label: "RESUME",
    number: "03",
    hotkey: "3",
    paletteGlyph: "▤"
  },
  {
    href: "/blog" as Route,
    key: "blog",
    label: "BLOG",
    number: "04",
    hotkey: "4",
    paletteGlyph: "▦"
  },
  {
    href: "/contact" as Route,
    key: "contact",
    label: "CONTACT",
    number: "05",
    hotkey: "5",
    paletteGlyph: "✉"
  }
] as const;

export type PrimaryRoute = (typeof primaryRoutes)[number];

export function getActivePrimaryRoute(pathname: string): PrimaryRoute {
  if (pathname.startsWith("/projects")) {
    return primaryRoutes[1];
  }

  if (pathname.startsWith("/resume")) {
    return primaryRoutes[2];
  }

  if (pathname.startsWith("/blog")) {
    return primaryRoutes[3];
  }

  if (pathname.startsWith("/contact")) {
    return primaryRoutes[4];
  }

  return primaryRoutes[0];
}

export function getSectionState(pathname: string): {
  title: string;
  breadcrumb?: {
    href: Route;
    label: string;
  };
} {
  if (pathname.startsWith("/projects/")) {
    return {
      title: "DETAIL",
      breadcrumb: {
        href: "/projects" as Route,
        label: "Projects"
      }
    };
  }

  if (pathname.startsWith("/blog/")) {
    return {
      title: "POST",
      breadcrumb: {
        href: "/blog" as Route,
        label: "Blog"
      }
    };
  }

  return {
    title: getActivePrimaryRoute(pathname).label
  };
}

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

export function buildMailtoLink(subject: string, body?: string) {
  const [base] = siteConfig.socialLinks.email.split("?");
  const params = new URLSearchParams();

  if (subject) {
    params.set("subject", subject);
  }

  if (body) {
    params.set("body", body);
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}
