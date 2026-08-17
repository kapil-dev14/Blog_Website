// One-time migration: moves your existing content/posts/*.md files into Supabase.
// Run once, after filling in .env.local (needs SUPABASE_SERVICE_ROLE_KEY too):
//
//   node --env-file=.env.local scripts/migrate-posts.mjs
//
// (Node 20.6+ required for --env-file. On older Node, `npm i -D dotenv` and add
// `import "dotenv/config";` as the first line of this file instead.)
//
// Safe to re-run — it skips any slug that already exists in the posts table.

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const postsDir = path.join(process.cwd(), "content/posts");

async function main() {
  if (!fs.existsSync(postsDir)) {
    console.log("No content/posts folder found — nothing to migrate.");
    return;
  }

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    console.log("No .md files found — nothing to migrate.");
    return;
  }

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data, content } = matter(raw);

    const { data: existing } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      console.log(`Skipping "${slug}" — already exists in Supabase.`);
      continue;
    }

    const processed = await remark().use(remarkGfm).use(html).process(content);

    const { error } = await supabase.from("posts").insert({
      slug,
      title: data.title ?? "Untitled",
      summary: data.summary ?? "",
      content_html: processed.toString(),
      cover_image: data.coverImage ?? "",
      author: data.author ?? "You",
      category: "essay",
      published: true,
      published_at: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    });

    if (error) {
      console.error(`Failed to migrate "${slug}":`, error.message);
    } else {
      console.log(`Migrated "${slug}" ✓`);
    }
  }

  console.log("\nDone. You can now delete the content/posts folder if you like —");
  console.log("new posts are written from /admin from here on.");
}

main();
