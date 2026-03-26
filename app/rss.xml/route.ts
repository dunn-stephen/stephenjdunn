import { getAllPosts } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const items = getAllPosts()
    .map(
      (post) => `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>https://${siteConfig.domain}/blog/${post.slug}</link>
          <guid>https://${siteConfig.domain}/blog/${post.slug}</guid>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <description><![CDATA[${post.description}]]></description>
        </item>
      `
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${siteConfig.name}</title>
        <link>https://${siteConfig.domain}</link>
        <description>${siteConfig.description}</description>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}
