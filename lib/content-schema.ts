export type ProjectFrontmatter = {
  title: string;
  slug: string;
  description: string;
  tech: string[];
  primaryTech?: string;
  status?: "active" | "done" | "wip";
  highlights?: string[];
  relatedPost?: string;
  github?: string;
  demo?: string;
  displayMode: "iframe" | "screenshot" | "readme";
  screenshot?: string;
  featured?: boolean;
  date: string;
};

export type BlogFrontmatter = {
  title: string;
  slug: string;
  date: string;
  tags: string[];
  description: string;
  readTime?: number;
};

export type ResumeData = {
  summary: string;
  skillRatings: Array<{
    label: string;
    value: number;
  }>;
  platforms: string[];
  toolkit: string[];
  certificates: Array<{
    title: string;
    badge: string;
    note: string;
    href: string;
  }>;
  interests: string[];
  education: {
    degree: string;
    school: string;
    years: string;
    concentration?: string;
    highlights?: string[];
  };
  experience: Array<{
    company: string;
    role: string;
    start: string;
    end: string;
    bullets: string[];
  }>;
};
