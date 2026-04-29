import home from "@/content/home.json";

type HomeDashboardContent = {
  ticker: {
    label: string;
    items: string[];
  };
  stats: Array<{
    value: string;
    label: string;
  }>;
  projects: {
    items: Array<{
      index: string;
      title: string;
      status: "active" | "done" | "wip";
      description: string;
      tags: string[];
    }>;
  };
  posts: {
    items: Array<{
      date: string;
      meta: string;
      title: string;
      description: string;
      tags: string[];
    }>;
  };
  resume: {
    role: string;
    company: string;
    tenure: string;
    summary: string;
    skills: Array<{
      label: string;
      value: number;
    }>;
  };
  contact: {
    methods: Array<{
      label: string;
      value: string;
    }>;
    availability: Array<{
      label: string;
      tone: "open" | "neutral" | "closed";
    }>;
  };
};

export const homeDashboard = home as HomeDashboardContent;
