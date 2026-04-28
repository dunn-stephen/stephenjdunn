import type { BlogPayload, PostDocumentPayload, ProfilePayload, ProjectDocumentPayload, ProjectsPayload, ResumePayload } from "@/lib/os/types";

async function fetchJson<T>(input: string): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Ignore parse failure and keep the default message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const osApi = {
  profile: () => fetchJson<ProfilePayload>("/api/os/profile"),
  resume: () => fetchJson<ResumePayload>("/api/os/resume"),
  projects: () => fetchJson<ProjectsPayload>("/api/os/projects"),
  project: (slug: string) => fetchJson<ProjectDocumentPayload>(`/api/os/projects/${slug}`),
  posts: () => fetchJson<BlogPayload>("/api/os/blog"),
  post: (slug: string) => fetchJson<PostDocumentPayload>(`/api/os/blog/${slug}`)
};
