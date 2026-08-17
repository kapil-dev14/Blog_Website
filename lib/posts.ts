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

const PAGE_SIZE = 10;

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
  category?: Category
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

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  const { data, error } = await admin.from("posts").select("*").eq("id", id).maybeSingle();
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
