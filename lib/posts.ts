import { supabase, getSupabaseAdmin } from "@/lib/supabase";

export type Category = "poem" | "novel" | "essay" | "note";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "essay", label: "Essay" },
  { value: "poem", label: "Poem" },
  { value: "novel", label: "Chapter" },
  { value: "note", label: "Note" },
];

export type PostMeta = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  coverImage: string;
  author: string;
  category: Category;
  publishedAt: string;
  readingTime: string;
};

export type Post = PostMeta & {
  contentHtml: string;
};

export const PAGE_SIZE = 10;

function estimateReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function toMeta(row: any): PostMeta {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title ?? "Untitled",
    summary: row.summary ?? "",
    coverImage: row.cover_image || "",
    author: row.author || "Anonymous",
    category: (row.category as Category) ?? "essay",
    publishedAt: row.published_at,
    readingTime: estimateReadingTime(row.content_html ?? ""),
  };
}

// Newest-first, paginated. page is 1-indexed.
export async function getPosts(
  page = 1,
  category?: Category,
): Promise<{ posts: PostMeta[]; total: number; totalPages: number }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    posts: (data ?? []).map(toMeta),
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return { ...toMeta(data), contentHtml: data.content_html ?? "" };
}

export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("slug")
    .eq("published", true);
  if (error) throw error;
  return (data ?? []).map((r) => r.slug);
}

// Returns the post published just before and just after the given post
// (by publish date), for the "previous entry / next entry" page-turn nav.
export async function getAdjacentPosts(
  publishedAt: string,
): Promise<{ older: PostMeta | null; newer: PostMeta | null }> {
  const [olderRes, newerRes] = await Promise.all([
    supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .lt("published_at", publishedAt)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .gt("published_at", publishedAt)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    older: olderRes.data ? toMeta(olderRes.data) : null,
    newer: newerRes.data ? toMeta(newerRes.data) : null,
  };
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Full-text search across title, summary, and content (weighted in that order —
// see search_vector in supabase/schema.sql). Empty/short queries return nothing.
export async function searchPosts(
  query: string,
  page = 1,
): Promise<{ posts: PostMeta[]; total: number; totalPages: number }> {
  const q = query.trim();
  if (q.length < 2) return { posts: [], total: 0, totalPages: 1 };

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // websearch_to_tsquery understands plain search phrases (quotes, "OR", "-word", etc.)
  const tsQuery = q
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");

  const { data, error, count } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("published", true)
    .textSearch("search_vector", tsQuery, { config: "english" }) // no `type` — we already built raw tsquery syntax above
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("searchPosts error:", error.message);
    return { posts: [], total: 0, totalPages: 1 };
  }

  const total = count ?? 0;
  return {
    posts: (data ?? []).map(toMeta),
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export type ArchiveGroup = {
  year: number;
  month: number;
  label: string;
  count: number;
  categories: Partial<Record<Category, number>>;
};

// Groups all published posts by year+month, newest first — powers /archive.
export async function getArchiveGroups(): Promise<ArchiveGroup[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("published_at, category")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  const groups = new Map<string, ArchiveGroup>();
  for (const row of data) {
    const d = new Date(row.published_at);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed
    const key = `${year}-${month}`;
    if (!groups.has(key)) {
      groups.set(key, {
        year,
        month,
        label: d.toLocaleString("en-US", { month: "long", year: "numeric" }),
        count: 0,
        categories: {},
      });
    }
    const group = groups.get(key)!;
    group.count += 1;
    const category = row.category as Category;
    group.categories[category] = (group.categories[category] ?? 0) + 1;
  }

  return [...groups.values()];
}

// Posts published in a specific year+month, newest first, paginated.
export async function getPostsByMonth(
  year: number,
  month: number, // 0-indexed
  page = 1,
): Promise<{ posts: PostMeta[]; total: number; totalPages: number }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const start = new Date(year, month, 1).toISOString();
  const end = new Date(year, month + 1, 1).toISOString();

  const { data, error, count } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("published", true)
    .gte("published_at", start)
    .lt("published_at", end)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("getPostsByMonth error:", error.message);
    return { posts: [], total: 0, totalPages: 1 };
  }

  const total = count ?? 0;
  return {
    posts: (data ?? []).map(toMeta),
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

// All published posts, for the RSS feed — no pagination needed, capped at a sane limit.
export async function getPostsForFeed(limit = 50): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => ({
    ...toMeta(row),
    contentHtml: row.content_html ?? "",
  }));
}

// ─────────────────────────────────────────────────────────────
// Admin-only functions below. These use the service-role client
// and must only ever be called from server code that has already
// checked isAuthed() (see app/api/admin/*/route.ts).
// ─────────────────────────────────────────────────────────────

export async function adminGetAllPosts(page = 1) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const admin = getSupabaseAdmin();
  const { data, error, count } = await admin
    .from("posts")
    .select("*", { count: "exact" })
    .order("published_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return {
    posts: (data ?? []).map(toMeta).map((m, i) => ({
      ...m,
      published: data![i].published as boolean,
    })),
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  };
}

export async function adminGetPost(id: number) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertPost(input: {
  id?: number;
  slug: string;
  title: string;
  summary: string;
  contentHtml: string;
  coverImage: string;
  author: string;
  category: Category;
  published: boolean;
}) {
  const admin = getSupabaseAdmin();
  const payload = {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    content_html: input.contentHtml,
    cover_image: input.coverImage,
    author: input.author || "You",
    category: input.category,
    published: input.published,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await admin
      .from("posts")
      .update(payload)
      .eq("id", input.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await admin
      .from("posts")
      .insert({ ...payload, published_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function adminDeletePost(id: number) {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("posts").delete().eq("id", id);
  if (error) throw error;
}
