import { readFile } from "node:fs/promises";
import path from "node:path";

export async function getReadMeContent() {
  return readFile(path.join(process.cwd(), "content", "read-me.mdx"), "utf8");
}
